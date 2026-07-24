"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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
      className="relative overflow-hidden bg-[#131921] text-white"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      {/* Compact banner height — ~half viewport, Amazon / Wholesale Club style */}
      <div className="relative h-[min(42vh,340px)] min-h-[200px] max-h-[380px] sm:min-h-[240px] md:h-[min(38vh,320px)]">
        {/* Slides */}
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out"
            style={{
              backgroundImage: `url(${s.image})`,
              opacity: i === index ? 1 : 0,
              zIndex: i === index ? 1 : 0,
            }}
            aria-hidden={i !== index}
          />
        ))}

        {/* Gradient for text readability (left-weighted like Amazon) */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-[#0A1A28]/92 via-[#0A1A28]/55 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-t from-[#0A1A28]/50 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="container relative z-10 h-full flex items-center py-5 sm:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl"
            >
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#F5A300] mb-2">
                {slide.eyebrow}
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white mb-2 sm:mb-3">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-base text-white/85 max-w-md mb-4 sm:mb-5 leading-relaxed">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 bg-[#F5A300] hover:bg-[#D88900] text-[#131921] font-bold text-sm px-5 py-2.5 rounded-md shadow-md transition-colors"
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
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-[#F5A300]"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
