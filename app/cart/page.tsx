"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Truck, ShieldCheck, BookOpen, Loader2 } from "lucide-react";
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
import { Button } from "@/src/components/ui/Button";

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
        className="container py-8 bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-[70vh]"
      >
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-[#BE3D1F]" />}
          title="Your Cart is Empty"
          description="You currently have no items in your cart. Browse our catalog to find something you love."
          actionLabel="Browse Products"
          actionHref="/shop"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen py-8 overflow-x-hidden"
    >
      <div className="container">
        <Breadcrumbs items={[{ label: "Cart" }]} />

        <div className="bg-white dark:bg-[#132A3A] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-5 sm:p-6 rounded-[3px] shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#F5A300] bg-[#132A3A] px-2.5 py-0.5 rounded-[2px] mb-1">
              <BookOpen className="w-3.5 h-3.5" /> CART
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">
              Order Summary ({totalItems()} Items)
            </h1>
          </div>
          <Link href="/shop" className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] underline hover:text-[#BE3D1F] shrink-0">
            + Add More Items
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 min-w-0">
            {items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-3 sm:gap-4 bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-3 sm:p-4 shadow-sm hover:border-[#F5A300] transition-colors min-w-0"
              >
                <div className="relative w-16 sm:w-24 h-16 sm:h-24 rounded-[2px] overflow-hidden bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d] shrink-0">
                  <Image
                    src={safeImage(item.product.images)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] hover:text-[#F5A300] transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="font-mono text-[11px] text-[#132A3A]/70 dark:text-[#a0b4c4] mt-0.5 truncate">
                    {item.product.category}
                    {item.selectedSize && ` · Size: ${item.selectedSize}`}
                    {item.selectedColor && ` · ${item.selectedColor}`}
                  </p>
                  <p className="font-mono font-bold text-sm text-[#1F6F50] mt-1.5">
                    {fp(item.product.price)} / unit
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                    className="p-1.5 rounded-[2px] text-[#BE3D1F] hover:bg-[#BE3D1F]/10 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-[#E7DCC4] dark:border-[#2a3d4d] rounded-[2px] bg-[#FBF6EC] dark:bg-[#0D1F2C]">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)
                      }
                      className="w-7 h-7 flex items-center justify-center bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold w-7 text-center text-[#132A3A] dark:text-[#E7DCC4]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)
                      }
                      className="w-7 h-7 flex items-center justify-center bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1 min-w-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 sm:p-5 shadow-sm">
                <h2 className="font-serif font-bold text-base text-[#132A3A] dark:text-[#E7DCC4] mb-4 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                  Market Order Total
                  {quoteLoading && (
                    <Loader2 className="inline w-3.5 h-3.5 ml-2 animate-spin text-[#F5A300]" />
                  )}
                </h2>

                <div className="space-y-2 mb-4">
                  <span className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] block">
                    SELECT DELIVERY ZONE:
                  </span>
                  {(["inside_dhaka", "outside_dhaka"] as const).map((zone) => (
                    <label
                      key={zone}
                      className={`flex items-center gap-3 p-2.5 rounded-[2px] border cursor-pointer transition-colors ${
                        deliveryZone === zone
                          ? "border-[#F5A300] bg-[#F5A300]/10"
                          : "border-[#E7DCC4] dark:border-[#2a3d4d] hover:bg-[#FBF6EC] dark:hover:bg-[#0D1F2C]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_zone"
                        value={zone}
                        checked={deliveryZone === zone}
                        onChange={() => setDeliveryZone(zone)}
                        className="accent-[#F5A300] shrink-0"
                      />
                      <span className="font-mono text-xs text-[#132A3A] dark:text-[#E7DCC4] font-bold min-w-0">
                        {DELIVERY_ZONE_LABELS[zone]} (৳{DELIVERY_CHARGES[zone]})
                      </span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2.5 font-mono text-xs border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3">
                  <div className="flex justify-between gap-2 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                    <span>Stock Subtotal</span>
                    <span className="font-bold shrink-0">{fp(orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                    <span className="flex items-center gap-1 min-w-0">
                      <Truck className="w-3.5 h-3.5 text-[#F5A300] shrink-0" />
                      <span className="truncate">
                        Shipping ({DELIVERY_ZONE_LABELS[deliveryZone]})
                      </span>
                    </span>
                    <span className="font-bold shrink-0">{fp(orderSummary.shipping_cost)}</span>
                  </div>
                  {orderSummary.tax > 0 && (
                    <div className="flex justify-between gap-2 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                      <span>Tax</span>
                      <span className="font-bold shrink-0">{fp(orderSummary.tax)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3 flex justify-between gap-2 font-extrabold text-base text-[#132A3A] dark:text-[#E7DCC4]">
                    <span>Total</span>
                    <span className="text-[#1F6F50] shrink-0">{fp(orderSummary.total)}</span>
                  </div>
                </div>

                {orderSummary.fromServer && !orderSummary.can_checkout && (
                  <p className="mt-3 font-mono text-[11px] font-bold text-[#BE3D1F] break-words">
                    Some items are unavailable
                    {orderSummary.unavailable_items.length > 0
                      ? `: ${orderSummary.unavailable_items.map((u) => u.name).join(", ")}`
                      : ""}
                    .
                  </p>
                )}

                <Link href="/checkout" className="block mt-5">
                  <Button size="lg" className="w-full" rotate>
                    PROCEED TO CHECKOUT &rarr;
                  </Button>
                </Link>
              </div>

              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d] p-4 shadow-sm font-mono text-xs space-y-2 text-[#132A3A] dark:text-[#E7DCC4]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F5A300] shrink-0" />
                  <span>CASH ON DELIVERY GUARANTEED</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#1F6F50] shrink-0" />
                  <span>ZONE SHIPPING: ৳80 DHAKA / ৳120 OUTSIDE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
