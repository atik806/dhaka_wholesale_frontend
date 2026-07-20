"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-light">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(227,28,35,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(240,161,26,0.2) 0%, transparent 40%)" }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-danger/10 translate-y-1/2 -translate-x-1/4 blur-3xl" />

      <div className="container relative z-10 py-14 md:py-20 lg:py-28">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-6 border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Wholesale Prices for Everyone
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-white mb-6"
          >
            Quality Products.
            <br />
            <span className="text-accent">Wholesale Prices.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg text-white/70 max-w-lg mb-8 leading-relaxed"
          >
            Your trusted wholesale marketplace for quality products at competitive prices.
            Built for real shops and homes across Bangladesh.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-accent text-primary-dark px-8 py-3.5 rounded-xl font-semibold hover:bg-accent-light transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 text-sm"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop?sort=newest"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors px-5 py-3.5 rounded-xl border border-white/20 hover:border-white/40"
            >
              New Arrivals
            </Link>
          </motion.div>
        </div>


      </div>
    </section>
  );
}
