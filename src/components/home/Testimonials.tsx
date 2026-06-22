"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { testimonials } from "@/src/lib/constants";

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-primary-light mb-2 block">
              Testimonials
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              What Our Customers Say
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
              Real reviews from real people who love shopping with us.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="min-w-[300px] md:min-w-[320px] flex-shrink-0 snap-start bg-white dark:bg-zinc-800/80 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-primary/20 dark:text-primary-light/30 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-3.5 h-3.5 ${
                      j < t.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/10">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
