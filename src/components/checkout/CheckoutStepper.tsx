"use client";

import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

const defaultSteps = ["Shipping", "Payment", "Review"];

interface CheckoutStepperProps {
  /** Zero-based index of the current step. */
  step: number;
  steps?: string[];
  className?: string;
}

export function CheckoutStepper({
  step,
  steps = defaultSteps,
  className,
}: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress" className={cn("w-full", className)}>
      <ol className="flex items-start">
        {steps.map((label, i) => {
          const isDone = i < step;
          const isCurrent = i === step;
          return (
            <li
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-start min-w-0",
                i < steps.length - 1 && "flex-1",
              )}
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-bold tabular transition-colors",
                    isDone && "bg-success text-white border-transparent",
                    isCurrent &&
                      "bg-accent text-accent-fg border-transparent shadow-xs ring-4 ring-accent-soft",
                    !isDone && !isCurrent && "bg-surface-2 text-subtle border-line",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "label-caps text-center whitespace-nowrap",
                    isCurrent ? "text-fg" : isDone ? "text-muted" : "text-subtle",
                  )}
                >
                  {label}
                </span>
                <span className="sr-only">
                  {isDone ? "completed" : isCurrent ? "current step" : "upcoming"}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-[1.0625rem] mx-2 sm:mx-3 h-0.5 flex-1 rounded-full",
                    isDone ? "bg-success" : "bg-line-strong",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
