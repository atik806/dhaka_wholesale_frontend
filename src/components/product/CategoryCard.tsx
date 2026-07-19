"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/src/types/product";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export const CategoryCard = memo(function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        href={`/shop/${category.slug}`}
        className="group relative block aspect-[4/3] rounded-xl overflow-hidden"
      >
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white font-serif text-xl font-bold mb-0.5">
            {category.name}
          </h3>
          <p className="text-white/60 text-sm mb-3">
            {category.productCount} Products
          </p>
          <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            Explore <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
});
