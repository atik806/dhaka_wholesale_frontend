"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BadgeCheck, Truck, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/src/components/ui/Button";
import { IMAGE_BLUR_PLACEHOLDER } from "@/src/lib/utils";

const SLIDES = [
  {
    image: "/hero-slides/slide-01.webp",
    eyebrow: "Dhaka Wholesale",
    title: "Direct market stock at store rates",
    subtitle: "Quality products, cash on delivery, and fast shipping nationwide.",
    cta: "Shop now",
    href: "/shop",
  },
  {
    image: "/hero-slides/slide-02.webp",
    eyebrow: "New arrivals",
    title: "Fresh stock, ready to ship",
    subtitle: "Browse the latest additions across every category.",
    cta: "See what's new",
    href: "/shop?sort=newest",
  },
  {
    image: "/hero-slides/slide-03.webp",
    eyebrow: "Best sellers",
    title: "Customer favorites this week",
    subtitle: "Top-rated picks trusted by shops and homes across Bangladesh.",
    cta: "Shop bestsellers",
    href: "/shop?sort=popular",
  },
  {
    image: "/hero-slides/slide-04.webp",
    eyebrow: "COD nationwide",
    title: "Pay when it arrives",
    subtitle: "Inside Dhaka ৳80 · Outside Dhaka ৳120 · Inspect before you pay.",
    cta: "Start shopping",
    href: "/shop",
  },
];

const HIGHLIGHTS = [
  { icon: Wallet, label: "Cash on delivery", detail: "Pay when the parcel arrives" },
  { icon: Truck, label: "Flat shipping", detail: "৳80 in Dhaka · ৳120 outside" },
  { icon: BadgeCheck, label: "Inspect first", detail: "Check your order before paying" },
];

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => go(index + 1), 6000);
    return () => window.clearInterval(id);
  }, [index, go]);

  return (
    <section
      className="bg-brand-deep"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      {/* Hero banner with premium height */}
      <div className="relative overflow-hidden h-[min(48vh,420px)] min-h-[240px] max-h-[460px] sm:min-h-[280px] md:h-[min(42vh,400px)] lg:h-[min(45vh,480px)]">
        {/* Subtle pattern overlay for texture */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, white 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Slides */}
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_PLACEHOLDER}
              loading={i === index ? undefined : "lazy"}
              sizes="100vw"
              className={`object-cover object-center ${i === index ? "ken-burns" : ""}`}
            />
          </div>
        ))}

        {/* Premium multi-layered overlay */}
        <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-r from-brand-deep/95 via-brand-deep/75 to-brand-deep/30" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-28 pointer-events-none bg-gradient-to-t from-brand-deep/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 z-[2] h-16 pointer-events-none bg-gradient-to-b from-brand-deep/30 to-transparent" />

        {/* Content */}
        <div className="container relative z-10 h-full flex items-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-2xl pr-12 sm:pr-16"
            >
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="label-caps text-accent mb-2.5"
              >
                {slide.eyebrow}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-brand-fg text-[28px] leading-[1.12] sm:text-4xl md:text-[2.85rem] lg:text-5xl font-bold mb-3"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="text-sm sm:text-base text-brand-fg/80 max-w-lg leading-relaxed mb-6"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
              >
                <Link
                  href={slide.href}
                  className={buttonClasses({
                    size: "md",
                    className:
                      "shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200",
                  })}
                >
                  {slide.cta}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium controls — pill-shaped with glass effect */}
        <button
          type="button"
          onClick={() => go(index - 1)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/50 text-brand-fg flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all duration-200 hover:scale-105"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/50 text-brand-fg flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all duration-200 hover:scale-105"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Premium slide indicators — pill badges */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="group relative h-8 px-1 flex items-center justify-center"
            >
              <span
                className={`rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 h-2 bg-accent shadow-sm shadow-accent/40"
                    : "w-2 h-2 bg-brand-fg/40 group-hover:bg-brand-fg/70 group-hover:w-3"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Refined service highlights bar */}
      <div className="bg-surface border-b border-line">
        <div className="container">
          <ul className="flex items-center gap-4 sm:gap-8 md:gap-12 overflow-x-auto scrollbar-none py-3.5 sm:py-4">
            {HIGHLIGHTS.map(({ icon: Icon, label, detail }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2.5 shrink-0"
              >
                <span className="h-9 w-9 rounded-lg bg-accent-soft text-accent-hover flex items-center justify-center shrink-0 ring-1 ring-accent/20">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-fg leading-tight">
                    {label}
                  </span>
                  <span className="block text-xs text-muted leading-tight tabular">
                    {detail}
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
