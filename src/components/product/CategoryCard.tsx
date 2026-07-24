"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/src/types/product";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export const CategoryCard = memo(function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const [imgSrc, setImgSrc] = useState(category.image || "/placeholder.svg");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="h-full"
    >
      <Link
        href={`/shop/${category.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all duration-200 hover:border-line-strong hover:shadow-md"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          <Image
            src={imgSrc}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            onError={() => setImgSrc("/placeholder.svg")}
          />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-0.5 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-fg transition-colors group-hover:text-accent-hover">
            {category.name}
          </h3>
          <p className="tabular text-xs text-muted">
            {category.productCount} {category.productCount === 1 ? "item" : "items"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
});
