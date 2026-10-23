"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { sortOptions, priceRanges } from "@/src/lib/constants";
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
import { fetchProducts, type ProductListResult } from "@/src/lib/api";
import { cn } from "@/src/lib/utils";

const ITEMS_PER_PAGE = 12;

/** SWR key of the unfiltered first page, the one the server pre-fetches. */
const DEFAULT_LIST_KEY = "/shop?sort=popular&page=1";

interface ShopPageProps {
  /** Unfiltered first page from the server render. */
  initialProducts?: ProductListResult;
}

export function ShopPageClient({ initialProducts }: ShopPageProps) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopPage initialProducts={initialProducts} />
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

function ShopPage({ initialProducts }: ShopPageProps) {
  const { data: categories = [] } = useCategories();
  // The filter panel writes slugs into ?categories=; older links used names.
  // Resolve either to the slug for the API and to the name for display.
  const CATEGORY_SLUG: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        categories.flatMap((c) => [[c.name, c.slug], [c.slug, c.slug]]),
      ),
    [categories]
  );
  const CATEGORY_NAME: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        categories.flatMap((c) => [[c.slug, c.name], [c.name, c.name]]),
      ),
    [categories]
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);

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
    if (selectedCategoryNames.length > 1) {
      // Multi-category filtering happens server-side so pagination and
      // totals stay correct. Filtering a single fetched page client-side
      // silently truncated results and broke page counts.
      params.categories = selectedCategoryNames
        .map((name) => CATEGORY_SLUG[name])
        .filter(Boolean);
    } else if (selectedCategoryNames.length === 1) {
      params.category = CATEGORY_SLUG[selectedCategoryNames[0]];
    }
    return params;
  }, [selectedCategoryNames, priceRange, ratingParam, sort, page, CATEGORY_SLUG]);

  const { data, isLoading: listFetching } = useSWR(
    swrKey,
    () => {
      const params = buildFetchParams();
      return fetchProducts(params as Parameters<typeof fetchProducts>[0]);
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      fallbackData: swrKey === DEFAULT_LIST_KEY ? initialProducts : undefined,
    }
  );
  // SWR reports isLoading during its first revalidation even with server
  // data in hand; only treat "no data yet" as loading.
  const isLoading = listFetching && !data;

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

  // Applied filters show as removable chips next to the Filters button.
  const filterChips = [
    ...filters.categories.map((name) => ({
      key: `cat-${name}`,
      label: CATEGORY_NAME[name] ?? name,
      remove: () =>
        setFilters({ ...filters, categories: filters.categories.filter((c) => c !== name) }),
    })),
    ...(filters.priceRange !== "all"
      ? [{
          key: "price",
          label: priceRanges.find((r) => r.value === filters.priceRange)?.label ?? filters.priceRange,
          remove: () => setFilters({ ...filters, priceRange: "all" }),
        }]
      : []),
    ...(filters.rating !== null
      ? [{
          key: "rating",
          label: `${filters.rating}★ & up`,
          remove: () => setFilters({ ...filters, rating: null }),
        }]
      : []),
  ];

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
          <h1 className="text-2xl font-bold font-serif text-fg sm:text-3xl">
            {selectedCategoryNames.length === 1
              ? CATEGORY_NAME[selectedCategoryNames[0]] ?? selectedCategoryNames[0]
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
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="tabular ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-fg">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.remove}
                aria-label={`Remove filter ${chip.label}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 pl-3 pr-2 text-[13px] font-medium text-fg hover:border-brand transition-colors"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 text-muted" />
              </button>
            ))}
            {filterChips.length > 1 && (
              <button
                type="button"
                onClick={() => setFilters({ categories: [], priceRange: "all", rating: null })}
                className="h-9 px-2 text-[13px] font-semibold text-link hover:text-link-hover"
              >
                Clear all
              </button>
            )}
          </div>

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

        <div>
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <ProductGrid products={[]} loading />
            ) : (
              <>
                <ProductGrid products={products} />

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
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
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
            <Button fullWidth className="whitespace-nowrap" onClick={() => setFilterOpen(false)}>
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
