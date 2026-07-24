"use client";

import { motion } from "framer-motion";
import { Check, Package, Copy, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

interface OrderCompleteProps {
  orderId?: string;
}

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
      className="container py-12 sm:py-20 bg-[#FBF6EC] dark:bg-[#0D1F2C] overflow-x-hidden"
    >
      <Breadcrumbs items={[{ label: "Order Complete" }]} />
      <div className="max-w-md mx-auto text-center px-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-20 h-20 rounded-full bg-[#1F6F50] flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#F5A300] bg-[#132A3A] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-4 -rotate-1">
            <Package className="w-3.5 h-3.5" /> ORDER CONFIRMED
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4] mb-3">
            Order Placed!
          </h1>

          {orderId && (
            <div className="mb-6 rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] p-4 text-left">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1C1A17]/60 dark:text-[#a0b4c4] mb-1">
                Order ID
              </p>
              <div className="flex items-start gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-lg font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">
                    #{shortId}
                  </p>
                  <p className="font-mono text-[11px] text-[#1C1A17]/50 dark:text-[#a0b4c4] break-all mt-0.5">
                    {orderId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 p-2 rounded-[2px] border border-[#E7DCC4] dark:border-[#2a3d4d] text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#FBF6EC] dark:hover:bg-[#0D1F2C] transition-colors"
                  aria-label="Copy order ID"
                >
                  {copied ? (
                    <CheckCheck className="w-4 h-4 text-[#1F6F50]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-[#1C1A17]/70 dark:text-[#a0b4c4] text-sm mb-8 font-sans">
            Thank you for your order. You&apos;ll receive a confirmation
            email shortly. Cash on delivery — pay at your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && (
              <Link href={`/account/orders/${orderId}`} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  VIEW ORDER
                </Button>
              </Link>
            )}
            <Link href="/shop" className="w-full sm:w-auto">
              <Button className="w-full">CONTINUE SHOPPING</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
