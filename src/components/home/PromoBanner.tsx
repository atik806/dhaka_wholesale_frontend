"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Percent } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/src/lib/constants";

interface PromoBannerData {
  badge?: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  enabled?: boolean;
}

export function PromoBanner() {
  const [promo, setPromo] = useState<PromoBannerData>({
    badge: "Limited Time Offer",
    title: "Summer Sale — Up to 40% Off",
    subtitle: "Exclusive discounts on our most-loved products. Don't miss out on these incredible deals.",
    button_text: "Shop Sale",
    button_link: "/shop",
    enabled: true,
  });

  useEffect(() => {
    fetch(`${API_BASE}/site-settings/promo_banner`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.enabled !== false) {
          setPromo(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!promo.enabled) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e31c23] via-[#c41820] to-[#a0141a] p-8 md:p-12 lg:p-16"
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(240,161,26,0.2) 0%, transparent 40%)" }} />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full mb-5 border border-white/10"
              >
                <Clock className="w-3.5 h-3.5" />
                {promo.badge}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-3xl md:text-4xl font-bold text-white mb-3"
              >
                {promo.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white/75 text-sm leading-relaxed max-w-md"
              >
                {promo.subtitle}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-2 text-white/80">
                <Percent className="w-5 h-5" />
                <span className="text-sm font-medium">Up to 40% Off</span>
              </div>
              <Link
                href={promo.button_link || "/shop"}
                className="inline-flex items-center gap-2 bg-white text-[#e31c23] px-8 py-3.5 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-xl hover:-translate-y-0.5 text-sm"
              >
                {promo.button_text} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
