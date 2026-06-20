"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { categories } from "@/src/lib/constants";
import { CategoryCard } from "@/src/components/product/CategoryCard";

export function FeaturedCategories() {
  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-primary-light mb-2 block">
              Categories
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary-light transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.slice(0, 6).map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
