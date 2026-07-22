"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { formatPrice as fp, safeImage } from "@/src/lib/utils";
import { DELIVERY_CHARGES, type DeliveryZone } from "@/src/lib/constants";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Button } from "@/src/components/ui/Button";

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
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen py-8"
    >
      <div className="container">
        <Breadcrumbs items={[{ label: "Cart" }]} />

        <div className="bg-white dark:bg-[#132A3A] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-5 sm:p-6 rounded-[3px] shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#F5A300] bg-[#132A3A] px-2.5 py-0.5 rounded-[2px] mb-1">
              <BookOpen className="w-3.5 h-3.5" /> CART
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">
              Order Summary ({totalItems()} Items)
            </h1>
          </div>
          <Link href="/shop" className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] underline hover:text-[#BE3D1F]">
            + Add More Items
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-4 bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-4 shadow-sm hover:border-[#F5A300] transition-colors"
              >
                <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-[2px] overflow-hidden bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d] shrink-0">
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
                    className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] hover:text-[#F5A300] transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="font-mono text-[11px] text-[#132A3A]/70 dark:text-[#a0b4c4] mt-0.5">
                    {item.product.category}
                    {item.selectedSize && ` · Size: ${item.selectedSize}`}
                    {item.selectedColor && ` · ${item.selectedColor}`}
                  </p>
                  <p className="font-mono font-bold text-sm text-[#1F6F50] mt-1.5">
                    {fp(item.product.price)} / unit
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
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

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-5 shadow-sm">
                <h2 className="font-serif font-bold text-base text-[#132A3A] dark:text-[#E7DCC4] mb-4 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                  Market Order Total
                </h2>

                <div className="space-y-2 mb-4">
                  <span className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] block">SELECT DELIVERY REGION:</span>
                  <label className="flex items-center gap-3 p-2.5 rounded-[2px] border border-[#E7DCC4] dark:border-[#2a3d4d] cursor-pointer hover:bg-[#FBF6EC] dark:bg-[#0D1F2C] transition-colors">
                    <input
                      type="radio"
                      name="delivery_zone"
                      value="inside_dhaka"
                      checked={deliveryZone === "inside_dhaka"}
                      onChange={() => setDeliveryZone("inside_dhaka")}
                      className="accent-[#F5A300]"
                    />
                    <span className="font-mono text-xs text-[#132A3A] dark:text-[#E7DCC4] font-bold">Inside Dhaka (৳{DELIVERY_CHARGES.inside_dhaka})</span>
                  </label>
                  <label className="flex items-center gap-3 p-2.5 rounded-[2px] border border-[#E7DCC4] dark:border-[#2a3d4d] cursor-pointer hover:bg-[#FBF6EC] dark:bg-[#0D1F2C] transition-colors">
                    <input
                      type="radio"
                      name="delivery_zone"
                      value="outside_dhaka"
                      checked={deliveryZone === "outside_dhaka"}
                      onChange={() => setDeliveryZone("outside_dhaka")}
                      className="accent-[#F5A300]"
                    />
                    <span className="font-mono text-xs text-[#132A3A] dark:text-[#E7DCC4] font-bold">Outside Dhaka (৳{DELIVERY_CHARGES.outside_dhaka})</span>
                  </label>
                </div>

                <div className="space-y-2.5 font-mono text-xs border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3">
                  <div className="flex justify-between text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                    <span>Stock Subtotal</span>
                    <span className="font-bold">{fp(computedTotal.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#1C1A17]/80 dark:text-[#a0b4c4]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#F5A300]" /> Express Shipping
                    </span>
                    <span className="font-bold">{fp(computedTotal.shipping)}</span>
                  </div>
                  <div className="border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3 flex justify-between font-extrabold text-base text-[#132A3A] dark:text-[#E7DCC4]">
                    <span>Total</span>
                    <span className="text-[#1F6F50]">{fp(computedTotal.total)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block mt-5">
                  <Button size="lg" className="w-full" rotate>
                    PROCEED TO CHECKOUT &rarr;
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d] p-4 shadow-sm font-mono text-xs space-y-2 text-[#132A3A] dark:text-[#E7DCC4]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F5A300] shrink-0" />
                  <span>CASH ON DELIVERY GUARANTEED</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#1F6F50] shrink-0" />
                  <span>24-48 HOUR EXPRESS DISPATCH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
