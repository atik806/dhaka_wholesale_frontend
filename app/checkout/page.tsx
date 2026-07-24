"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Truck, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/src/store/useCartStore";
import { useIsLoggedIn, useAuthHydrated, useAuthStore } from "@/src/store/useAuthStore";
import { Button } from "@/src/components/ui/Button";
import { Card, CardHeader } from "@/src/components/ui/Card";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { CheckoutStepper } from "@/src/components/checkout/CheckoutStepper";
import { ShippingForm } from "@/src/components/checkout/ShippingForm";
import type { ShippingFormValues } from "@/src/components/checkout/ShippingForm";
import { PaymentForm } from "@/src/components/checkout/PaymentForm";
import { ReviewOrder } from "@/src/components/checkout/ReviewOrder";
import { OrderComplete } from "@/src/components/checkout/OrderComplete";
import { API_BASE, DELIVERY_ZONE_LABELS, type DeliveryZone } from "@/src/lib/constants";
import {
  authFetch,
  computeLocalCheckoutQuote,
  fetchCheckoutQuote,
  type CheckoutQuote,
} from "@/src/lib/auth-api";
import { formatPrice, safeImage } from "@/src/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const authHydrated = useAuthHydrated();
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthStore((s) => s.user);
  const [completed, setCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>();
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [shipping, setShipping] = useState<ShippingFormValues>({
    firstName: user?.shipping_address?.firstName || "",
    lastName: user?.shipping_address?.lastName || "",
    email: user?.shipping_address?.email || user?.email || "",
    phone: user?.shipping_address?.phone || "",
    address: user?.shipping_address?.address || "",
    city: user?.shipping_address?.city || "",
    zipCode: user?.shipping_address?.zipCode || "",
  });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside_dhaka");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (authHydrated && !isLoggedIn) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authHydrated, isLoggedIn, router]);

  const outOfStockInCart = useMemo(
    () => items.filter((i) => i.product.stock === "out-of-stock"),
    [items],
  );

  const cartSubtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0),
    [items],
  );

  const localQuote = useMemo(
    () => computeLocalCheckoutQuote(cartSubtotal, deliveryZone),
    [cartSubtotal, deliveryZone],
  );

  // POST /api/checkout/quote — use data.total / shipping_cost / tax (never invent 8%).
  useEffect(() => {
    if (!isLoggedIn || items.length === 0) {
      setQuote(localQuote);
      setQuoteLoading(false);
      return;
    }

    let active = true;
    setQuote(localQuote);
    setQuoteLoading(true);

    const quoteItems = items.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
    }));

    const timer = window.setTimeout(() => {
      fetchCheckoutQuote(deliveryZone, quoteItems).then((serverQuote) => {
        if (!active) return;
        setQuote(serverQuote ?? localQuote);
        setQuoteLoading(false);
      });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isLoggedIn, items, deliveryZone, localQuote]);

  const orderSummary = quote ?? localQuote;
  const quoteBlocksCheckout =
    orderSummary.fromServer && orderSummary.can_checkout === false;

  const shippingComplete = useMemo(
    () =>
      Boolean(
        shipping.firstName.trim() &&
          shipping.lastName.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email) &&
          shipping.phone.trim() &&
          shipping.address.trim() &&
          shipping.city.trim() &&
          shipping.zipCode.trim(),
      ),
    [shipping],
  );

  const handlePlaceOrder = useCallback(async () => {
    const errs: Record<string, string> = {};
    if (!shipping.firstName.trim()) errs.firstName = "Required";
    if (!shipping.lastName.trim()) errs.lastName = "Required";
    if (!shipping.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) errs.email = "Invalid email";
    if (!shipping.phone.trim()) errs.phone = "Required";
    if (!shipping.address.trim()) errs.address = "Required";
    if (!shipping.city.trim()) errs.city = "Required";
    if (!shipping.zipCode.trim()) errs.zipCode = "Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (outOfStockInCart.length > 0) {
      setPlaceError(
        `Remove out-of-stock items before checkout: ${outOfStockInCart.map((i) => i.product.name).join(", ")}`,
      );
      return;
    }
    if (quoteBlocksCheckout) {
      const names = orderSummary.unavailable_items.map((u) => u.name).join(", ");
      setPlaceError(
        names
          ? `Some items are unavailable: ${names}`
          : "Some items are unavailable. Update your cart before checkout.",
      );
      return;
    }

    setPlacing(true);
    setPlaceError("");
    try {
      const body = {
        shipping_address: shipping,
        payment_method: "cod",
        delivery_zone: deliveryZone,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          selected_size: i.selectedSize || null,
          selected_color: i.selectedColor || null,
        })),
      };
      const res = await authFetch(`${API_BASE}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to place order");
      }
      const json = await res.json();
      const created = json.data ?? json;
      useAuthStore.getState().updateUser({ shipping_address: shipping });
      clearCart();
      setOrderId(created?.id);
      setCompleted(true);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPlacing(false);
    }
  }, [
    shipping,
    deliveryZone,
    items,
    clearCart,
    outOfStockInCart,
    quoteBlocksCheckout,
    orderSummary.unavailable_items,
  ]);

  if (!authHydrated || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-canvas">
        <Loader2 className="w-8 h-8 animate-spin text-accent" aria-label="Loading checkout" />
      </div>
    );
  }

  if (items.length === 0 && !completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-canvas min-h-[70vh]"
      >
        <div className="container py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Checkout" }]} />
          <Card>
            <EmptyState
              title="Your cart is empty"
              description="Add a few items to your cart before proceeding to checkout."
              actionLabel="Browse catalog"
              actionHref="/shop"
            />
          </Card>
        </div>
      </motion.div>
    );
  }

  if (completed) {
    return <OrderComplete orderId={orderId} />;
  }

  const blocked = outOfStockInCart.length > 0 || quoteBlocksCheckout;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas min-h-screen overflow-x-hidden"
    >
      <div className="container py-6 sm:py-8 pb-32 lg:pb-8">
        <Breadcrumbs items={[{ label: "Checkout" }]} />

        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
            <p className="text-[13px] text-muted mt-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-subtle" />
              Secure checkout · cash on delivery nationwide
            </p>
          </div>
          <Link
            href="/cart"
            className="text-[13px] font-semibold text-link hover:text-link-hover underline underline-offset-4 shrink-0"
          >
            Edit cart
          </Link>
        </div>

        <Card className="p-4 sm:p-5 mb-6">
          <CheckoutStepper step={shippingComplete ? 2 : 0} />
        </Card>

        {blocked && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4"
          >
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-[13px] text-fg break-words">
              {quoteBlocksCheckout
                ? `Unavailable: ${
                    orderSummary.unavailable_items.map((u) => u.name).join(", ") ||
                    "some items"
                  }. Update `
                : "Some items in your cart are out of stock. Please update "}
              <Link href="/cart" className="font-semibold text-danger underline underline-offset-2">
                your cart
              </Link>{" "}
              before placing the order.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <Card>
              <CardHeader
                title="Shipping details"
                description="Where should we deliver this order?"
              />
              <div className="p-5 sm:p-6">
                <ShippingForm
                  values={shipping}
                  onChange={setShipping}
                  errors={errors}
                  deliveryZone={deliveryZone}
                  onDeliveryZoneChange={setDeliveryZone}
                />
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Payment method"
                description="Cash on delivery is the only method for this store"
              />
              <div className="p-5 sm:p-6">
                <PaymentForm />
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Review your order"
                description="Check everything before you confirm"
              />
              <div className="p-5 sm:p-6">
                <ReviewOrder
                  shipping={shipping}
                  deliveryZone={deliveryZone}
                  subtotal={orderSummary.subtotal}
                  shippingCost={orderSummary.shipping_cost}
                  tax={orderSummary.tax}
                  total={orderSummary.total}
                />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 min-w-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card>
                <div className="flex items-center gap-2 px-5 py-4 border-b border-line">
                  <h2 className="text-base font-bold">Order summary</h2>
                  {quoteLoading && (
                    <Loader2
                      className="w-3.5 h-3.5 animate-spin text-accent"
                      aria-label="Updating totals"
                    />
                  )}
                </div>

                <ul className="max-h-64 overflow-y-auto divide-y divide-line">
                  {items.map((item) => (
                    <li
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex items-center gap-3 px-5 py-3 min-w-0"
                    >
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-surface-2 border border-line shrink-0">
                        <Image
                          src={safeImage(item.product.images)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-fg truncate">
                          {item.product.name}
                        </p>
                        <p className="tabular text-[12px] text-muted">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="tabular text-[13px] font-semibold text-price shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="p-5 border-t border-line">
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="tabular font-semibold text-fg shrink-0">
                        {formatPrice(orderSummary.subtotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted flex items-center gap-1.5 min-w-0">
                        <Truck className="w-4 h-4 text-subtle shrink-0" />
                        <span className="truncate">
                          Shipping · {DELIVERY_ZONE_LABELS[deliveryZone]}
                        </span>
                      </dt>
                      <dd className="tabular font-semibold text-fg shrink-0">
                        {formatPrice(orderSummary.shipping_cost)}
                      </dd>
                    </div>
                    {orderSummary.tax > 0 && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Tax</dt>
                        <dd className="tabular font-semibold text-fg shrink-0">
                          {formatPrice(orderSummary.tax)}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-line">
                      <dt className="text-[15px] font-bold text-fg">Total due</dt>
                      <dd className="tabular text-2xl font-bold text-price shrink-0">
                        {formatPrice(orderSummary.total)}
                      </dd>
                    </div>
                  </dl>

                  {placeError && (
                    <p
                      role="alert"
                      className="mt-4 text-[13px] font-medium text-danger bg-danger-soft border border-danger/25 rounded-md px-3 py-2.5 break-words"
                    >
                      {placeError}
                    </p>
                  )}

                  <Button
                    className="hidden lg:inline-flex mt-4"
                    size="lg"
                    fullWidth
                    loading={placing}
                    onClick={handlePlaceOrder}
                    disabled={placing || blocked}
                  >
                    {placing ? "Placing order..." : "Place order"}
                  </Button>

                  <p className="hidden lg:flex items-center justify-center gap-1.5 text-[12px] text-muted mt-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    No payment now — pay cash on delivery
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet sticky action bar — sits above the bottom tab bar */}
      <div className="lg:hidden fixed left-0 right-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 border-t border-line bg-surface shadow-lg md:safe-area-bottom">
        <div className="container py-3">
          {placeError && (
            <p role="alert" className="text-[12px] font-medium text-danger mb-2 break-words">
              {placeError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="label-caps text-subtle">Total due</p>
              <p className="tabular text-lg font-bold text-price leading-tight">
                {formatPrice(orderSummary.total)}
              </p>
            </div>
            <Button
              className="flex-1 min-w-0"
              size="lg"
              loading={placing}
              onClick={handlePlaceOrder}
              disabled={placing || blocked}
            >
              {placing ? "Placing..." : "Place order"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
