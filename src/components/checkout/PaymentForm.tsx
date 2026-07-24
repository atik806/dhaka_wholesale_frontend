"use client";

import { Banknote, Check, ShieldCheck } from "lucide-react";

export function PaymentForm() {
  return (
    <div className="space-y-3">
      <div className="relative flex items-start gap-3.5 rounded-lg border border-accent bg-accent-soft p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface border border-line">
          <Banknote className="h-5 w-5 text-success" />
        </span>
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-sm font-bold text-fg">Cash on delivery</p>
          <p className="text-[13px] text-muted mt-0.5">
            Pay the delivery agent in cash when your order arrives. No advance
            payment, no card needed.
          </p>
        </div>
        <span
          aria-hidden="true"
          className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-fg"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      </div>

      <p className="flex items-center gap-2 text-[13px] text-muted">
        <ShieldCheck className="h-4 w-4 text-success shrink-0" />
        Inspect your parcel before you pay — every order is COD protected.
      </p>
    </div>
  );
}
