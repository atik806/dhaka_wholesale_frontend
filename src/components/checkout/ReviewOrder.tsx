"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useCartStore } from "@/src/store/useCartStore";
import { formatPrice as fp, safeImage } from "@/src/lib/utils";
import { DELIVERY_CHARGES, type DeliveryZone } from "@/src/lib/constants";
import type { ShippingFormValues } from "./ShippingForm";

interface ReviewOrderProps {
  shipping: ShippingFormValues;
  deliveryZone: DeliveryZone;
}

export function ReviewOrder({ shipping, deliveryZone }: ReviewOrderProps) {
  const items = useCartStore((s) => s.items);

  const computedTotal = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    const shipping = DELIVERY_CHARGES[deliveryZone];
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [items, deliveryZone]);

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Review Your Order</h2>

      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 space-y-1 text-sm">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Shipping To</h3>
        <p className="text-zinc-500 dark:text-zinc-400">
          {shipping.firstName} {shipping.lastName}
        </p>
        <p className="text-zinc-500 dark:text-zinc-400">{shipping.address}</p>
        <p className="text-zinc-500 dark:text-zinc-400">
          {shipping.city}, {shipping.zipCode}
        </p>
        <p className="text-zinc-500 dark:text-zinc-400">{shipping.email}</p>
        <p className="text-zinc-500 dark:text-zinc-400">{shipping.phone}</p>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 space-y-1 text-sm">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Payment</h3>
        <p className="text-zinc-500 dark:text-zinc-400">Cash on Delivery</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
            className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0 relative">
              <Image
                src={safeImage(item.product.images)}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {item.product.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold">
              {fp(item.product.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Subtotal</span>
          <span>{fp(computedTotal.subtotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Delivery ({deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
          <span>{fp(computedTotal.shipping)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-1 border-t border-zinc-200 dark:border-zinc-700">
          <span>Total</span>
          <span>{fp(computedTotal.total)}</span>
        </div>
      </div>
    </div>
  );
}
