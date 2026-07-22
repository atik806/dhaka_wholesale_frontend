"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { ShopSkeleton } from "@/src/components/ui/Skeleton";
import { useCategory, useProducts } from "@/src/hooks/useApi";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  return <CategoryPageContent key={categorySlug} categorySlug={categorySlug} />;
}

function CategoryPageContent({ categorySlug }: { categorySlug: string }) {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: category, isLoading: catLoading } = useCategory(categorySlug);
  const { data: result, isLoading: prodLoading } = useProducts({ category: categorySlug, page, limit });

  const loading = catLoading || prodLoading;

  if (loading) {
    return <ShopSkeleton />;
  }

  if (!category) {
    return (
      <div className="container py-20 text-center bg-[#FBF6EC] dark:bg-[#0D1F2C]">
        <h1 className="font-serif text-2xl font-bold text-[#132A3A] dark:text-[#E7DCC4]">Category Not Found</h1>
        <p className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4] mt-2">The specified category could not be found.</p>
        <Link href="/shop" className="mt-4 inline-block font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] bg-[#F5A300] px-4 py-2 rounded-[3px] border border-[#D88900]">
          RETURN TO SHOP &rarr;
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen py-8"
    >
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            { label: category.name },
          ]}
        />

        <div className="bg-white dark:bg-[#132A3A] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 rounded-[3px] shadow-sm mb-8">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#132A3A] px-2.5 py-1 rounded-[2px] mb-2 -rotate-1">
            <BookOpen className="w-3.5 h-3.5" /> CATEGORY
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4] mb-2">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] font-sans">{category.description}</p>
        </div>

        <ProductGrid products={result?.products || []} />

        {result && result.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10 font-mono text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] rounded-[3px] font-bold text-[#132A3A] dark:text-[#E7DCC4] disabled:opacity-40"
            >
              PREVIOUS
            </button>
            <span className="font-bold text-[#132A3A] dark:text-[#E7DCC4]">
              PAGE {page} OF {result.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              disabled={page === result.totalPages}
              className="px-4 py-2 border border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] rounded-[3px] font-bold text-[#132A3A] dark:text-[#E7DCC4] disabled:opacity-40"
            >
              NEXT
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
