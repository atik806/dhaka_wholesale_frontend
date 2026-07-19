"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/src/hooks/useApi";

export function FeaturedCategories() {
  const { data: categories = [] } = useCategories();

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8 md:mb-12"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#f0a11a] mb-2 block">
              Browse
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#0b2c5f] dark:text-primary-light hover:text-[#071f43] dark:hover:text-primary transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {categories.slice(0, 6).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="min-w-[260px] md:min-w-0 snap-start"
            >
              <Link
                href={`/shop/${cat.slug}`}
                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
              >
                <Image
                  src={cat.image || "/placeholder.svg"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 260px, 33vw"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-semibold text-lg mb-0.5">{cat.name}</h3>
                  <p className="text-white/60 text-sm">{cat.productCount} Products</p>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0b2c5f]"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
