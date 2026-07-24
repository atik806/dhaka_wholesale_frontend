"use client";

import Image from "next/image";
import { useCartStore } from "@/src/store/useCartStore";
import { formatPrice as fp, safeImage } from "@/src/lib/utils";
import { DELIVERY_ZONE_LABELS, type DeliveryZone } from "@/src/lib/constants";
import type { ShippingFormValues } from "./ShippingForm";

interface ReviewOrderProps {
  shipping: ShippingFormValues;
  deliveryZone: DeliveryZone;
  subtotal: number;
  shippingCost: number;
  tax?: number;
  total: number;
}

export function ReviewOrder({
  shipping,
  deliveryZone,
  subtotal,
  shippingCost,
  tax = 0,
  total,
}: ReviewOrderProps) {
  const items = useCartStore((s) => s.items);

  return (
    <div className="space-y-4 overflow-x-hidden">
      <h2 className="font-serif text-xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">
        Review Your Order
      </h2>

      <div className="bg-[#FBF6EC] dark:bg-[#0D1F2C] rounded-[3px] p-4 border border-[#E7DCC4] dark:border-[#2a3d4d] space-y-1 font-mono text-xs">
        <h3 className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] mb-2">
          Shipping To
        </h3>
        <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4] break-words">
          {shipping.firstName} {shipping.lastName}
        </p>
        <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4] break-words">{shipping.address}</p>
        <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">
          {shipping.city}, {shipping.zipCode}
        </p>
        <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4] break-all">{shipping.email}</p>
        <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">{shipping.phone}</p>
      </div>

      <div className="bg-[#FBF6EC] dark:bg-[#0D1F2C] rounded-[3px] p-4 border border-[#E7DCC4] dark:border-[#2a3d4d] space-y-1 font-mono text-xs">
        <h3 className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] mb-2">
          Payment
        </h3>
        <p className="text-[#1F6F50] font-bold">Cash on Delivery</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
            className="flex items-center gap-3 bg-[#FBF6EC] dark:bg-[#0D1F2C] rounded-[3px] p-3 border border-[#E7DCC4] dark:border-[#2a3d4d] min-w-0"
          >
            <div className="w-14 h-14 rounded-[2px] overflow-hidden bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d] shrink-0 relative">
              <Image
                src={safeImage(item.product.images)}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] line-clamp-1">
                {item.product.name}
              </p>
              <p className="font-mono text-[11px] text-[#132A3A]/70 dark:text-[#a0b4c4]">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-[#1F6F50] shrink-0">
              {fp(item.product.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3 space-y-1 font-mono text-xs">
        <div className="flex justify-between gap-3 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
          <span>Subtotal</span>
          <span className="font-bold shrink-0">{fp(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-3 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
          <span className="min-w-0 truncate">
            Delivery ({DELIVERY_ZONE_LABELS[deliveryZone]})
          </span>
          <span className="font-bold shrink-0">{fp(shippingCost)}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between gap-3 text-[#1C1A17]/80 dark:text-[#a0b4c4]">
            <span>Tax</span>
            <span className="font-bold shrink-0">{fp(tax)}</span>
          </div>
        )}
        <div className="flex justify-between gap-3 font-extrabold text-base text-[#132A3A] dark:text-[#E7DCC4] pt-1 border-t border-[#E7DCC4] dark:border-[#2a3d4d]">
          <span>Total</span>
          <span className="text-[#1F6F50] shrink-0">{fp(total)}</span>
        </div>
      </div>
    </div>
  );
}
