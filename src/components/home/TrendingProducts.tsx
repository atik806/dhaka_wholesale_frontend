"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import products from "@/src/data/products.json";
import type { Product } from "@/src/types/product";
import { ProductCard } from "@/src/components/product/ProductCard";

export function TrendingProducts() {
  const trending = (products as Product[]).filter((p) => p.isFeatured).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-zinc-50/80 dark:bg-zinc-800/50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.03)_0%,transparent_50%)]" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-primary-light mb-2 block">
              Trending Now
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Featured Products
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
              Handpicked favorites that everyone is talking about
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trending.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
