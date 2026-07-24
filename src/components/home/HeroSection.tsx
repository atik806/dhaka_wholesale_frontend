"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BadgeCheck, Truck, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/src/components/ui/Button";

const SLIDES = [
  {
    image: "/hero-slides/slide-01.png",
    eyebrow: "Dhaka Wholesale",
    title: "Direct market stock at store rates",
    subtitle: "Quality products, cash on delivery, and fast shipping nationwide.",
    cta: "Shop now",
    href: "/shop",
  },
  {
    image: "/hero-slides/slide-02.png",
    eyebrow: "New arrivals",
    title: "Fresh stock, ready to ship",
    subtitle: "Browse the latest additions across every category.",
    cta: "See what's new",
    href: "/shop?sort=newest",
  },
  {
    image: "/hero-slides/slide-03.png",
    eyebrow: "Best sellers",
    title: "Customer favorites this week",
    subtitle: "Top-rated picks trusted by shops and homes across Bangladesh.",
    cta: "Shop bestsellers",
    href: "/shop?sort=popular",
  },
  {
    image: "/hero-slides/slide-04.png",
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
      {/* Compact banner height — ~half viewport, Amazon / Wholesale Club style */}
      <div className="relative overflow-hidden h-[min(42vh,340px)] min-h-[200px] max-h-[380px] sm:min-h-[240px] md:h-[min(38vh,320px)]">
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
              sizes="100vw"
              className={`object-cover object-center ${i === index ? "ken-burns" : ""}`}
            />
          </div>
        ))}

        {/* Scrim for text readability (left-weighted like Amazon) */}
        <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-r from-brand-deep/95 via-brand-deep/70 to-brand-deep/20" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-20 pointer-events-none bg-gradient-to-t from-brand-deep/70 to-transparent" />

        {/* Content */}
        <div className="container relative z-10 h-full flex items-center py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl pr-10 sm:pr-14"
            >
              <p className="label-caps text-accent mb-2">{slide.eyebrow}</p>
              <h1 className="text-brand-fg text-[26px] leading-[1.15] sm:text-4xl md:text-[2.75rem] font-bold mb-2.5">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-base text-brand-fg/80 max-w-md leading-relaxed mb-5">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className={buttonClasses({ size: "md", className: "shadow-md" })}
              >
                {slide.cta}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <button
          type="button"
          onClick={() => go(index - 1)}
          className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-brand-deep/45 hover:bg-brand-deep/75 text-brand-fg flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-brand-deep/45 hover:bg-brand-deep/75 text-brand-fg flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="h-10 px-1.5 flex items-center justify-center group"
            >
              <span
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-7 bg-accent"
                    : "w-4 bg-brand-fg/40 group-hover:bg-brand-fg/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Honest service facts, directly under the banner */}
      <div className="bg-surface border-b border-line">
        <ul className="container flex gap-x-6 gap-y-3 overflow-x-auto scrollbar-none py-3 sm:justify-between">
          {HIGHLIGHTS.map(({ icon: Icon, label, detail }) => (
            <li key={label} className="flex items-center gap-2.5 shrink-0">
              <span className="h-8 w-8 rounded-md bg-accent-soft text-accent-hover flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-fg leading-tight">
                  {label}
                </span>
                <span className="block text-xs text-muted leading-tight tabular">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
