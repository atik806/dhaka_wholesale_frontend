"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Truck,
  Ban,
} from "lucide-react";
import { useAuthStore, useAuthHydrated } from "@/src/store/useAuthStore";
import {
  fetchUserOrder,
  cancelUserOrder,
  type UserOrder,
} from "@/src/lib/auth-api";
import { formatPrice, formatDate, safeImage } from "@/src/lib/utils";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";

function statusClass(status: string) {
  if (status === "delivered") {
    return "bg-[#1F6F50]/10 text-[#1F6F50] border border-[#1F6F50]/30";
  }
  if (status === "cancelled") {
    return "bg-[#BE3D1F]/10 text-[#BE3D1F] border border-[#BE3D1F]/30";
  }
  if (status === "shipped") {
    return "bg-[#132A3A]/10 text-[#132A3A] dark:text-[#E7DCC4] border border-[#132A3A]/30 dark:border-[#2a3d4d]";
  }
  return "bg-[#F5A300]/10 text-[#D88900] border border-[#F5A300]/30";
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const [order, setOrder] = useState<UserOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/login?redirect=/account/orders/${id}`);
    }
  }, [hydrated, user, router, id]);

  useEffect(() => {
    if (!hydrated || !user || !id) return;
    let active = true;
    setLoading(true);
    setError("");
    fetchUserOrder(id)
      .then((data) => {
        if (active) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load order");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [hydrated, user, id]);

  const handleCancel = useCallback(async () => {
    if (!order || order.status !== "pending") return;
    const ok = window.confirm(
      "Cancel this pending order? This cannot be undone.",
    );
    if (!ok) return;
    setCancelling(true);
    setCancelError("");
    try {
      const updated = await cancelUserOrder(order.id);
      setOrder(updated);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  }, [order]);

  if (!hydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#FBF6EC] dark:bg-[#0D1F2C]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5A300]" />
      </div>
    );
  }

  const address = order?.shipping_address;
  const canCancel = order?.status === "pending";

  return (
    <div className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen overflow-x-hidden">
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d] py-8 md:py-10">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "Order" },
            ]}
          />
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#F5A300] hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to account
          </Link>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
            <Package className="w-3.5 h-3.5" /> ORDER DETAIL
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold break-all">
            {order ? `#${order.id.slice(0, 8).toUpperCase()}` : "Order"}
          </h1>
          {order && (
            <p className="font-mono text-xs text-[#E7DCC4]/80 mt-2 break-all">
              {order.id}
            </p>
          )}
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#F5A300]" />
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#BE3D1F]/40 p-6 text-center">
              <p className="font-mono text-xs font-bold text-[#BE3D1F] mb-4">{error}</p>
              <Link href="/account">
                <Button variant="outline">Back to Account</Button>
              </Link>
            </div>
          ) : order ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider ${statusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4]">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <p className="text-[#1C1A17]/50 dark:text-[#a0b4c4] uppercase tracking-wider font-bold mb-1">
                      Payment
                    </p>
                    <p className="text-[#132A3A] dark:text-[#E7DCC4] font-bold capitalize">
                      {order.payment_method?.replace(/_/g, " ") || "COD"}
                    </p>
                    <p className="text-[#1C1A17]/60 dark:text-[#a0b4c4] capitalize mt-0.5">
                      {order.payment_status}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#1C1A17]/50 dark:text-[#a0b4c4] uppercase tracking-wider font-bold mb-1">
                      Total
                    </p>
                    <p className="font-serif text-xl font-extrabold text-[#1F6F50]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                  <Package className="w-4 h-4 text-[#F5A300]" />
                  <h2 className="font-serif font-bold text-[#132A3A] dark:text-[#E7DCC4]">
                    Items
                  </h2>
                </div>
                <div className="space-y-3">
                  {(order.order_items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 min-w-0"
                    >
                      <div className="relative w-14 h-14 rounded-[2px] overflow-hidden border border-[#E7DCC4] dark:border-[#2a3d4d] bg-[#FBF6EC] dark:bg-[#0D1F2C] shrink-0">
                        <Image
                          src={safeImage(
                            item.product_image ? [item.product_image] : [],
                          )}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] line-clamp-2">
                          {item.product_name}
                        </p>
                        <p className="font-mono text-[11px] text-[#1C1A17]/60 dark:text-[#a0b4c4]">
                          Qty {item.quantity}
                          {item.selected_size ? ` · ${item.selected_size}` : ""}
                          {item.selected_color ? ` · ${item.selected_color}` : ""}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-bold text-[#1F6F50] shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                  <MapPin className="w-4 h-4 text-[#F5A300]" />
                  <h2 className="font-serif font-bold text-[#132A3A] dark:text-[#E7DCC4]">
                    Shipping
                  </h2>
                </div>
                {address ? (
                  <div className="font-mono text-xs text-[#1C1A17]/80 dark:text-[#a0b4c4] space-y-1 break-words">
                    <p className="font-bold text-[#132A3A] dark:text-[#E7DCC4]">
                      {[address.firstName, address.lastName].filter(Boolean).join(" ")}
                    </p>
                    <p>{address.address}</p>
                    <p>
                      {[address.city, address.zipCode].filter(Boolean).join(", ")}
                    </p>
                    {address.phone && <p>{address.phone}</p>}
                    {address.email && <p className="break-all">{address.email}</p>}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-[#1C1A17]/50 dark:text-[#a0b4c4]">
                    No shipping address on file
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                  <Truck className="w-4 h-4 text-[#F5A300]" />
                  <h2 className="font-serif font-bold text-[#132A3A] dark:text-[#E7DCC4]">
                    Totals
                  </h2>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between gap-3 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                    <span>Subtotal</span>
                    <span className="shrink-0">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                    <span>Shipping</span>
                    <span className="shrink-0">{formatPrice(order.shipping_cost)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between gap-3 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                      <span>Tax</span>
                      <span className="shrink-0">{formatPrice(order.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3 font-extrabold text-base text-[#132A3A] dark:text-[#E7DCC4] pt-2 border-t border-[#E7DCC4] dark:border-[#2a3d4d]">
                    <span>Total</span>
                    <span className="text-[#1F6F50] shrink-0">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {canCancel && (
                <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
                  {cancelError && (
                    <p className="font-mono text-xs font-bold text-[#BE3D1F] mb-3 break-words">
                      {cancelError}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-[#BE3D1F]/40 text-[#BE3D1F] hover:bg-[#BE3D1F]/10"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Cancelling...
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" /> Cancel Order
                      </>
                    )}
                  </Button>
                  <p className="font-mono text-[11px] text-[#1C1A17]/50 dark:text-[#a0b4c4] mt-2 text-center">
                    Only pending orders can be cancelled.
                  </p>
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
