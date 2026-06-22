"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";

const SceneContainer = dynamic(
  () => import("@/src/components/three/SceneContainer").then((m) => ({ default: m.SceneContainer })),
  { ssr: false }
);

const Hero3DShowcase = dynamic(
  () => import("@/src/components/three/Hero3DShowcase").then((m) => ({ default: m.Hero3DShowcase })),
  { ssr: false }
);

const FloatingShapes = dynamic(
  () => import("@/src/components/three/FloatingShapes").then((m) => ({ default: m.FloatingShapes })),
  { ssr: false }
);

const titleWords = ["Discover", "Premium", "Lifestyle"];

const features = [
  { icon: Truck, label: "Free Shipping", sub: "Orders over $50" },
  { icon: Shield, label: "Secure Checkout", sub: "100% protected" },
  { icon: RotateCcw, label: "Easy Returns", sub: "30-day policy" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-amber-950/30">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(15, 118, 110, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.06) 0%, transparent 50%)",
        }}
      />

      <SceneContainer className="hidden lg:block">
        <Hero3DShowcase />
        <FloatingShapes count={6} />
      </SceneContainer>

      <div className="container relative z-10 py-16 md:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary/20 dark:border-primary/30"
            >
              <Sparkles className="w-4 h-4" />
              New Collection Available
            </motion.div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight mb-6 text-zinc-900 dark:text-zinc-100">
              {titleWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                  className="block"
                >
                  {word}
                  {i === 0 && <span className="text-primary dark:text-primary-light">.</span>}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mb-8 leading-relaxed"
            >
              Curated collections of the finest products from around the
              world. Quality you can see, feel, and trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap items-center gap-3 mb-12"
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?sort=newest"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
              >
                New Arrivals
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap items-center gap-6 md:gap-8"
            >
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <f.icon className="w-4 h-4 text-primary dark:text-primary-light" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{f.label}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{f.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative hidden lg:block h-[550px] w-full" />
        </div>
      </div>
    </section>
  );
}
