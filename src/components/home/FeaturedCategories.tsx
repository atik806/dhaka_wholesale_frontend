"use client";

import Link from "next/link";
import { useCategories } from "@/src/hooks/useApi";
import { CategoryCard } from "@/src/components/product/CategoryCard";
import { Section, SectionHeader } from "@/src/components/ui/Section";
import { buttonClasses } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";

export function FeaturedCategories() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <Section>
      <SectionHeader
        eyebrow="Shop by category"
        title="Browse categories"
        description="Shop from our curated collection across multiple categories."
        href="/shop"
        linkLabel="View all categories"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 w-full rounded-lg" />
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
