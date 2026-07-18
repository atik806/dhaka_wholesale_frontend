"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

export function OrderComplete() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container py-20"
    >
      <Breadcrumbs items={[{ label: "Order Complete" }]} />
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-serif text-3xl font-bold mb-3">
            Order Confirmed!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
            Thank you for your purchase. You&apos;ll receive a confirmation
            email shortly.
          </p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </motion.div>

        <div className="mt-12 flex justify-center gap-2">
          {[1.5, 2.3, 1.8, 3.0, 2.7, 1.2, 2.5, 3.5, 1.0, 2.1, 2.8, 1.6].map((dur, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0, rotate: 0 }}
              animate={{
                y: [0, 300],
                opacity: [1, 0],
                rotate: 360,
              }}
              transition={{
                duration: dur,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="fixed w-2 h-2 rounded-full"
              style={{
                left: `${5 + i * 8}%`,
                backgroundColor: [
                  "#0f766e",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                  "#ec4899",
                ][i % 5],
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
