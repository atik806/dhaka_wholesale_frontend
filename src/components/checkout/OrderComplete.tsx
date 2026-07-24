"use client";

import { motion } from "framer-motion";
import { Check, Copy, CheckCheck, Phone, PackageCheck, Banknote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/src/components/ui/Button";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Card } from "@/src/components/ui/Card";

interface OrderCompleteProps {
  orderId?: string;
}

const nextSteps = [
  {
    icon: Phone,
    title: "We confirm by phone",
    description:
      "Our team calls the number you provided to verify the order and delivery address.",
  },
  {
    icon: PackageCheck,
    title: "Your parcel ships out",
    description:
      "Inside Dhaka usually arrives in 1–2 days; outside Dhaka takes 2–4 days.",
  },
  {
    icon: Banknote,
    title: "You pay on delivery",
    description:
      "Inspect the parcel, then hand the cash to the delivery agent. Nothing to pay now.",
  },
];

export function OrderComplete({ orderId }: OrderCompleteProps) {
  const [copied, setCopied] = useState(false);
  const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : null;

  const handleCopy = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-canvas min-h-screen overflow-x-hidden"
    >
      <div className="container py-8 sm:py-12">
        <Breadcrumbs items={[{ label: "Order confirmed" }]} />

        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success-soft border border-success/30 flex items-center justify-center mx-auto mb-5"
            >
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-success" strokeWidth={2.5} />
            </motion.div>
            <p className="label-caps text-success mb-2">Order confirmed</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Thank you — your order is placed
            </h1>
            <p className="text-muted text-sm sm:text-[15px] max-w-md mx-auto leading-relaxed">
              We&apos;ve received your order and will contact you shortly to
              confirm delivery. This is a cash-on-delivery order, so there is
              nothing to pay right now.
            </p>
          </div>

          {orderId && (
            <Card className="mt-7 p-4 sm:p-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="label-caps text-muted mb-1.5">Order number</p>
                  <p className="font-mono text-lg sm:text-xl font-bold text-fg tabular">
                    #{shortId}
                  </p>
                  <p className="font-mono text-[12px] text-subtle break-all mt-1">
                    {orderId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy order number"
                  className="shrink-0 inline-flex items-center gap-1.5 h-11 px-3 rounded-md border border-line-strong bg-surface text-[13px] font-semibold text-fg hover:bg-surface-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-success" />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[12px] text-muted mt-3 pt-3 border-t border-line">
                Keep this number handy — you&apos;ll need it for any question
                about the order.
              </p>
            </Card>
          )}

          <div className="mt-4">
            <Card>
              <div className="px-5 py-4 border-b border-line">
                <h2 className="text-base font-bold">What happens next</h2>
              </div>
              <ol className="divide-y divide-line">
                {nextSteps.map(({ icon: Icon, title, description }, i) => (
                  <li key={title} className="flex gap-3.5 px-5 py-4">
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-line text-fg">
                      <Icon className="h-4 w-4 text-muted" />
                      <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-brand-fg text-[10px] font-bold tabular">
                        {i + 1}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-fg">{title}</p>
                      <p className="text-[13px] text-muted mt-0.5 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {orderId && (
              <Link
                href={`/account/orders/${orderId}`}
                className={buttonClasses({
                  size: "lg",
                  className: "w-full sm:flex-1",
                })}
              >
                View order details
              </Link>
            )}
            <Link
              href="/shop"
              className={buttonClasses({
                variant: "outline",
                size: "lg",
                className: "w-full sm:flex-1",
              })}
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
