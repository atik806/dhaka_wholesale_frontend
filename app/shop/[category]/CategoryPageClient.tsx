"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ShopSkeleton } from "@/src/components/ui/Skeleton";
import { useCategory, useProducts } from "@/src/hooks/useApi";

export function CategoryPageClient() {
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
      <div className="container py-10">
        <EmptyState
          icon={<PackageSearch className="h-7 w-7 text-subtle" />}
          title="Category not found"
          description="The category you're looking for doesn't exist or is no longer available."
          actionLabel="Back to shop"
          actionHref="/shop"
        />
      </div>
    );
  }

  const total = result?.total ?? result?.products.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-canvas"
    >
      <div className="container py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            { label: category.name },
          ]}
        />

        <header className="mb-6 border-b border-line pb-5">
          <p className="label-caps mb-1.5 text-accent-hover">Category</p>
          <h1 className="text-2xl font-bold text-fg sm:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {category.description}
            </p>
          )}
          <p className="mt-2 text-[13px] text-muted">
            <span className="tabular font-semibold text-fg">{total}</span>{" "}
            {total === 1 ? "product" : "products"} available
          </p>
        </header>

        <ProductGrid products={result?.products || []} />

        {result && result.totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="tabular text-[13px] text-muted">
              Page {page} of {result.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              disabled={page === result.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </div>
    </motion.div>
  );
}
