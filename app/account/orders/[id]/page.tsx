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
  Receipt,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore, useAuthHydrated } from "@/src/store/useAuthStore";
import {
  fetchUserOrder,
  cancelUserOrder,
  type UserOrder,
} from "@/src/lib/auth-api";
import { formatPrice, formatDate, safeImage } from "@/src/lib/utils";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button, buttonClasses } from "@/src/components/ui/Button";
import { Card, CardHeader } from "@/src/components/ui/Card";
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
      <div className="flex items-center justify-center min-h-[60vh] bg-canvas">
        <Loader2 className="w-8 h-8 animate-spin text-accent" aria-label="Loading order" />
      </div>
    );
  }

  const address = order?.shipping_address;
  const canCancel = order?.status === "pending";

  return (
    <div className="bg-canvas min-h-screen overflow-x-hidden">
      <div className="container py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Account", href: "/account" },
            { label: order ? `#${order.id.slice(0, 8).toUpperCase()}` : "Order" },
          ]}
        />

        <div className="max-w-3xl mx-auto min-w-0">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-fg transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to account
          </Link>

          {loading ? (
            <div className="space-y-4">
              <Card className="p-5 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-8 w-32" />
              </Card>
              <Card className="p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </Card>
            </div>
          ) : error ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-danger-soft border border-danger/25 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-danger" />
              </div>
              <p className="text-base font-bold text-fg mb-1">
                We couldn&apos;t load this order
              </p>
              <p className="text-[13px] text-muted mb-5 break-words">{error}</p>
              <Link href="/account" className={buttonClasses({ variant: "outline" })}>
                Back to account
              </Link>
            </Card>
          ) : order ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label-caps text-muted mb-1.5">Order number</p>
                    <h1 className="font-mono text-xl sm:text-2xl font-bold text-fg tabular">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </h1>
                    <p className="font-mono text-[12px] text-subtle break-all mt-1">
                      {order.id}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="tabular text-[13px] text-muted mt-2">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-line">
                  <div>
                    <dt className="label-caps text-muted mb-1.5">Payment</dt>
                    <dd className="text-sm font-semibold text-fg capitalize">
                      {order.payment_method?.replace(/_/g, " ") || "COD"}
                    </dd>
                    <dd className="text-[13px] text-muted capitalize mt-0.5">
                      {order.payment_status}
                    </dd>
                  </div>
                  <div className="sm:text-right">
                    <dt className="label-caps text-muted mb-1.5">Order total</dt>
                    <dd className="tabular text-2xl font-bold text-price">
                      {formatPrice(order.total)}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card>
                <CardHeader
                  title={`Items (${(order.order_items || []).length})`}
                  action={<Package className="w-5 h-5 text-subtle shrink-0" />}
                />
                <ul className="divide-y divide-line">
                  {(order.order_items || []).map((item) => (
                    <li key={item.id} className="flex items-center gap-3 px-5 py-4 min-w-0">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden border border-line bg-surface-2 shrink-0">
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
                        <p className="text-sm font-semibold text-fg line-clamp-2">
                          {item.product_name}
                        </p>
                        <p className="text-[12px] text-muted mt-0.5">
                          <span className="tabular">
                            {item.quantity} × {formatPrice(item.price)}
                          </span>
                          {item.selected_size ? ` · ${item.selected_size}` : ""}
                          {item.selected_color ? ` · ${item.selected_color}` : ""}
                        </p>
                      </div>
                      <p className="tabular text-sm font-bold text-price shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <Card>
                  <CardHeader
                    title="Delivery address"
                    action={<MapPin className="w-5 h-5 text-subtle shrink-0" />}
                  />
                  <div className="p-5">
                    {address ? (
                      <div className="text-[13px] text-muted space-y-0.5 break-words">
                        <p className="font-semibold text-fg">
                          {[address.firstName, address.lastName].filter(Boolean).join(" ")}
                        </p>
                        <p>{address.address}</p>
                        <p>
                          {[address.city, address.zipCode].filter(Boolean).join(", ")}
                        </p>
                        {address.phone && <p className="tabular">{address.phone}</p>}
                        {address.email && <p className="break-all">{address.email}</p>}
                      </div>
                    ) : (
                      <p className="text-[13px] text-subtle">
                        No shipping address on file
                      </p>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title="Payment summary"
                    action={<Receipt className="w-5 h-5 text-subtle shrink-0" />}
                  />
                  <div className="p-5">
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Subtotal</dt>
                        <dd className="tabular font-semibold text-fg shrink-0">
                          {formatPrice(order.subtotal)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Shipping</dt>
                        <dd className="tabular font-semibold text-fg shrink-0">
                          {formatPrice(order.shipping_cost)}
                        </dd>
                      </div>
                      {order.tax > 0 && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted">Tax</dt>
                          <dd className="tabular font-semibold text-fg shrink-0">
                            {formatPrice(order.tax)}
                          </dd>
                        </div>
                      )}
                      <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-line">
                        <dt className="text-[15px] font-bold text-fg">Total</dt>
                        <dd className="tabular text-xl font-bold text-price shrink-0">
                          {formatPrice(order.total)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </Card>
              </div>

              {canCancel && (
                <Card className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-fg">Need to cancel?</p>
                      <p className="text-[13px] text-muted mt-0.5">
                        Only pending orders can be cancelled, and this cannot be
                        undone.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="shrink-0 text-danger border-danger/35 hover:bg-danger-soft hover:border-danger/60"
                      onClick={handleCancel}
                      loading={cancelling}
                      disabled={cancelling}
                    >
                      {!cancelling && <Ban className="w-4 h-4" />}
                      {cancelling ? "Cancelling..." : "Cancel order"}
                    </Button>
                  </div>
                  {cancelError && (
                    <p
                      role="alert"
                      className="mt-4 text-[13px] font-medium text-danger bg-danger-soft border border-danger/25 rounded-md px-3 py-2.5 break-words"
                    >
                      {cancelError}
                    </p>
                  )}
                </Card>
              )}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
