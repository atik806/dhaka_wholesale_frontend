"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Save, LogOut, Loader2, MapPin, ChevronDown, ChevronUp, Package, BookOpen } from "lucide-react";
import { useAuthStore, useAuthHydrated } from "@/src/store/useAuthStore";
import { updateProfile, fetchUserOrders, type ShippingAddress, type UserOrder } from "@/src/lib/auth-api";
import { formatPrice, formatDate } from "@/src/lib/utils";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

export default function AccountPage() {
  const router = useRouter();
  const { user, session, logout, updateUser } = useAuthStore();
  const hydrated = useAuthHydrated();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [addr, setAddr] = useState<ShippingAddress>(
    user?.shipping_address ?? {
      firstName: "", lastName: "", email: "", phone: "",
      address: "", city: "", zipCode: "",
    }
  );
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMessage, setAddrMessage] = useState("");
  const [addrError, setAddrError] = useState("");
  const [addrOpen, setAddrOpen] = useState(false);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login?redirect=/account");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let active = true;
    setOrdersLoading(true);
    fetchUserOrders()
      .then((data) => { if (active) { setOrders(data); setOrdersLoading(false); } })
      .catch((err) => { if (active) { setOrdersError(err instanceof Error ? err.message : "Failed to load orders"); setOrdersLoading(false); } });
    return () => { active = false; };
  }, [hydrated, user]);

  if (!hydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#FBF6EC] dark:bg-[#0D1F2C]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5A300]" />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await updateProfile(session.access_token, { name, phone: phone || undefined });
      updateUser({ name: updated.name, phone: updated.phone, avatar_url: updated.avatar_url });
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setAddrSaving(true);
    setAddrMessage("");
    setAddrError("");
    try {
      const updated = await updateProfile(session.access_token, { shipping_address: addr });
      updateUser({ shipping_address: updated.shipping_address });
      setAddrMessage("Shipping address saved");
    } catch (err) {
      setAddrError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setAddrSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const hasAddress = user.shipping_address?.address;

  return (
    <div className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen">
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d] py-10 md:py-14">
        <div className="container">
          <Breadcrumbs items={[{ label: "Account" }]} />
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
            <BookOpen className="w-3.5 h-3.5" /> MY ACCOUNT
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold">
            My Account
          </h1>
          <p className="font-mono text-xs text-[#E7DCC4]/80 mt-2">
            Manage your profile and order history
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-[2px] bg-[#132A3A] flex items-center justify-center border border-[#E7DCC4] dark:border-[#2a3d4d]">
                  <User className="w-8 h-8 text-[#F5A300]" />
                </div>
                <div>
                  <p className="font-serif font-bold text-[#132A3A] dark:text-[#E7DCC4]">
                    {user.name}
                  </p>
                  <p className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4]">
                    {user.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1.5">
                    <Mail className="w-3.5 h-3.5 inline mr-1.5 text-[#F5A300]" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#1C1A17]/50 dark:text-[#a0b4c4] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1.5">
                    <User className="w-3.5 h-3.5 inline mr-1.5 text-[#F5A300]" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1.5">
                    <Phone className="w-3.5 h-3.5 inline mr-1.5 text-[#F5A300]" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                  />
                </div>

                {message && (
                  <p className="font-mono text-xs font-bold text-[#1F6F50] bg-[#1F6F50]/10 rounded-[2px] border border-[#1F6F50]/30 px-4 py-2">
                    {message}
                  </p>
                )}
                {error && (
                  <p className="font-mono text-xs font-bold text-[#BE3D1F] bg-[#BE3D1F]/10 rounded-[2px] border border-[#BE3D1F]/30 px-4 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] dark:text-[#E7DCC4] rounded-[3px] font-mono text-xs font-extrabold uppercase tracking-wider border border-[#D88900] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] mb-6 shadow-sm">
              <button
                onClick={() => setAddrOpen(!addrOpen)}
                className="flex items-center justify-between w-full p-6 text-left hover:bg-[#FBF6EC] dark:bg-[#0D1F2C] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[2px] bg-[#132A3A] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#F5A300]" />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4]">
                      Shipping Address
                    </p>
                    <p className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4]">
                      {hasAddress
                        ? `${addr.address}, ${addr.city} ${addr.zipCode}`
                        : "No address saved yet"}
                    </p>
                  </div>
                </div>
                {addrOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#F5A300]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#F5A300]" />
                )}
              </button>

              {addrOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-6 pb-6"
                >
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1">First Name</label>
                        <input
                          type="text"
                          value={addr.firstName || ""}
                          onChange={(e) => setAddr({ ...addr, firstName: e.target.value })}
                          placeholder="John"
                          className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1">Last Name</label>
                        <input
                          type="text"
                          value={addr.lastName || ""}
                          onChange={(e) => setAddr({ ...addr, lastName: e.target.value })}
                          placeholder="Doe"
                          className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1">Email</label>
                        <input
                          type="email"
                          value={addr.email || ""}
                          onChange={(e) => setAddr({ ...addr, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1">Phone</label>
                        <input
                          type="tel"
                          value={addr.phone || ""}
                          onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                          placeholder="+880..."
                          className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1">Address</label>
                      <input
                        type="text"
                        value={addr.address || ""}
                        onChange={(e) => setAddr({ ...addr, address: e.target.value })}
                        placeholder="123 Main Street"
                        className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1">City</label>
                        <input
                          type="text"
                          value={addr.city || ""}
                          onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                          placeholder="Dhaka"
                          className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4] mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={addr.zipCode || ""}
                          onChange={(e) => setAddr({ ...addr, zipCode: e.target.value })}
                          placeholder="1205"
                          className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 font-mono text-xs outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
                        />
                      </div>
                    </div>

                    {addrMessage && (
                      <p className="font-mono text-xs font-bold text-[#1F6F50] bg-[#1F6F50]/10 rounded-[2px] border border-[#1F6F50]/30 px-4 py-2">
                        {addrMessage}
                      </p>
                    )}
                    {addrError && (
                      <p className="font-mono text-xs font-bold text-[#BE3D1F] bg-[#BE3D1F]/10 rounded-[2px] border border-[#BE3D1F]/30 px-4 py-2">
                        {addrError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={addrSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] dark:text-[#E7DCC4] rounded-[3px] font-mono text-xs font-extrabold uppercase tracking-wider border border-[#D88900] transition-colors disabled:opacity-50"
                    >
                      {addrSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {addrSaving ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                </motion.div>
              )}
            </div>

            <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                <Package className="w-5 h-5 text-[#F5A300]" />
                <h2 className="font-serif font-bold text-[#132A3A] dark:text-[#E7DCC4]">Order History</h2>
              </div>
              {ordersLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F5A300]" />
                </div>
              ) : ordersError ? (
                <p className="font-mono text-xs font-bold text-[#BE3D1F] bg-[#BE3D1F]/10 rounded-[2px] border border-[#BE3D1F]/30 px-4 py-3">{ordersError}</p>
              ) : orders.length === 0 ? (
                <p className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4] text-center py-6">No orders yet</p>
              ) : (
                <div className="divide-y divide-[#E7DCC4]">
                  {orders.map((order) => (
                    <div key={order.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider ${
                          order.status === "delivered" ? "bg-[#1F6F50]/10 text-[#1F6F50] border border-[#1F6F50]/30" :
                          order.status === "cancelled" ? "bg-[#BE3D1F]/10 text-[#BE3D1F] border border-[#BE3D1F]/30" :
                          order.status === "shipped" ? "bg-[#132A3A]/10 text-[#132A3A] dark:text-[#E7DCC4] border border-[#132A3A]/30" :
                          "bg-[#F5A300]/10 text-[#D88900] border border-[#F5A300]/30"
                        }`}>{order.status}</span>
                        <span className="font-mono text-sm font-bold text-[#1F6F50]">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4]">{formatDate(order.created_at)}</p>
                        <p className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4] capitalize">{order.payment_method.replace(/_/g, " ")}</p>
                      </div>
                      <div className="mt-1.5 font-mono text-[11px] text-[#1C1A17]/50 dark:text-[#a0b4c4]">
                        {order.order_items?.map((item) => item.product_name).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full justify-center px-5 py-2.5 rounded-[3px] font-mono text-xs font-bold uppercase tracking-wider text-[#BE3D1F] border-2 border-[#BE3D1F]/30 hover:bg-[#BE3D1F]/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
