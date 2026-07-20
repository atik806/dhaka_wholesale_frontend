"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { formatPrice as fp, safeImage } from "@/src/lib/utils";
import { DELIVERY_CHARGES, type DeliveryZone } from "@/src/lib/constants";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalItems = useCartStore((s) => s.totalItems);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside_dhaka");

  const computedTotal = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    const shipping = DELIVERY_CHARGES[deliveryZone];
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [items, deliveryZone]);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container"
      >
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-primary dark:text-primary-light" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse our collection and find something you love."
          actionLabel="Start Shopping"
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
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Cart" }]} />

      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Shopping Cart ({totalItems()})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <motion.div
              key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/50 p-4 shadow-sm"
            >
              <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0">
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
                  className="font-medium text-sm hover:text-primary dark:hover:text-primary-light transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {item.product.category}
                  {item.selectedSize && ` · Size: ${item.selectedSize}`}
                  {item.selectedColor && ` · ${item.selectedColor}`}
                </p>
                <p className="font-semibold text-sm mt-1.5">
                  {fp(item.product.price)}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-0.5">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)
                    }
                    className="w-8 h-8 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)
                    }
                    className="w-8 h-8 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/50 p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-600 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <input
                    type="radio"
                    name="delivery_zone"
                    value="inside_dhaka"
                    checked={deliveryZone === "inside_dhaka"}
                    onChange={() => setDeliveryZone("inside_dhaka")}
                    className="accent-[#0b2c5f]"
                  />
                  <span className="text-sm">Inside Dhaka (৳{DELIVERY_CHARGES.inside_dhaka})</span>
                </label>
                <label className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-600 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <input
                    type="radio"
                    name="delivery_zone"
                    value="outside_dhaka"
                    checked={deliveryZone === "outside_dhaka"}
                    onChange={() => setDeliveryZone("outside_dhaka")}
                    className="accent-[#0b2c5f]"
                  />
                  <span className="text-sm">Outside Dhaka (৳{DELIVERY_CHARGES.outside_dhaka})</span>
                </label>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>{fp(computedTotal.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Delivery
                  </span>
                  <span>{fp(computedTotal.shipping)}</span>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-700 pt-2.5 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{fp(computedTotal.total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-primary text-white rounded-lg py-3 text-sm font-medium hover:bg-primary-dark transition-colors mt-5"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="block text-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary-light transition-colors mt-3"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/50 p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-primary dark:text-primary-light shrink-0" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Delivery within 1-3 business days</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary dark:text-primary-light shrink-0" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Secure payment with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
