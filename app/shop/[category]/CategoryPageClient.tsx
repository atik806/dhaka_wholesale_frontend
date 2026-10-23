"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch, ArrowRight } from "lucide-react";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ShopSkeleton } from "@/src/components/ui/Skeleton";
import { useCategory, useCategoryTree, useProducts } from "@/src/hooks/useApi";
import { countCategoryProducts, findCategoryInTree } from "@/src/lib/category-tree";
import type { ProductListResult } from "@/src/lib/api";
import type { Category } from "@/src/types/product";

interface CategoryPageProps {
  initialCategory?: Category | null;
  /** First page of products from the server render. */
  initialProducts?: ProductListResult;
}

export function CategoryPageClient({ initialCategory, initialProducts }: CategoryPageProps) {
  const params = useParams();
  const categorySlug = params.category as string;
  return (
    <CategoryPageContent
      key={categorySlug}
      categorySlug={categorySlug}
      initialCategory={initialCategory}
      initialProducts={initialProducts}
    />
  );
}

function CategoryPageContent({
  categorySlug,
  initialCategory,
  initialProducts,
}: CategoryPageProps & { categorySlug: string }) {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: category, isLoading: catLoading, error: categoryError, mutate: reloadCategory } = useCategory(categorySlug, initialCategory);
  const { data: tree = [], isLoading: treeLoading, error: treeError, mutate: reloadTree } = useCategoryTree();
  const { data: result, isLoading: prodLoading, error: productError, mutate: reloadProducts } = useProducts(
    { category: categorySlug, page, limit },
    page === 1 ? initialProducts : undefined,
  );

  // SWR reports isLoading during its first revalidation even when server
  // data was passed in, so only treat "no data yet" as loading. Otherwise the
  // server HTML is a skeleton and products wait for a client fetch.
  const loading = catLoading && !category;
  const productsLoading = prodLoading && !result;

  if (loading) {
    return <ShopSkeleton />;
  }

  if (!category) {
    return (
      <div className="container py-10">
        <EmptyState
          icon={<PackageSearch className="h-7 w-7 text-subtle" />}
          title={categoryError ? "Could not load this category" : "Category not found"}
          description={categoryError ? "Please try again in a moment." : "The category you're looking for doesn't exist or is no longer available."}
          actionLabel={categoryError ? undefined : "Back to shop"}
          actionHref={categoryError ? undefined : "/shop"}
        />
        {categoryError && <Button variant="outline" onClick={() => void reloadCategory()}>Try again</Button>}
      </div>
    );
  }

  const total = result?.total ?? result?.products.length ?? 0;
  const children = findCategoryInTree(tree, category.id)?.children ?? [];

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
          <h1 className="text-2xl font-bold font-serif text-fg sm:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {category.description}
            </p>
          )}
          {!productError && !productsLoading && <p className="mt-2 text-[13px] text-muted">
            <span className="tabular font-semibold text-fg">{total}</span>{" "}
            {total === 1 ? "product" : "products"} available
          </p>}
        </header>

        {treeLoading && <div className="shimmer mb-6 h-24 rounded-xl" aria-label="Loading subcategories" role="status" />}
        {treeError && (
          <div role="alert" className="mb-6 rounded-xl border border-line bg-surface p-4 text-sm">
            <p className="text-muted">Could not load subcategories.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void reloadTree()}>Try again</Button>
          </div>
        )}
        {children.length > 0 && (
          <section aria-labelledby="subcategory-heading" className="mb-8">
            <h2 id="subcategory-heading" className="mb-3 text-lg font-bold text-fg">Shop by subcategory</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {children.map((child) => {
                const count = countCategoryProducts(child);
                return (
                  <Link key={child.id} href={`/shop/${child.slug}`} className="group flex min-h-20 items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent">
                    <span>
                      <span className="block text-sm font-semibold text-fg">{child.name}</span>
                      <span className="mt-1 block text-xs text-muted">{count} {count === 1 ? "item" : "items"}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-link transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {children.length > 0 && <h2 className="mb-4 text-lg font-bold text-fg">All {category.name}</h2>}
        {productsLoading ? <ShopSkeleton /> : productError ? (
          <div role="alert" className="rounded-xl border border-line bg-surface p-6 text-center">
            <p className="text-muted">Could not load products. Please try again in a moment.</p>
            <Button variant="outline" className="mt-3" onClick={() => void reloadProducts()}>Try again</Button>
          </div>
        ) : <ProductGrid products={result?.products || []} />}

        {!productError && result && result.totalPages > 1 && (
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
