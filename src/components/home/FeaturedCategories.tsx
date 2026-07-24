"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/src/hooks/useApi";
import { CategoryCard } from "@/src/components/product/CategoryCard";

export function FeaturedCategories() {
  const { data: categories = [] } = useCategories();

  return (
    <section className="py-14 md:py-20 bg-[#FBF6EC] dark:bg-[#0D1F2C] border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 md:mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#BE3D1F] bg-[#BE3D1F]/10 px-2.5 py-1 border border-[#BE3D1F]/20 rounded-[2px] mb-2">
              <BookOpen className="w-3.5 h-3.5" /> MARKET SECTIONS
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">              Browse Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] mt-1 font-sans">              Shop from our curated collection across multiple categories.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] bg-white dark:bg-[#132A3A] border border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2 rounded-[3px] hover:border-[#F5A300] hover:bg-[#F5A300] transition-colors shadow-sm"
          >
            VIEW ALL SECTIONS <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
