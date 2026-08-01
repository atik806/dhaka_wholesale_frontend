"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/src/types/product";
import { IMAGE_BLUR_PLACEHOLDER } from "@/src/lib/utils";

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
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Link
        href={`/shop/${category.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:border-line-strong hover:shadow-lg hover:-translate-y-0.5"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
          <Image
            src={imgSrc}
            alt={category.name}
            fill
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_PLACEHOLDER}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            onError={() => setImgSrc("/placeholder.svg")}
          />

          {/* Gradient overlay — dark at bottom for text, subtle at top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight group-hover:translate-y-[-2px] transition-transform duration-200">
              {category.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
              <span className="text-[12px] font-semibold text-accent tracking-wide uppercase">
                {category.productCount} {category.productCount === 1 ? "item" : "items"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-accent transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
