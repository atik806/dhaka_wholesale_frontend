"use client";

import { DollarSign } from "lucide-react";

export function PaymentForm() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Payment Method</h2>
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Cash on Delivery</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Pay when you receive your order</p>
          </div>
        </div>
      </div>
    </div>
  );
}
