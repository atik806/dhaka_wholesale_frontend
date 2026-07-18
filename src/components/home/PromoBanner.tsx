"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/src/lib/constants";

const SceneContainer = dynamic(
  () => import("@/src/components/three/SceneContainer").then((m) => ({ default: m.SceneContainer })),
  { ssr: false }
);

const ParticleField = dynamic(
  () => import("@/src/components/three/ParticleField").then((m) => ({ default: m.ParticleField })),
  { ssr: false }
);

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
    subtitle: "Exclusive discounts on our most-loved products.",
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-[#5a0f14] p-6 md:p-10 lg:p-16"
        >
          <SceneContainer className="opacity-40">
            <ParticleField count={150} color="#ffffff" size={0.02} opacity={0.3} />
          </SceneContainer>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />

          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#e31c23]/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/10"
            >
              <Clock className="w-3.5 h-3.5" />
              {promo.badge}
            </motion.div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-lg">
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
                className="flex items-center gap-3"
              >
                <Link
                  href={promo.button_link || "/shop"}
                  className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-medium hover:bg-[#eef3f9] transition-all shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
                >
                  {promo.button_text} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
