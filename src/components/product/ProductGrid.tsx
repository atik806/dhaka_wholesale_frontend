"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import type { Product } from "@/src/types/product";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "@/src/components/ui/Skeleton";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <Package className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
          No products found
        </h3>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Try adjusting your search or filter criteria.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </motion.div>
  );
}
