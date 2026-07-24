"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Truck, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { useIsLoggedIn, useAuthHydrated } from "@/src/store/useAuthStore";
import { formatPrice as fp, safeImage } from "@/src/lib/utils";
import { DELIVERY_CHARGES, DELIVERY_ZONE_LABELS, type DeliveryZone } from "@/src/lib/constants";
import {
  computeLocalCheckoutQuote,
  fetchCheckoutQuote,
  type CheckoutQuote,
} from "@/src/lib/auth-api";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Card } from "@/src/components/ui/Card";
import { buttonClasses } from "@/src/components/ui/Button";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalItems = useCartStore((s) => s.totalItems);
  const authHydrated = useAuthHydrated();
  const isLoggedIn = useIsLoggedIn();
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside_dhaka");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const cartSubtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.product.price || 0) * item.quantity,
        0,
      ),
    [items],
  );

  const localQuote = useMemo(
    () => computeLocalCheckoutQuote(cartSubtotal, deliveryZone),
    [cartSubtotal, deliveryZone],
  );

  // Zone-aware estimate: POST /checkout/quote when logged in; else local 80/120 + tax 0.
  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    let active = true;
    setQuote(localQuote);

    if (!authHydrated || !isLoggedIn) {
      setQuoteLoading(false);
      return;
    }

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
  }, [items, deliveryZone, localQuote, authHydrated, isLoggedIn]);

  const orderSummary = quote ?? localQuote;

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-canvas min-h-[70vh]"
      >
        <div className="container py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Cart" }]} />
          <Card>
            <EmptyState
              icon={<ShoppingBag className="w-7 h-7 text-subtle" />}
              title="Your cart is empty"
              description="You have no items in your cart yet. Browse the catalog to find wholesale stock at the right price."
              actionLabel="Browse products"
              actionHref="/shop"
            />
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas min-h-screen overflow-x-hidden"
    >
      <div className="container py-6 sm:py-8 pb-28 lg:pb-8">
        <Breadcrumbs items={[{ label: "Cart" }]} />

        <div className="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Shopping cart</h1>
            <p className="text-[13px] text-muted mt-1">
              <span className="tabular">{totalItems()}</span>{" "}
              {totalItems() === 1 ? "item" : "items"} ready for checkout
            </p>
          </div>
          <Link
            href="/shop"
            className="text-[13px] font-semibold text-brand hover:text-accent-hover underline underline-offset-4 shrink-0"
          >
            Continue shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          <div className="lg:col-span-2 min-w-0">
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {items.map((item) => {
                  const lineTotal = (item.product.price || 0) * item.quantity;
                  return (
                    <motion.li
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex gap-3 sm:gap-4 min-w-0">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md overflow-hidden bg-surface-2 border border-line"
                        >
                          <Image
                            src={safeImage(item.product.images)}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="text-sm sm:text-[15px] font-semibold text-fg hover:text-accent-hover transition-colors line-clamp-2"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-[12px] text-muted mt-1 truncate">
                                {item.product.category}
                                {item.selectedSize && ` · Size ${item.selectedSize}`}
                                {item.selectedColor && ` · ${item.selectedColor}`}
                              </p>
                              <p className="text-[13px] text-muted mt-1.5">
                                <span className="tabular font-semibold text-price">
                                  {fp(item.product.price)}
                                </span>{" "}
                                / unit
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="tabular text-base sm:text-lg font-bold text-price">
                                {fp(lineTotal)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 mt-3">
                            <div className="inline-flex items-center rounded-md border border-line-strong bg-surface overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)
                                }
                                aria-label={`Decrease quantity of ${item.product.name}`}
                                className="h-11 w-11 sm:h-10 sm:w-10 flex items-center justify-center text-fg hover:bg-surface-2 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span
                                aria-live="polite"
                                className="tabular text-sm font-bold w-9 text-center text-fg border-x border-line"
                              >
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)
                                }
                                aria-label={`Increase quantity of ${item.product.name}`}
                                className="h-11 w-11 sm:h-10 sm:w-10 flex items-center justify-center text-fg hover:bg-surface-2 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                              className="inline-flex items-center gap-1.5 h-11 sm:h-10 px-2 -mr-2 rounded-md text-[13px] font-semibold text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Remove</span>
                              <span className="sr-only sm:hidden">
                                Remove {item.product.name}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-1 min-w-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card>
                <div className="flex items-center gap-2 px-5 py-4 border-b border-line">
                  <h2 className="text-base font-bold">Order summary</h2>
                  {quoteLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" aria-label="Updating totals" />
                  )}
                </div>

                <div className="p-5">
                  <fieldset>
                    <legend className="label-caps text-muted mb-2.5">
                      Delivery zone
                    </legend>
                    <div className="space-y-2">
                      {(["inside_dhaka", "outside_dhaka"] as const).map((zone) => (
                        <label
                          key={zone}
                          className={`flex items-center justify-between gap-3 min-h-11 px-3 py-2.5 rounded-md border cursor-pointer transition-colors ${
                            deliveryZone === zone
                              ? "border-accent bg-accent-soft"
                              : "border-line hover:bg-surface-2"
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="radio"
                              name="delivery_zone"
                              value={zone}
                              checked={deliveryZone === zone}
                              onChange={() => setDeliveryZone(zone)}
                              className="accent-accent shrink-0 w-4 h-4"
                            />
                            <span className="text-[13px] font-semibold text-fg truncate">
                              {DELIVERY_ZONE_LABELS[zone]}
                            </span>
                          </span>
                          <span className="tabular text-[13px] font-semibold text-muted shrink-0">
                            ৳{DELIVERY_CHARGES[zone]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <dl className="mt-5 pt-4 border-t border-line space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="tabular font-semibold text-fg shrink-0">
                        {fp(orderSummary.subtotal)}
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
                        {fp(orderSummary.shipping_cost)}
                      </dd>
                    </div>
                    {orderSummary.tax > 0 && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Tax</dt>
                        <dd className="tabular font-semibold text-fg shrink-0">
                          {fp(orderSummary.tax)}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-line">
                      <dt className="text-[15px] font-bold text-fg">Total</dt>
                      <dd className="tabular text-2xl font-bold text-price shrink-0">
                        {fp(orderSummary.total)}
                      </dd>
                    </div>
                  </dl>

                  {orderSummary.fromServer && !orderSummary.can_checkout && (
                    <p className="mt-4 text-[13px] font-medium text-danger bg-danger-soft border border-danger/25 rounded-md px-3 py-2.5 break-words">
                      Some items are unavailable
                      {orderSummary.unavailable_items.length > 0
                        ? `: ${orderSummary.unavailable_items.map((u) => u.name).join(", ")}`
                        : ""}
                      .
                    </p>
                  )}

                  <Link
                    href="/checkout"
                    className={buttonClasses({ size: "lg", fullWidth: true, className: "mt-5" })}
                  >
                    Proceed to checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>

              <Card className="p-4 space-y-2.5 text-[13px] text-muted">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                  <span>Cash on delivery on every order</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-info shrink-0" />
                  <span className="tabular">
                    Flat ৳80 inside Dhaka · ৳120 outside Dhaka
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet sticky action bar — sits above the bottom tab bar */}
      <div className="lg:hidden fixed left-0 right-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 border-t border-line bg-surface shadow-lg md:safe-area-bottom">
        <div className="container flex items-center gap-3 py-3">
          <div className="min-w-0">
            <p className="label-caps text-subtle">Total</p>
            <p className="tabular text-lg font-bold text-price leading-tight">
              {fp(orderSummary.total)}
            </p>
          </div>
          <Link
            href="/checkout"
            className={buttonClasses({ size: "lg", className: "flex-1 min-w-0" })}
          >
            Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
