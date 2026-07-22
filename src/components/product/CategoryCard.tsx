"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Package, Sparkles, Layers, Tag, Box, Grid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/src/types/product";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

const pastelColors = [
  "bg-[#F5A300]/15 text-[#D88900] border-[#F5A300]/30",
  "bg-[#BE3D1F]/15 text-[#BE3D1F] border-[#BE3D1F]/30",
  "bg-[#1F6F50]/15 text-[#1F6F50] border-[#1F6F50]/30",
  "bg-[#132A3A]/15 text-[#132A3A] border-[#132A3A]/30",
];

const categoryIcons = [Package, Sparkles, Layers, Tag, Box, Grid];

export const CategoryCard = memo(function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const [imgSrc, setImgSrc] = useState(category.image || "/placeholder.svg");
  const colorClass = pastelColors[index % pastelColors.length];
  const IconComponent = categoryIcons[index % categoryIcons.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link
        href={`/shop/${category.slug}`}
        className="group block bg-white dark:bg-[#132A3A] rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#F5A300] relative overflow-hidden"
      >
        {/* Soft pastel icon circle at top */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm ${colorClass}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="font-mono text-[10px] font-bold text-[#132A3A] dark:text-[#E7DCC4] bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d] px-2 py-1 rounded-[2px]">
            #{index + 1}
          </span>
        </div>

        {/* Image preview thumbnail box */}
        <div className="relative w-full h-28 rounded-[2px] overflow-hidden bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4]/60 dark:border-[#2a3d4d]/60 mb-4">
          <Image
            src={imgSrc}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImgSrc("/placeholder.svg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#132A3A]/40 to-transparent" />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#132A3A] dark:text-[#E7DCC4] group-hover:text-[#F5A300] transition-colors leading-snug">
              {category.name}
            </h3>
            <p className="font-mono text-xs text-[#1F6F50] font-bold mt-1">
              {category.productCount} ITEMS
            </p>
          </div>
          <span className="w-8 h-8 rounded-[2px] bg-[#132A3A] text-white flex items-center justify-center group-hover:bg-[#F5A300] group-hover:text-[#132A3A] transition-colors shrink-0">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
});
