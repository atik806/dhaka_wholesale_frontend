"use client";

import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/src/components/product/ProductCard";
import { ProductCardSkeleton } from "@/src/components/ui/Skeleton";
import { useFeaturedProducts } from "@/src/hooks/useApi";

export function TrendingProducts() {
  const { data: products, isLoading } = useFeaturedProducts();
  const trending = (products || []).slice(0, 8);

  return (
    <section className="py-14 md:py-20 bg-[#FBF6EC] border-b border-[#E7DCC4]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 md:mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1F6F50] bg-[#1F6F50]/10 px-2.5 py-1 border border-[#1F6F50]/20 rounded-[2px] mb-2">
              <Tag className="w-3.5 h-3.5" /> TRENDING NOW
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#132A3A]">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-[#1C1A17]/70 mt-1 font-sans">
              Handpicked products with fast shipping and great prices.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#132A3A] bg-white border border-[#E7DCC4] px-4 py-2 rounded-[3px] hover:border-[#F5A300] hover:bg-[#F5A300] transition-colors shadow-sm"
          >
            EXPLORE ALL PRODUCTS <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#132A3A] bg-[#F5A300] px-5 py-2.5 rounded-[3px] border border-[#D88900]"
          >
            VIEW ALL PRODUCTS &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
