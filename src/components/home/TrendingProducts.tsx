"use client";

import Link from "next/link";
import { ProductCard } from "@/src/components/product/ProductCard";
import { ProductCardSkeleton } from "@/src/components/ui/Skeleton";
import { Section, SectionHeader } from "@/src/components/ui/Section";
import { buttonClasses } from "@/src/components/ui/Button";
import { useFeaturedProducts } from "@/src/hooks/useApi";

export function TrendingProducts() {
  const { data: products, isLoading } = useFeaturedProducts();
  const trending = (products || []).slice(0, 8);

  return (
    <Section muted className="border-y border-line">
      <SectionHeader
        eyebrow="Trending now"
        title="Featured products"
        description="Handpicked products with fast shipping and great prices."
        href="/shop"
        linkLabel="Explore all products"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : trending.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
      </div>

      <div className="mt-6 sm:hidden">
        <Link
          href="/shop"
          className={buttonClasses({ variant: "outline", fullWidth: true })}
        >
          View all products
        </Link>
      </div>
    </Section>
  );
}
