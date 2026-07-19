"use client";

import { motion } from "framer-motion";
import { CreditCard, Clock } from "lucide-react";

const features = [
  { icon: CreditCard, title: "COD Available", description: "Pay on delivery" },
  { icon: Clock, title: "Fast Shipping", description: "1-3 business days" },
];

export function TrustBar() {
  return (
    <section className="py-12 md:py-16 border-b border-zinc-100 dark:border-zinc-800">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0b2c5f]/5 dark:bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#0b2c5f] dark:text-primary-light" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
