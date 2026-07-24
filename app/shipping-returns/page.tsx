"use client";

import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, Clock } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Card } from "@/src/components/ui/Card";

const deliveryRates = {
  headers: ["Delivery zone", "Delivery charge", "Typical delivery time"],
  rows: [
    ["Inside Dhaka", "৳80", "24–48 hours"],
    ["Outside Dhaka", "৳120", "48–72 hours"],
  ],
};

const policies = [
  {
    icon: Truck,
    title: "Shipping Policy",
    content: [
      "Payment method: Cash on Delivery (COD) only — no cards, PayPal, bKash, or Nagad online yet.",
      "Orders are processed within 1–2 business days.",
      "We ship across Bangladesh (all districts).",
      "Track status anytime in My Account → Order History after you sign in.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    content: [
      "We accept returns within 7 days of delivery for defective or incorrect items.",
      "Items should be unused and in original packaging when possible.",
      "To start a return, open My Account order history or contact support with your order number.",
      "Return shipping is free for defective items we shipped incorrectly.",
      "For COD orders, approved refunds or replacements are arranged after we verify the return (usually 3–5 business days).",
      "Delivery charges are non-refundable for non-defective returns.",
    ],
  },
  {
    icon: Shield,
    title: "Damage & Defects",
    content: [
      "If your item arrives damaged or defective, contact us within 48 hours.",
      "Include your order number and photos of the damage.",
      "We will provide a free replacement or a full refund of the item price (including shipping when the fault is ours).",
      "Bulk orders: defective units will be replaced at no extra cost.",
    ],
  },
  {
    icon: Clock,
    title: "Processing Times",
    content: [
      "Orders are processed Monday through Friday, excluding holidays.",
      "Peak season may take a little longer — check My Account for the latest status.",
      "COD orders may be confirmed by phone before dispatch.",
    ],
  },
];

export default function ShippingReturnsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas"
    >
      <header className="bg-surface border-b border-line">
        <div className="container py-10 md:py-14">
          <Breadcrumbs items={[{ label: "Shipping & Returns" }]} />
          <p className="label-caps text-accent-text mb-2">Logistics &amp; returns</p>
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-3">
            Shipping &amp; Returns
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-[65ch]">
            Everything you need to know about our shipping policies and return process.
          </p>
        </div>
      </header>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-1.5">Delivery rates</h2>
            <p className="text-sm text-muted mb-4 max-w-[65ch]">
              Charges are added at checkout based on your delivery zone. We deliver
              nationwide across Bangladesh.
            </p>
            <div className="overflow-x-auto border border-line rounded-lg">
              <table className="w-full text-sm border-collapse">
                <caption className="sr-only">
                  Delivery charge and typical delivery time by zone
                </caption>
                <thead>
                  <tr className="bg-surface-2">
                    {deliveryRates.headers.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="text-left px-4 py-3 label-caps text-muted whitespace-nowrap border-b border-line"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deliveryRates.rows.map(([zone, charge, time]) => (
                    <tr key={zone} className="bg-surface even:bg-surface-2">
                      <th
                        scope="row"
                        className="text-left px-4 py-3 font-semibold text-fg whitespace-nowrap border-b border-line"
                      >
                        {zone}
                      </th>
                      <td className="px-4 py-3 tabular font-semibold text-fg whitespace-nowrap border-b border-line">
                        {charge}
                      </td>
                      <td className="px-4 py-3 tabular text-muted whitespace-nowrap border-b border-line">
                        {time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {policies.map(({ icon: Icon, title, content }, i) => (
            <motion.section
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card padded>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-md bg-accent-soft flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-accent-hover" />
                  </span>
                  <h2 className="text-lg font-bold">{title}</h2>
                </div>
                <ul className="space-y-2.5 max-w-[68ch]">
                  {content.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2.5 text-[15px] text-muted leading-[1.7]"
                    >
                      <span aria-hidden className="text-accent-hover mt-2 shrink-0 leading-none">
                        •
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.section>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
