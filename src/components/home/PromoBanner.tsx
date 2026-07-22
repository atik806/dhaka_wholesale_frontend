"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
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
    badge: "DHAKADROP CLEARANCE SALE",
    title: "Seasonal Sale — Up to 40% Off",
    subtitle: "Hundreds of trending items at great prices. Cash on delivery available on all items.",
    button_text: "CLAIM DISCOUNT",
    button_link: "/shop",
    enabled: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/site-settings/promo_banner`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.enabled !== false) {
          setPromo(data);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!promo.enabled) return null;

  return (
    <section className="py-12 md:py-16 bg-[#BE3D1F] border-y-2 border-[#E7DCC4] text-white relative overflow-hidden">
      {/* Subtle stamped ledger watermark pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12"
        >
          {/* Text Content */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#132A3A] text-[#F5A300] font-mono text-xs px-3.5 py-1 font-bold -rotate-1 rounded-[2px] border border-[#F5A300]/40 shadow-sm uppercase tracking-wider mb-4">
              <Tag className="w-3.5 h-3.5" />
              {promo.badge}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              {promo.title}
            </h2>

            <p className="text-white/85 text-sm sm:text-base max-w-xl leading-relaxed font-sans mb-6">
              {promo.subtitle}
            </p>

            <Link
              href={promo.button_link || "/shop"}
              className="inline-flex items-center gap-2 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] font-extrabold text-sm px-8 py-3.5 rounded-[3px] shadow-xl border border-[#D88900] transition-all hover:scale-[1.02] active:scale-95 -rotate-2 hover:rotate-0"
            >
              {promo.button_text} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Large circular rotated 'stamp' showing the discount percentage, like a rubber ink stamp */}
          <motion.div
            initial={{ rotate: -15, scale: 0.9 }}
            whileInView={{ rotate: -8, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="shrink-0 relative"
          >
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-dashed border-white/90 bg-[#132A3A]/40 backdrop-blur-sm p-3 flex flex-col items-center justify-center text-center shadow-2xl relative group">
              <div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none" />
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-widest text-[#F5A300] uppercase mb-0.5">
                DHAKADROP
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-white leading-none">
                40% OFF
              </span>
              <span className="font-mono text-[9px] font-bold text-[#E7DCC4] uppercase tracking-wider mt-1">
                RUBBER STAMPED
              </span>
              <div className="w-2 h-2 rounded-full bg-[#F5A300] mt-1" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
