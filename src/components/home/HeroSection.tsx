"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FloatingImage {
  src: string;
  alt: string;
  top: string;
  left: string;
  rotate: number;
}

const floatingImages: FloatingImage[] = [
  {
    src: "https://picsum.photos/seed/hero-1/400/400",
    alt: "Product 1",
    top: "5%",
    left: "55%",
    rotate: -8,
  },
  {
    src: "https://picsum.photos/seed/hero-2/400/400",
    alt: "Product 2",
    top: "40%",
    left: "70%",
    rotate: 5,
  },
  {
    src: "https://picsum.photos/seed/hero-3/400/400",
    alt: "Product 3",
    top: "55%",
    left: "30%",
    rotate: -5,
  },
];

const titleWords = ["Discover", "Premium", "Lifestyle"];

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-amber-950/30">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(15, 118, 110, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.06) 0%, transparent 50%)",
        }}
      />

      <div className="container relative z-10 py-12 md:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-sm font-medium px-4 py-1.5 rounded-full mb-6"
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
              className="flex items-center gap-4"
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?sort=newest"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 transition-colors px-1"
              >
                New Arrivals
              </Link>
            </motion.div>
          </div>

          <div className="relative hidden lg:block h-[500px] w-full">
            {floatingImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1 + i * 0.2 }}
                className="absolute"
                style={{
                  left: img.left,
                  top: img.top,
                  rotate: `${img.rotate}deg`,
                }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-56 h-56 xl:w-64 xl:h-64 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
