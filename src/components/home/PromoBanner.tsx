"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

const SceneContainer = dynamic(
  () => import("@/src/components/three/SceneContainer").then((m) => ({ default: m.SceneContainer })),
  { ssr: false }
);

const ParticleField = dynamic(
  () => import("@/src/components/three/ParticleField").then((m) => ({ default: m.ParticleField })),
  { ssr: false }
);

export function PromoBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-emerald-800 p-10 md:p-16"
        >
          <SceneContainer className="opacity-40">
            <ParticleField count={150} color="#ffffff" size={0.02} opacity={0.3} />
          </SceneContainer>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />

          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/10"
            >
              <Clock className="w-3.5 h-3.5" />
              Limited Time Offer
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
                  Summer Sale &mdash; Up to 40% Off
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-emerald-100/80 text-sm leading-relaxed max-w-md"
                >
                  Exclusive discounts on our most-loved products. Free shipping on orders over $50.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="hidden sm:flex items-center gap-3">
                  {["02", "14", "36"].map((val, i) => (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{val}</span>
                      </div>
                      <p className="text-[10px] text-emerald-200/70 mt-1 uppercase tracking-wider">
                        {["Days", "Hrs", "Min"][i]}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-medium hover:bg-emerald-50 transition-all shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
                >
                  Shop Sale <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
