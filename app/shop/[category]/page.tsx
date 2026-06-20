"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import products from "@/src/data/products.json";
import type { Product } from "@/src/types/product";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { categories } from "@/src/lib/constants";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const category = categories.find((c) => c.slug === categorySlug);

  const categoryProducts = useMemo(() => {
    return (products as Product[]).filter(
      (p) =>
        p.category.toLowerCase().replace(/\s+/g, "-") ===
        categorySlug.toLowerCase()
    );
  }, [categorySlug]);

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          { label: category.name },
        ]}
      />

      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
          {category.name}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">{category.description}</p>
      </div>

      <ProductGrid products={categoryProducts} />
    </motion.div>
  );
}
