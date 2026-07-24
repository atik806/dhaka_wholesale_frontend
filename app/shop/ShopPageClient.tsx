"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { sortOptions } from "@/src/lib/constants";
import { useCategories } from "@/src/hooks/useApi";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import {
  ProductFilters,
  countActiveFilters,
} from "@/src/components/product/ProductFilters";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Field";
import { Modal } from "@/src/components/ui/Modal";
import { ShopSkeleton } from "@/src/components/ui/Skeleton";
import { fetchProducts } from "@/src/lib/api";
import { cn } from "@/src/lib/utils";

const ITEMS_PER_PAGE = 12;

export function ShopPageClient() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopPage />
    </Suspense>
  );
}

/** Compact page list: 1 … n-1 n n+1 … last */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

function ShopPage() {
  const { data: categories = [] } = useCategories();
  const CATEGORY_SLUG: Record<string, string> = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.name, c.slug])),
    [categories]
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categoriesParam = searchParams.get("categories") || "";
  const priceRange = searchParams.get("price") || "all";
  const ratingParam = searchParams.get("rating");
  const sort = searchParams.get("sort") || "popular";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const selectedCategoryNames = useMemo(
    () => (categoriesParam ? categoriesParam.split(",") : []),
    [categoriesParam]
  );

  const filters = useMemo(() => ({
    categories: selectedCategoryNames,
    priceRange,
    rating: ratingParam ? parseInt(ratingParam, 10) : null,
  }), [selectedCategoryNames, priceRange, ratingParam]);

  const categorySlugReady =
    selectedCategoryNames.length !== 1 || Boolean(CATEGORY_SLUG[selectedCategoryNames[0]]);

  const swrKey = useMemo(() => {
    if (!categorySlugReady) return null;
    const parts: string[] = [];
    if (selectedCategoryNames.length === 1) parts.push(`cat=${CATEGORY_SLUG[selectedCategoryNames[0]]}`);
    if (selectedCategoryNames.length > 1) parts.push(`cats=${selectedCategoryNames.join(",")}`);
    if (priceRange !== "all") parts.push(`price=${priceRange}`);
    if (ratingParam) parts.push(`rating=${ratingParam}`);
    parts.push(`sort=${sort}`);
    parts.push(`page=${page}`);
    return `/shop?${parts.join("&")}`;
  }, [selectedCategoryNames, priceRange, ratingParam, sort, page, CATEGORY_SLUG, categorySlugReady]);

  const buildFetchParams = useCallback(() => {
    const params: Record<string, unknown> = {};
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      params.priceMin = min;
      params.priceMax = max;
    }
    if (ratingParam) params.minRating = parseInt(ratingParam, 10);
    params.sort = sort;
    params.page = page;
    params.limit = ITEMS_PER_PAGE;
    if (selectedCategoryNames.length === 1) {
      params.category = CATEGORY_SLUG[selectedCategoryNames[0]];
    }
    return params;
  }, [selectedCategoryNames, priceRange, ratingParam, sort, page, CATEGORY_SLUG]);

  const { data, isLoading } = useSWR(
    swrKey,
    async () => {
      const params = buildFetchParams();
      const result = await fetchProducts(params as Parameters<typeof fetchProducts>[0]);
      if (selectedCategoryNames.length > 1) {
        result.products = result.products.filter((p) =>
          selectedCategoryNames.includes(p.category)
        );
        result.total = result.products.length;
        result.totalPages = Math.ceil(result.products.length / ITEMS_PER_PAGE);
        const safePage = Math.min(page, Math.max(result.totalPages, 1));
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        result.products = result.products.slice(start, start + ITEMS_PER_PAGE);
      }
      return result;
    },
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all" || (key === "page" && value === "1")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const qs = params.toString();
      router.push(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router]
  );

  const setFilters = useCallback(
    (newFilters: typeof filters) => {
      const cats = newFilters.categories.length > 0 ? newFilters.categories.join(",") : null;
      updateParams({
        categories: cats,
        price: newFilters.priceRange !== "all" ? newFilters.priceRange : null,
        rating: newFilters.rating ? String(newFilters.rating) : null,
        page: null,
      });
    },
    [updateParams]
  );

  const totalPages = data?.totalPages || 0;
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const products = data?.products || [];
  const total = data?.total || 0;
  const activeFilterCount = countActiveFilters(filters);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-canvas"
    >
      <div className="container py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Shop" }]} />

        <header className="mb-5">
          <h1 className="text-2xl font-bold text-fg sm:text-3xl">
            {selectedCategoryNames.length === 1
              ? selectedCategoryNames[0]
              : "All products"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {isLoading ? (
              "Loading products…"
            ) : (
              <>
                <span className="tabular font-semibold text-fg">{total}</span>{" "}
                {total === 1 ? "product" : "products"}
                {totalPages > 1 && (
                  <>
                    {" · page "}
                    <span className="tabular">{safePage}</span> of{" "}
                    <span className="tabular">{totalPages}</span>
                  </>
                )}
              </>
            )}
          </p>
        </header>

        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setMobileFilterOpen(true)}
            className="xl:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="tabular ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-fg">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <p className="hidden text-[13px] text-muted xl:block">
            {activeFilterCount > 0
              ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} applied`
              : "Showing all products"}
          </p>

          <div className="w-full sm:w-56">
            <Select
              aria-label="Sort products"
              value={sort}
              onChange={(e) =>
                updateParams({
                  sort: e.target.value !== "popular" ? e.target.value : null,
                  page: null,
                })
              }
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-60 shrink-0 xl:block">
            <div className="sticky top-24">
              <ProductFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <ProductGrid products={[]} loading />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <ProductGrid key={searchParams.toString() || "default"} products={products} />
                </AnimatePresence>

                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateParams({ page: String(safePage - 1) })}
                      disabled={safePage <= 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {pageWindow(safePage, totalPages).map((p, i) =>
                      p === "gap" ? (
                        <span key={`gap-${i}`} className="px-1 text-subtle">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => updateParams({ page: String(p) })}
                          aria-current={safePage === p ? "page" : undefined}
                          className={cn(
                            "tabular h-10 w-10 rounded-md border text-sm font-semibold transition-colors",
                            safePage === p
                              ? "border-brand bg-brand text-brand-fg"
                              : "border-line-strong bg-surface text-fg hover:bg-surface-2",
                          )}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateParams({ page: String(safePage + 1) })}
                      disabled={safePage >= totalPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filters"
        description="Narrow down products by category, price and rating."
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() =>
                setFilters({ categories: [], priceRange: "all", rating: null })
              }
              disabled={activeFilterCount === 0}
            >
              Clear all
            </Button>
            <Button fullWidth onClick={() => setMobileFilterOpen(false)}>
              Show {total} {total === 1 ? "result" : "results"}
            </Button>
          </div>
        }
      >
        <ProductFilters filters={filters} onChange={setFilters} bare />
      </Modal>
    </motion.div>
  );
}
