"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Truck, ShieldCheck, CreditCard, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/src/store/useCartStore";
import { useIsLoggedIn, useAuthHydrated, useAuthStore } from "@/src/store/useAuthStore";
import { Button } from "@/src/components/ui/Button";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
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
import { formatPrice } from "@/src/lib/utils";

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
      <div className="flex items-center justify-center min-h-[60vh] bg-[#FBF6EC] dark:bg-[#0D1F2C]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5A300]" />
      </div>
    );
  }

  if (items.length === 0 && !completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container py-8 bg-[#FBF6EC] dark:bg-[#0D1F2C]"
      >
        <Breadcrumbs items={[{ label: "Checkout" }]} />
        <EmptyState
          title="Your Cart is Empty"
          description="Add some items before proceeding to checkout."
          actionLabel="Browse Catalog"
          actionHref="/shop"
        />
      </motion.div>
    );
  }

  if (completed) {
    return <OrderComplete orderId={orderId} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen py-8 overflow-x-hidden"
    >
      <div className="container">
        <Breadcrumbs items={[{ label: "Checkout" }]} />

        <div className="bg-[#132A3A] text-white border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-5 sm:p-6 rounded-[3px] shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#F5A300] bg-[#0D1F2C] px-2.5 py-0.5 rounded-[2px] mb-1">
              <BookOpen className="w-3.5 h-3.5" /> SECURE CHECKOUT
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Complete Your Order
            </h1>
          </div>
          <span className="font-mono text-xs font-bold text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] shrink-0">
            COD GUARANTEED NATIONWIDE
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 font-mono text-xs overflow-x-auto">
          {[
            { label: "1. SHIPPING DETAILS", icon: Truck },
            { label: "2. COD PAYMENT", icon: CreditCard },
            { label: "3. CONFIRMATION", icon: ShieldCheck },
          ].map(({ label, icon: Icon }, i) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-[2px] bg-[#132A3A] text-[#F5A300] border border-[#E7DCC4] dark:border-[#2a3d4d] flex items-center justify-center font-bold">
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-bold text-[#132A3A] dark:text-[#E7DCC4] hidden sm:block">{label}</span>
              {i < 2 && <div className="w-8 h-0.5 bg-[#E7DCC4] mx-2 hidden sm:block" />}
            </div>
          ))}
        </div>

        {(outOfStockInCart.length > 0 || quoteBlocksCheckout) && (
          <p className="max-w-lg mx-auto mb-6 font-mono text-xs text-[#BE3D1F] bg-[#BE3D1F]/10 border border-[#BE3D1F]/30 rounded-[3px] p-3 text-center font-bold break-words">
            {quoteBlocksCheckout
              ? `Unavailable: ${
                  orderSummary.unavailable_items.map((u) => u.name).join(", ") ||
                  "some items"
                }. Update `
              : "Some items in your cart are out of stock. Please update "}
            <Link href="/cart" className="underline">
              your cart
            </Link>{" "}
            before placing order.
          </p>
        )}

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <section className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
              <ShippingForm
                values={shipping}
                onChange={setShipping}
                errors={errors}
                deliveryZone={deliveryZone}
                onDeliveryZoneChange={setDeliveryZone}
              />
            </section>

            <section className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
              <PaymentForm />
            </section>

            <section className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-6 shadow-sm">
              <ReviewOrder
                shipping={shipping}
                deliveryZone={deliveryZone}
                subtotal={orderSummary.subtotal}
                shippingCost={orderSummary.shipping_cost}
                tax={orderSummary.tax}
                total={orderSummary.total}
              />
            </section>
          </div>

          <div className="lg:col-span-1 min-w-0">
            <div className="sticky top-24 bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-5 shadow-sm">
              <h3 className="font-serif font-bold text-base text-[#132A3A] dark:text-[#E7DCC4] mb-4 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                Order Summary
                {quoteLoading && (
                  <Loader2 className="inline w-3.5 h-3.5 ml-2 animate-spin text-[#F5A300]" />
                )}
              </h3>
              <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex items-center justify-between gap-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]/40 pb-2 min-w-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 relative rounded-[2px] overflow-hidden bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d] shrink-0">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-[#1C1A17]/40 dark:text-[#a0b4c4]">
                            N/A
                          </div>
                        )}
                      </div>
                      <span className="text-[#132A3A] dark:text-[#E7DCC4] font-bold truncate">
                        {item.product.name} × {item.quantity}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold text-[#1F6F50]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3 space-y-2 font-mono text-xs">
                <div className="flex justify-between gap-2 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                  <span>Subtotal</span>
                  <span className="shrink-0">{formatPrice(orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between gap-2 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                  <span className="min-w-0 truncate">
                    Shipping ({DELIVERY_ZONE_LABELS[deliveryZone]})
                  </span>
                  <span className="shrink-0">{formatPrice(orderSummary.shipping_cost)}</span>
                </div>
                {orderSummary.tax > 0 && (
                  <div className="flex justify-between gap-2 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                    <span>Tax</span>
                    <span className="shrink-0">{formatPrice(orderSummary.tax)}</span>
                  </div>
                )}
                <div className="border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-2 flex justify-between gap-2 font-extrabold text-base text-[#132A3A] dark:text-[#E7DCC4]">
                  <span>Total</span>
                  <span className="text-[#1F6F50] shrink-0">{formatPrice(orderSummary.total)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {placeError && (
                  <p className="font-mono text-xs text-[#BE3D1F] text-center font-bold break-words">
                    {placeError}
                  </p>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={
                    placing ||
                    outOfStockInCart.length > 0 ||
                    quoteBlocksCheckout
                  }
                  rotate
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING ORDER...
                    </>
                  ) : (
                    <>
                      CONFIRM COD ORDER — {formatPrice(orderSummary.total)}{" "}
                      <Lock className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
