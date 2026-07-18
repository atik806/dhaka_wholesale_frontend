"use client";

import type { DeliveryZone } from "@/src/lib/constants";
import { DELIVERY_CHARGES } from "@/src/lib/constants";
import { Input } from "@/src/components/ui/Input";

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
      <h2 className="font-serif text-2xl font-bold">Shipping Address</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Delivery Area</label>
        <div className="grid grid-cols-2 gap-3">
          {(['inside_dhaka', 'outside_dhaka'] as const).map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => onDeliveryZoneChange(zone)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                deliveryZone === zone
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {zone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Delivery Charge: ৳{DELIVERY_CHARGES[zone]}
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
