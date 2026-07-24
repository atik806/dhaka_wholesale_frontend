"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import type { Product } from "@/src/types/product";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProductCardSkeleton } from "@/src/components/ui/Skeleton";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const gridClasses =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-7 w-7 text-subtle" />}
        title="No products found"
        description="Try adjusting your search or filter criteria to see more results."
      />
    );
  }

  return (
    <motion.div layout className={gridClasses}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </motion.div>
  );
}
