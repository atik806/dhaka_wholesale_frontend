"use client";

import type { DeliveryZone } from "@/src/lib/constants";
import { DELIVERY_CHARGES, DELIVERY_ZONE_LABELS } from "@/src/lib/constants";
import { Input } from "@/src/components/ui/Input";
import { Truck } from "lucide-react";

export interface ShippingFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

interface ShippingFormProps {
  values: ShippingFormValues;
  onChange: (v: ShippingFormValues) => void;
  errors: Record<string, string>;
  deliveryZone: DeliveryZone;
  onDeliveryZoneChange: (zone: DeliveryZone) => void;
}

export function ShippingForm({
  values,
  onChange,
  errors,
  deliveryZone,
  onDeliveryZoneChange,
}: ShippingFormProps) {
  const set = (field: keyof ShippingFormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-extrabold text-[#132A3A]">Shipping Address</h2>

      <div className="space-y-2">
        <label className="block font-mono text-xs font-bold text-[#132A3A] uppercase tracking-wider">Delivery Area</label>
        <div className="grid grid-cols-2 gap-3">
          {(['inside_dhaka', 'outside_dhaka'] as const).map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => onDeliveryZoneChange(zone)}
              className={`rounded-[3px] border-2 p-4 text-left transition-all ${
                deliveryZone === zone
                  ? "border-[#F5A300] bg-[#F5A300]/10"
                  : "border-[#E7DCC4] hover:border-[#132A3A]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Truck className={`w-4 h-4 ${deliveryZone === zone ? "text-[#F5A300]" : "text-[#132A3A]/40"}`} />
                <p className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4]">
                  {DELIVERY_ZONE_LABELS[zone]}
                </p>
              </div>
              <p className="font-mono text-xs text-[#1F6F50] font-bold">
                Delivery: ৳{DELIVERY_CHARGES[zone]}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="First Name" placeholder="John" value={values.firstName} onChange={set("firstName")} error={errors.firstName} />
        <Input label="Last Name" placeholder="Doe" value={values.lastName} onChange={set("lastName")} error={errors.lastName} />
      </div>
      <Input label="Email" type="email" placeholder="john@example.com" value={values.email} onChange={set("email")} error={errors.email} />
      <Input label="Phone" type="tel" placeholder="+880 1XXX-XXXXXX" value={values.phone} onChange={set("phone")} error={errors.phone} />
      <Input label="Address" placeholder="123 Main Street" value={values.address} onChange={set("address")} error={errors.address} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="City" placeholder="Dhaka" value={values.city} onChange={set("city")} error={errors.city} />
        <Input label="ZIP Code" placeholder="1205" value={values.zipCode} onChange={set("zipCode")} error={errors.zipCode} />
      </div>
    </div>
  );
}
