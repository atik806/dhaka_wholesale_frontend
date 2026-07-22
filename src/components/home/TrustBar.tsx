"use client";

import { motion } from "framer-motion";
import { CreditCard, Truck, ShieldCheck, HeadphonesIcon, RefreshCw, CheckSquare } from "lucide-react";

const features = [
  { icon: CreditCard, title: "COD AVAILABLE", description: "Pay on delivery at door" },
  { icon: Truck, title: "EXPRESS SHIPPING", description: "24-48h nationwide delivery" },
  { icon: ShieldCheck, title: "VERIFIED QUALITY", description: "Premium quality guaranteed" },
  { icon: RefreshCw, title: "7-DAY RETURNS", description: "Easy item exchanges" },
  { icon: HeadphonesIcon, title: "CUSTOMER CARE", description: "Dedicated support team" },
];

export function TrustBar() {
  return (
    <section className="py-10 bg-[#FBF6EC] border-b border-[#E7DCC4]">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-[3px] border border-[#E7DCC4] hover:border-[#F5A300] hover:shadow-sm transition-all flex flex-col items-center text-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-[#132A3A] text-[#F5A300] flex items-center justify-center border border-[#E7DCC4] shadow-inner shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-[#132A3A] tracking-tight">{title}</p>
                <p className="text-[11px] text-[#1C1A17]/70 font-sans mt-0.5 leading-snug">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
