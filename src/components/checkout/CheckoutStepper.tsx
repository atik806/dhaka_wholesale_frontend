"use client";

import { Truck, DollarSign, ClipboardList } from "lucide-react";

const steps = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: DollarSign },
  { id: "review", label: "Review", icon: ClipboardList },
];

export function CheckoutStepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = i === step;
        const isDone = i < step;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : isDone
                  ? "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-[2px] ${
                  i < step ? "bg-emerald-400" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
