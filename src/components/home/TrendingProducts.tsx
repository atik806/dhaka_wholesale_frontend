"use client";

import { motion } from "framer-motion";
import products from "@/src/data/products.json";
import type { Product } from "@/src/types/product";
import { ProductCard } from "@/src/components/product/ProductCard";

export function TrendingProducts() {
  const trending = (products as Product[]).filter((p) => p.isFeatured).slice(0, 4);

  return (
    <section className="py-12 md:py-20 bg-zinc-50 dark:bg-zinc-800">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-primary-light mb-2 block">
            Trending Now
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Featured Products
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-3 max-w-md mx-auto">
            Handpicked favorites that everyone is talking about
          </p>
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
