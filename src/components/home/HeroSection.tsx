"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { BrandShowcase } from "./BrandShowcase";

export function HeroSection() {
  return (
    <section className="relative min-h-[60vh] md:min-h-[80vh] lg:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#eef3f9] via-white to-[#fff5f5] dark:from-[#071f43]/60 dark:via-zinc-900 dark:to-[#3a0a0c]/40">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 45%, rgba(11, 44, 95, 0.10) 0%, transparent 48%), radial-gradient(circle at 82% 18%, rgba(227, 28, 35, 0.08) 0%, transparent 45%), radial-gradient(circle at 70% 80%, rgba(240, 161, 26, 0.08) 0%, transparent 40%)",
        }}
      />

      <div className="container relative z-10 py-16 md:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55 }}
              className="mb-7"
            >
              <SiteLogo variant="auth" href={null} priority />
            </motion.div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6 text-zinc-900 dark:text-zinc-100">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="block"
              >
                Wholesale value.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28 }}
                className="block text-primary dark:text-primary-light"
              >
                Delivered to your door.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mb-8 leading-relaxed"
            >
              Quality products sourced for Bangladesh — competitive prices,
              trusted delivery, and a catalog built for real shops and homes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
               className="flex flex-wrap items-center gap-3 mb-8 md:mb-12"
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
          </div>

          <div className="relative hidden lg:block h-[550px] w-full">
            <BrandShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
