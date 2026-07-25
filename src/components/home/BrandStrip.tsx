"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, Banknote, Headphones, RefreshCw, Clock } from "lucide-react";

const trustItems = [
  {
    icon: Banknote,
    title: "Cash on delivery",
    detail: "Pay when your parcel arrives",
  },
  {
    icon: Truck,
    title: "Fast shipping",
    detail: "24–48h inside Dhaka",
  },
  {
    icon: ShieldCheck,
    title: "Genuine products",
    detail: "Sourced direct from suppliers",
  },
  {
    icon: RefreshCw,
    title: "7-day exchange",
    detail: "Hassle-free returns",
  },
  {
    icon: Headphones,
    title: "Support 10am–8pm",
    detail: "Every day of the week",
  },
  {
    icon: Clock,
    title: "Order tracking",
    detail: "Real-time status updates",
  },
];

export function BrandStrip() {
  return (
    <section className="bg-surface-2 border-y border-line">
      <div className="container py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {trustItems.map(({ icon: Icon, title, detail }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-surface border border-line hover:border-accent/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <span className="w-11 h-11 rounded-xl bg-accent-soft text-accent-hover flex items-center justify-center ring-1 ring-accent/20 group-hover:ring-accent/40 group-hover:bg-accent-soft transition-all duration-200">
                <Icon className="w-5 h-5" strokeWidth={2} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-fg leading-tight">{title}</p>
                <p className="text-[11px] text-muted mt-0.5 leading-tight">{detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
