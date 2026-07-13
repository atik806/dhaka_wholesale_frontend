"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Save, LogOut, Loader2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore, useAuthHydrated } from "@/src/store/useAuthStore";
import { updateProfile, type ShippingAddress } from "@/src/lib/auth-api";

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

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login?redirect=/account");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <div className="max-w-lg mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-2xl font-bold mb-1">My Account</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Manage your profile information
        </p>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary dark:text-primary-light" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {user.name}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <User className="w-3.5 h-3.5 inline mr-1.5" />
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            {message && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-4 py-2">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
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

        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 mb-6">
          <button
            onClick={() => setAddrOpen(!addrOpen)}
            className="flex items-center justify-between w-full p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary dark:text-primary-light" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Shipping Address
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {hasAddress
                    ? `${addr.address}, ${addr.city} ${addr.zipCode}`
                    : "No address saved yet"}
                </p>
              </div>
            </div>
            {addrOpen ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
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
                    <label className="block text-sm font-medium mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={addr.firstName || ""}
                      onChange={(e) => setAddr({ ...addr, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={addr.lastName || ""}
                      onChange={(e) => setAddr({ ...addr, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      value={addr.email || ""}
                      onChange={(e) => setAddr({ ...addr, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={addr.phone || ""}
                      onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                      placeholder="+880..."
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Address</label>
                  <input
                    type="text"
                    value={addr.address || ""}
                    onChange={(e) => setAddr({ ...addr, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City</label>
                    <input
                      type="text"
                      value={addr.city || ""}
                      onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                      placeholder="Dhaka"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">ZIP Code</label>
                    <input
                      type="text"
                      value={addr.zipCode || ""}
                      onChange={(e) => setAddr({ ...addr, zipCode: e.target.value })}
                      placeholder="10001"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                {addrMessage && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-4 py-2">
                    {addrMessage}
                  </p>
                )}
                {addrError && (
                  <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">
                    {addrError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={addrSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
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

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full justify-center px-5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
