"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/src/components/product/ProductCard";
import { ProductCardSkeleton } from "@/src/components/ui/Skeleton";
import { useFeaturedProducts } from "@/src/hooks/useApi";

export function TrendingProducts() {
  const { data: products, isLoading } = useFeaturedProducts();
  const trending = (products || []).slice(0, 8);

  return (
    <section className="py-16 md:py-24 bg-zinc-50/80 dark:bg-zinc-800/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8 md:mb-12"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#f0a11a] mb-2 block">
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
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#0b2c5f] dark:text-primary-light hover:text-[#071f43] dark:hover:text-primary transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : trending.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0b2c5f]"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
