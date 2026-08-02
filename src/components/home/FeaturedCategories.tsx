"use client";

import Link from "next/link";
import { useCategories } from "@/src/hooks/useApi";
import { CategoryCard } from "@/src/components/product/CategoryCard";
import { Section, SectionHeader } from "@/src/components/ui/Section";
import { buttonClasses } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import type { Category } from "@/src/types/product";

interface FeaturedCategoriesProps {
  /** Server-rendered data so the section paints instantly; SWR revalidates in the background. */
  fallbackData?: Category[];
}

export function FeaturedCategories({ fallbackData }: FeaturedCategoriesProps) {
  const { data, isLoading } = useCategories(fallbackData);
  const categories = data ?? fallbackData ?? [];

  return (
    <Section>
      <SectionHeader
        eyebrow="Shop by category"
        title="Explore categories"
        description="Browse our curated collection — find exactly what you need across every department."
        href="/shop"
        linkLabel="View all categories"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {isLoading && categories.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
            ))
          : categories
              .slice(0, 6)
              .map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))}
      </div>

      <div className="mt-6 sm:hidden">
        <Link
          href="/shop"
          className={buttonClasses({ variant: "outline", fullWidth: true })}
        >
          View all categories
        </Link>
      </div>
    </Section>
  );
}
