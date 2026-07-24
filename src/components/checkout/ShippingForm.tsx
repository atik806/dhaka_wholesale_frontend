"use client";

import type { DeliveryZone } from "@/src/lib/constants";
import { DELIVERY_CHARGES, DELIVERY_ZONE_LABELS } from "@/src/lib/constants";
import { Input } from "@/src/components/ui/Input";
import { Check, Truck } from "lucide-react";

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
    <div className="space-y-6">
      <fieldset>
        <legend className="label-caps text-muted mb-2.5">Delivery area</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["inside_dhaka", "outside_dhaka"] as const).map((zone) => {
            const selected = deliveryZone === zone;
            return (
              <button
                key={zone}
                type="button"
                onClick={() => onDeliveryZoneChange(zone)}
                aria-pressed={selected}
                className={`relative rounded-lg border p-4 text-left transition-colors min-h-11 ${
                  selected
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"
                }`}
              >
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-fg"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1 pr-6">
                  <Truck
                    className={`w-4 h-4 shrink-0 ${selected ? "text-accent-fg" : "text-subtle"}`}
                  />
                  <span className="text-sm font-bold text-fg truncate">
                    {DELIVERY_ZONE_LABELS[zone]}
                  </span>
                </div>
                <p className="text-[13px] text-muted">
                  Delivery charge{" "}
                  <span className="tabular font-semibold text-fg">
                    ৳{DELIVERY_CHARGES[zone]}
                  </span>
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            autoComplete="given-name"
            placeholder="John"
            value={values.firstName}
            onChange={set("firstName")}
            error={errors.firstName}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            placeholder="Doe"
            value={values.lastName}
            onChange={set("lastName")}
            error={errors.lastName}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            value={values.email}
            onChange={set("email")}
            error={errors.email}
          />
          <Input
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="+880 1XXX-XXXXXX"
            value={values.phone}
            onChange={set("phone")}
            error={errors.phone}
            hint={errors.phone ? undefined : "We call this number before delivery"}
          />
        </div>
        <Input
          label="Street address"
          autoComplete="street-address"
          placeholder="House 12, Road 4, Dhanmondi"
          value={values.address}
          onChange={set("address")}
          error={errors.address}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            autoComplete="address-level2"
            placeholder="Dhaka"
            value={values.city}
            onChange={set("city")}
            error={errors.city}
          />
          <Input
            label="Postal code"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="1205"
            value={values.zipCode}
            onChange={set("zipCode")}
            error={errors.zipCode}
          />
        </div>
      </div>
    </div>
  );
}
