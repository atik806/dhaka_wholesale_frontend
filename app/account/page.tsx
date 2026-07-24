"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Save,
  LogOut,
  Loader2,
  MapPin,
  ChevronDown,
  ChevronRight,
  Package,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore, useAuthHydrated } from "@/src/store/useAuthStore";
import { updateProfile, fetchUserOrders, type ShippingAddress, type UserOrder } from "@/src/lib/auth-api";
import { formatPrice, formatDate } from "@/src/lib/utils";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Card, CardHeader } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Skeleton } from "@/src/components/ui/Skeleton";

function OrderStatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const variant =
    s === "delivered"
      ? "success"
      : s === "cancelled"
        ? "sale"
        : s === "shipped"
          ? "info"
          : "low-stock";
  return (
    <Badge variant={variant} className="capitalize">
      {status || "pending"}
    </Badge>
  );
}

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
      <div className="flex items-center justify-center min-h-[60vh] bg-canvas">
        <Loader2 className="w-8 h-8 animate-spin text-accent" aria-label="Loading account" />
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
    <div className="bg-canvas min-h-screen overflow-x-hidden">
      <div className="container py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Account" }]} />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">My account</h1>
          <p className="text-[13px] text-muted mt-1">
            Manage your profile, delivery address and order history
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start"
        >
          <div className="lg:col-span-1 space-y-4 min-w-0">
            <Card>
              <div className="flex items-center gap-3.5 p-5 border-b border-line min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-full bg-brand flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-fg truncate">{user.name}</p>
                  <p className="text-[13px] text-muted break-all">{user.email}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                  hint="Email cannot be changed"
                />
                <Input
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="name"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                  autoComplete="tel"
                  hint="Used by couriers to reach you"
                />

                {message && (
                  <p className="text-[13px] font-medium text-success bg-success-soft border border-success/25 rounded-md px-3 py-2.5">
                    {message}
                  </p>
                )}
                {error && (
                  <p role="alert" className="text-[13px] font-medium text-danger bg-danger-soft border border-danger/25 rounded-md px-3 py-2.5">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={saving} disabled={saving} fullWidth>
                  {!saving && <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </Card>

            <Card>
              <button
                type="button"
                onClick={() => setAddrOpen(!addrOpen)}
                aria-expanded={addrOpen}
                className="flex items-center justify-between gap-3 w-full p-5 text-left hover:bg-surface-2 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-surface-2 border border-line flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-fg">Shipping address</p>
                    <p className="text-[13px] text-muted truncate">
                      {hasAddress
                        ? `${addr.address}, ${addr.city} ${addr.zipCode}`
                        : "No address saved yet"}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-subtle shrink-0 transition-transform ${addrOpen ? "rotate-180" : ""}`}
                />
              </button>

              {addrOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleSaveAddress} className="px-5 pb-5 pt-1 space-y-4 border-t border-line">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <Input
                        label="First name"
                        type="text"
                        value={addr.firstName || ""}
                        onChange={(e) => setAddr({ ...addr, firstName: e.target.value })}
                        placeholder="John"
                        autoComplete="given-name"
                      />
                      <Input
                        label="Last name"
                        type="text"
                        value={addr.lastName || ""}
                        onChange={(e) => setAddr({ ...addr, lastName: e.target.value })}
                        placeholder="Doe"
                        autoComplete="family-name"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        value={addr.email || ""}
                        onChange={(e) => setAddr({ ...addr, email: e.target.value })}
                        placeholder="john@example.com"
                        autoComplete="email"
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={addr.phone || ""}
                        onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                        placeholder="+880 1XXX-XXXXXX"
                        autoComplete="tel"
                      />
                    </div>
                    <Input
                      label="Street address"
                      type="text"
                      value={addr.address || ""}
                      onChange={(e) => setAddr({ ...addr, address: e.target.value })}
                      placeholder="House 12, Road 4, Dhanmondi"
                      autoComplete="street-address"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="City"
                        type="text"
                        value={addr.city || ""}
                        onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                        placeholder="Dhaka"
                        autoComplete="address-level2"
                      />
                      <Input
                        label="Postal code"
                        type="text"
                        inputMode="numeric"
                        value={addr.zipCode || ""}
                        onChange={(e) => setAddr({ ...addr, zipCode: e.target.value })}
                        placeholder="1205"
                        autoComplete="postal-code"
                      />
                    </div>

                    {addrMessage && (
                      <p className="text-[13px] font-medium text-success bg-success-soft border border-success/25 rounded-md px-3 py-2.5">
                        {addrMessage}
                      </p>
                    )}
                    {addrError && (
                      <p role="alert" className="text-[13px] font-medium text-danger bg-danger-soft border border-danger/25 rounded-md px-3 py-2.5">
                        {addrError}
                      </p>
                    )}

                    <Button type="submit" loading={addrSaving} disabled={addrSaving} fullWidth>
                      {!addrSaving && <Save className="w-4 h-4" />}
                      {addrSaving ? "Saving..." : "Save address"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </Card>

            <Button
              variant="outline"
              fullWidth
              onClick={handleLogout}
              className="text-danger border-danger/35 hover:bg-danger-soft hover:border-danger/60"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>

          <div className="lg:col-span-2 min-w-0">
            <Card>
              <CardHeader
                title="Order history"
                description={
                  ordersLoading
                    ? "Loading your orders…"
                    : orders.length > 0
                      ? `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed`
                      : undefined
                }
                action={<Package className="w-5 h-5 text-subtle shrink-0" />}
              />

              {ordersLoading ? (
                <div className="divide-y divide-line">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3.5 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : ordersError ? (
                <div className="p-5">
                  <p role="alert" className="flex items-start gap-2.5 text-[13px] font-medium text-danger bg-danger-soft border border-danger/25 rounded-md px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    {ordersError}
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-surface-2 border border-line flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-subtle" />
                  </div>
                  <p className="text-base font-bold text-fg mb-1">No orders yet</p>
                  <p className="text-[13px] text-muted mb-5">
                    When you place your first order it will show up here.
                  </p>
                  <Link
                    href="/shop"
                    className="text-[13px] font-semibold text-link hover:text-link-hover underline underline-offset-4"
                  >
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {orders.map((order) => {
                    const itemCount = (order.order_items || []).reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0,
                    );
                    return (
                      <li key={order.id}>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="group flex items-center gap-3 px-5 py-4 hover:bg-surface-2 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <OrderStatusBadge status={order.status} />
                              <span className="font-mono text-[12px] font-semibold text-muted tabular">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[13px] text-muted mt-1.5">
                              <span className="tabular">{formatDate(order.created_at)}</span>
                              <span className="mx-1.5 text-subtle">·</span>
                              <span className="tabular">{itemCount}</span>{" "}
                              {itemCount === 1 ? "item" : "items"}
                              {order.payment_method && (
                                <>
                                  <span className="mx-1.5 text-subtle">·</span>
                                  <span className="capitalize">
                                    {order.payment_method.replace(/_/g, " ")}
                                  </span>
                                </>
                              )}
                            </p>
                            {order.order_items?.length > 0 && (
                              <p className="text-[12px] text-subtle mt-1 line-clamp-1">
                                {order.order_items.map((item) => item.product_name).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="tabular text-[15px] font-bold text-price">
                              {formatPrice(order.total)}
                            </span>
                            <ChevronRight className="w-4 h-4 text-subtle group-hover:text-fg transition-colors" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
