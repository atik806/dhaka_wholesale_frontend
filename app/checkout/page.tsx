"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Truck, ShieldCheck, CreditCard } from "lucide-react";
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
import { API_BASE, DELIVERY_CHARGES, type DeliveryZone } from "@/src/lib/constants";
import { authFetch } from "@/src/lib/auth-api";
import { formatPrice } from "@/src/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const authHydrated = useAuthHydrated();
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthStore((s) => s.user);
  const [completed, setCompleted] = useState(false);
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

  useEffect(() => {
    if (authHydrated && !isLoggedIn) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authHydrated, isLoggedIn, router]);

  const outOfStockInCart = useMemo(
    () => items.filter((i) => i.product.stock === "out-of-stock"),
    [items],
  );

  const orderSummary = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0);
    const shipping_cost = DELIVERY_CHARGES[deliveryZone];
    return { subtotal, shipping: shipping_cost, total: subtotal + shipping_cost };
  }, [items, deliveryZone]);

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
    setPlacing(true);
    setPlaceError("");
    try {
      const body = {
        shipping_address: shipping,
        payment_method: "cod",
        delivery_zone: deliveryZone,
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          product_image: i.product.images?.[0] || null,
          price: i.product.price,
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
      useAuthStore.getState().updateUser({ shipping_address: shipping });
      clearCart();
      setCompleted(true);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPlacing(false);
    }
  }, [shipping, deliveryZone, items, clearCart, outOfStockInCart]);

  if (!authHydrated || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0 && !completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container"
      >
        <Breadcrumbs items={[{ label: "Checkout" }]} />
        <EmptyState
          title="Your cart is empty"
          description="Add some items before checking out."
          actionLabel="Start Shopping"
          actionHref="/shop"
        />
      </motion.div>
    );
  }

  if (completed) {
    return <OrderComplete />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Checkout" }]} />

      {/* Checkout Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[
          { label: "Shipping", icon: Truck },
          { label: "Payment", icon: CreditCard },
          { label: "Review", icon: ShieldCheck },
        ].map(({ label, icon: Icon }, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary dark:bg-primary flex items-center justify-center">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium hidden sm:block">{label}</span>
            {i < 2 && <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-700 mx-2 hidden sm:block" />}
          </div>
        ))}
      </div>

      {outOfStockInCart.length > 0 && (
        <p className="max-w-lg mx-auto mb-6 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-center">
          Some items in your cart are out of stock. Remove them in{" "}
          <Link href="/cart" className="underline font-medium">your cart</Link>{" "}
          to continue.
        </p>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <ShippingForm
              values={shipping}
              onChange={setShipping}
              errors={errors}
              deliveryZone={deliveryZone}
              onDeliveryZoneChange={setDeliveryZone}
            />
          </section>

          <section>
            <PaymentForm />
          </section>

          <section>
            <ReviewOrder
              shipping={shipping}
              deliveryZone={deliveryZone}
            />
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/50 p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm max-h-60 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 relative rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-700 shrink-0">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">N/A</div>
                      )}
                    </div>
                    <span className="text-zinc-500 dark:text-zinc-400 truncate">
                      {item.product.name} × {item.quantity}
                    </span>
                  </div>
                  <span className="shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(orderSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Delivery</span>
                <span>{formatPrice(orderSummary.shipping)}</span>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-700 pt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(orderSummary.total)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {placeError && (
                <p className="text-sm text-red-500 text-center">{placeError}</p>
              )}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing || outOfStockInCart.length > 0}
              >
                {placing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order — {formatPrice(orderSummary.total)} <Lock className="w-5 h-5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
