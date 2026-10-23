"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Truck, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "@/src/components/ui/Image";
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
import { CouponEntry } from "@/src/components/checkout/CouponEntry";
import { OrderComplete } from "@/src/components/checkout/OrderComplete";
import { API_BASE, DELIVERY_ZONE_LABELS, QUOTE_REFRESH_MS, type DeliveryZone } from "@/src/lib/constants";
import {
  authFetch,
  computeLocalCheckoutQuote,
  fetchCheckoutQuote,
  type CheckoutQuote,
} from "@/src/lib/auth-api";
import { formatPrice, variantImage } from "@/src/lib/utils";
import { createCheckoutKeyStore } from "@/src/lib/order-pricing";
import { validateShipping } from "@/src/lib/checkout-validation";

/** Matches ORDER_NOTE_MAX in the backend orders service. */
const ORDER_NOTE_MAX = 500;

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
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  // Same request → same key, so a retry after a timeout cannot place a
  // second order; the server replays the first one instead.
  const [checkoutKeys] = useState(() => createCheckoutKeyStore());

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

  // Reset the quote back to the local estimate whenever the cart, auth state,
  // or delivery zone changes. This runs during render (React's "adjusting
  // state when props change" pattern) so no effect needs to sync it.
  const quoteResetKey = [
    authHydrated ? "h" : "nh",
    isLoggedIn ? "in" : "out",
    deliveryZone,
    couponCode,
    items
      .map(
        (i) =>
          `${i.product.id}:${i.quantity}:${i.product.price}:${i.selectedSize ?? ""}:${i.selectedColor ?? ""}`,
      )
      .join("|"),
  ].join(":");
  const [prevQuoteKey, setPrevQuoteKey] = useState(quoteResetKey);
  if (prevQuoteKey !== quoteResetKey) {
    setPrevQuoteKey(quoteResetKey);
    setQuote(null);
    setQuoteError("");
    setQuoteLoading(isLoggedIn && items.length > 0);
  }

  // POST /api/checkout/quote — use data.total / shipping_cost / tax (never invent 8%).
  useEffect(() => {
    if (!isLoggedIn || items.length === 0) return;

    let active = true;
    const quoteItems = items.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
    }));

    const loadQuote = () => {
      fetchCheckoutQuote(deliveryZone, quoteItems, couponCode)
        .then((serverQuote) => {
          if (!active) return;
          setQuote(serverQuote ?? localQuote);
          setQuoteError(serverQuote ? "" : "Could not confirm checkout totals. Please try again.");
          setQuoteLoading(false);
        })
        .catch((err) => {
          // The server rejected the quote (invalid/deleted product). Do not
          // fall back to a local estimate that claims can_checkout: true.
          if (!active) return;
          setQuote(localQuote);
          setQuoteError(
            err instanceof Error ? err.message : "Could not confirm your items",
          );
          setQuoteLoading(false);
        });
    };
    const timer = window.setTimeout(loadQuote, 250);
    const refresh = window.setInterval(loadQuote, QUOTE_REFRESH_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearInterval(refresh);
    };
  }, [isLoggedIn, items, deliveryZone, localQuote, couponCode]);

  const applyCoupon = async (code: string) => {
    setCouponBusy(true);
    try {
      const result = await fetchCheckoutQuote(deliveryZone, items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })), code);
      if (!result) throw new Error("Could not verify coupon. Please try again.");
      setCouponCode(code); setQuote(result); setQuoteError("");
    } finally { setCouponBusy(false); }
  };

  const orderSummary = quote ?? localQuote;
  const quoteBlocksCheckout =
    orderSummary.fromServer && orderSummary.can_checkout === false;
  const quoteRejected = !!quoteError;

  const shippingComplete = useMemo(
    () => Object.keys(validateShipping(shipping)).length === 0,
    [shipping],
  );

  const handlePlaceOrder = useCallback(async () => {
    if (quoteLoading || couponBusy || !orderSummary.fromServer || quoteRejected) {
      setPlaceError("Please wait for confirmed checkout totals or remove the invalid coupon.");
      return;
    }
    const errs = validateShipping(shipping);
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
      const request = {
        expected_total: orderSummary.total,
        coupon_code: couponCode || undefined,
        shipping_address: shipping,
        payment_method: "cod",
        delivery_zone: deliveryZone,
        notes: note.trim() || undefined,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          selected_size: i.selectedSize || null,
          selected_color: i.selectedColor || null,
        })),
      };
      const body = { ...request, idempotency_key: checkoutKeys.keyFor(JSON.stringify(request)) };
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
      checkoutKeys.reset();
      clearCart();
      setOrderId(created?.id);
      setCompleted(true);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "Something went wrong");
      const refreshed = await fetchCheckoutQuote(deliveryZone, items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })), couponCode).catch(() => null);
      if (refreshed) setQuote(refreshed);
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
    couponCode,
    quoteLoading,
    couponBusy,
    orderSummary.fromServer,
    orderSummary.total,
    quoteRejected,
    checkoutKeys,
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

  const blocked = outOfStockInCart.length > 0 || quoteBlocksCheckout || quoteRejected || quoteLoading || couponBusy || !orderSummary.fromServer;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas min-h-screen overflow-x-hidden"
    >
      <div className="container py-6 sm:py-8 pb-32 lg:pb-8">
        <Breadcrumbs items={[{ label: "Checkout" }]} />

        <div className="flex flex-wrap items-end justify-between gap-3 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight">
              Checkout
            </h1>
            <p className="text-sm text-muted mt-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-subtle" />
              Secure checkout · cash on delivery nationwide
            </p>
          </div>
          <Link
            href="/cart"
            className="text-[13px] font-semibold text-link hover:text-link-hover underline underline-offset-4 shrink-0 flex items-center gap-1"
          >
            Edit cart
          </Link>
        </div>

        <Card className="p-3 sm:p-4 mb-6 shadow-sm">
          <CheckoutStepper step={shippingComplete ? 2 : 0} />
        </Card>

        {(outOfStockInCart.length > 0 || quoteBlocksCheckout || quoteRejected) && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4"
          >
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-[13px] text-fg break-words">
              {quoteRejected
                ? `${quoteError}. `
                : quoteBlocksCheckout
                  ? `Unavailable: ${
                      orderSummary.unavailable_items.map((u) => u.name).join(", ") ||
                      "some items"
                    }. Update `
                  : "Some items in your cart are out of stock. Please update "}
              {!quoteRejected && (
                <Link href="/cart" className="font-semibold text-danger underline underline-offset-2">
                  your cart
                </Link>
              )}
              {quoteRejected ? "Please update your cart and try again." : " before placing the order."}
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
                title="Message for us"
                description="Optional: a delivery time, landmark, gift note or anything else"
              />
              <div className="p-5 sm:p-6">
                <label htmlFor="order-note" className="sr-only">
                  Message for us (optional)
                </label>
                <textarea
                  id="order-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={ORDER_NOTE_MAX}
                  rows={3}
                  placeholder="e.g. Please call before delivery. Near the mosque gate."
                  aria-describedby="order-note-count"
                  className="w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                <p id="order-note-count" className="mt-1.5 text-right text-xs tabular text-subtle">
                  {note.length}/{ORDER_NOTE_MAX}
                </p>
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
                  note={note.trim()}
                  deliveryZone={deliveryZone}
                  subtotal={orderSummary.original_subtotal}
                  discountTotal={orderSummary.discount_total}
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
                          src={variantImage(item.product, item.selectedColor)}
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
                  <CouponEntry code={couponCode} disabled={placing || couponBusy} onApply={applyCoupon} onRemove={() => setCouponCode("")} />
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="tabular font-semibold text-fg shrink-0">
                        {formatPrice(orderSummary.original_subtotal)}
                      </dd>
                    </div>
                    {orderSummary.combo_discount > 0 && <div className="flex justify-between gap-3 text-success"><dt>Combo savings</dt><dd className="font-semibold">−{formatPrice(orderSummary.combo_discount)}</dd></div>}
                    {orderSummary.coupon_discount > 0 && <div className="flex justify-between gap-3 text-success"><dt>Coupon {orderSummary.coupon_code}</dt><dd className="font-semibold">−{formatPrice(orderSummary.coupon_discount)}</dd></div>}
                    {orderSummary.applied_combos.map((combo) => <div key={combo.id} className="text-xs text-muted">{combo.title} × {combo.quantity}</div>)}
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
