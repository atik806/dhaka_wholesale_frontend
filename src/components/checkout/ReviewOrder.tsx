"use client";

import Image from "next/image";
import { Banknote, MapPin } from "lucide-react";
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
  const fullName = [shipping.firstName, shipping.lastName].filter(Boolean).join(" ");

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <p className="label-caps text-muted flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-subtle" /> Ship to
          </p>
          <div className="text-[13px] text-muted space-y-0.5 break-words">
            {fullName && <p className="font-semibold text-fg">{fullName}</p>}
            <p>{shipping.address}</p>
            <p>{[shipping.city, shipping.zipCode].filter(Boolean).join(", ")}</p>
            {shipping.phone && <p className="tabular">{shipping.phone}</p>}
            {shipping.email && <p className="break-all">{shipping.email}</p>}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <p className="label-caps text-muted flex items-center gap-1.5 mb-2">
            <Banknote className="w-3.5 h-3.5 text-subtle" /> Payment
          </p>
          <p className="text-sm font-semibold text-fg">Cash on delivery</p>
          <p className="text-[13px] text-muted mt-0.5">
            Pay <span className="tabular font-semibold text-fg">{fp(total)}</span>{" "}
            when the parcel reaches you.
          </p>
        </div>
      </div>

      <div>
        <p className="label-caps text-muted mb-2.5">
          Items ({items.length})
        </p>
        <ul className="rounded-lg border border-line divide-y divide-line overflow-hidden">
          {items.map((item) => (
            <li
              key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
              className="flex items-center gap-3 p-3 min-w-0 bg-surface"
            >
              <div className="relative w-14 h-14 rounded-md overflow-hidden bg-surface-2 border border-line shrink-0">
                <Image
                  src={safeImage(item.product.images)}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-fg line-clamp-1">
                  {item.product.name}
                </p>
                <p className="text-[12px] text-muted mt-0.5">
                  <span className="tabular">
                    {item.quantity} × {fp(item.product.price)}
                  </span>
                  {item.selectedSize && ` · ${item.selectedSize}`}
                  {item.selectedColor && ` · ${item.selectedColor}`}
                </p>
              </div>
              <p className="tabular text-sm font-bold text-price shrink-0">
                {fp(item.product.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <dl className="border-t border-line pt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular font-semibold text-fg shrink-0">{fp(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted min-w-0 truncate">
            Delivery · {DELIVERY_ZONE_LABELS[deliveryZone]}
          </dt>
          <dd className="tabular font-semibold text-fg shrink-0">{fp(shippingCost)}</dd>
        </div>
        {tax > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Tax</dt>
            <dd className="tabular font-semibold text-fg shrink-0">{fp(tax)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-line">
          <dt className="text-[15px] font-bold text-fg">Total</dt>
          <dd className="tabular text-xl font-bold text-price shrink-0">{fp(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
