"use client";

import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, Clock } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const policies = [
  {
    icon: Truck,
    title: "Shipping Policy",
    content: [
      "Standard shipping (5-8 business days): ৳5",
      "Express shipping (2-3 business days): ৳12",
      "Next day shipping (1 business day): ৳20",
      "Orders are processed within 1-2 business days.",
      "We ship to all destinations in Bangladesh.",
      "Tracking information will be sent to your email once your order ships.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    content: [
      "We accept returns within 30 days of delivery.",
      "Items must be unworn, unwashed, and in original packaging.",
      "Sale items are final sale and cannot be returned.",
      "To start a return, visit your order history or contact our support team.",
      "Return shipping is free for exchanges, ৳5 for refunds.",
      "Refunds are processed within 5-7 business days after we receive your item.",
      "Original shipping charges are non-refundable.",
    ],
  },
  {
    icon: Shield,
    title: "Damage & Defects",
    content: [
      "If your item arrives damaged or defective, please contact us within 48 hours.",
      "Include your order number and photos of the damage.",
      "We will provide a free replacement or full refund including shipping.",
    ],
  },
  {
    icon: Clock,
    title: "Processing Times",
    content: [
      "Orders are processed Monday through Friday, excluding holidays.",
      "Peak season (November-December) may experience longer processing times.",
      "Custom or personalized items may require additional processing time.",
    ],
  },
];

export default function ShippingReturnsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Shipping & Returns" }]} />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Shipping & Returns</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-lg mx-auto">
            Everything you need to know about our shipping policies and return process.
          </p>
        </div>

        <div className="space-y-8">
          {policies.map(({ icon: Icon, title, content }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary dark:text-primary-light" />
                </div>
                <h2 className="font-semibold text-lg">{title}</h2>
              </div>
              <ul className="space-y-2">
                {content.map((line, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="text-primary dark:text-primary-light mt-1.5 shrink-0">•</span>
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
