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

      {/*
        Only what a courier needs: name, mobile and one address line.
        Customers said the old seven-field form felt like an NID application.
        City is filled in from the delivery area (see app/checkout/page.tsx).
      */}
      <div className="space-y-4">
        <Input
          label="Your name / আপনার নাম"
          autoComplete="name"
          placeholder="e.g. Nusrat Jahan"
          value={values.firstName}
          onChange={set("firstName")}
          error={errors.firstName}
        />
        <Input
          label="Mobile number / মোবাইল নম্বর"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          value={values.phone}
          onChange={set("phone")}
          error={errors.phone}
          hint={errors.phone ? undefined : "We call this number before delivery / ডেলিভারির আগে কল করা হবে"}
        />
        <Input
          label="Full address / পুরো ঠিকানা"
          autoComplete="street-address"
          placeholder="House/Road, Area, Thana, District"
          value={values.address}
          onChange={set("address")}
          error={errors.address}
          hint={errors.address ? undefined : "বাসা/রোড, এলাকা, থানা, জেলা"}
        />
      </div>
    </div>
  );
}
