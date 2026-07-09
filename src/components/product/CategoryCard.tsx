"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/src/types/product";
import { TiltCard } from "@/src/components/three/TiltCard";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <TiltCard tiltDegree={5} scale={1.01} glare={false}>
        <Link
          href={`/shop/${category.slug}`}
          className="group relative block aspect-[4/3] rounded-2xl overflow-hidden"
        >
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-serif text-xl font-bold mb-1">
              {category.name}
            </h3>
            <p className="text-white/70 text-sm mb-3">
              {category.productCount} Products
            </p>
            <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Explore <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}
