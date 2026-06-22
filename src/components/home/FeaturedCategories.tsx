"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { categories } from "@/src/lib/constants";
import { CategoryCard } from "@/src/components/product/CategoryCard";

export function FeaturedCategories() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-primary-light mb-2 block">
              Categories
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Shop by Category
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm max-w-md">
              Explore our curated selection of premium categories, each crafted for quality and style.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {categories.slice(0, 6).map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:hidden"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary dark:text-primary-light"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
