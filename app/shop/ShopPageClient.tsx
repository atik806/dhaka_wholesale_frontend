"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { sortOptions } from "@/src/lib/constants";
import { useCategories } from "@/src/hooks/useApi";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { ProductFilters } from "@/src/components/product/ProductFilters";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { ShopSkeleton } from "@/src/components/ui/Skeleton";
import { fetchProducts } from "@/src/lib/api";

const ITEMS_PER_PAGE = 12;

export function ShopPageClient() {
  return (
    <Suspense fallback={<div className="container py-20 text-center font-mono text-xs text-[#132A3A] dark:text-[#E7DCC4]">LOADING MARKET LEDGER...</div>}>
      <ShopPage />
    </Suspense>
  );
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen"
    >
      {/* Page Header */}
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d] py-10 md:py-14">
        <div className="container">
          <Breadcrumbs items={[{ label: "Shop" }]} />
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3 uppercase">
            <BookOpen className="w-3.5 h-3.5" /> OUR PRODUCTS
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold tracking-tight">
            {selectedCategoryNames.length === 1
              ? selectedCategoryNames[0]
              : "All Products"}
          </h1>
          <p className="font-mono text-xs text-[#E7DCC4]/80 mt-2">
            {isLoading ? "LOADING..." : `Showing ${total} Products`}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-[#132A3A] p-4 rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d]">
          <div className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase">
            SHOWING PAGE {safePage} OF {totalPages || 1}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center justify-center gap-2 lg:hidden px-4 py-2 rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d] bg-[#FBF6EC] dark:bg-[#0D1F2C] font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300] transition-colors flex-1 sm:flex-initial"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#BE3D1F]" /> FILTER
            </button>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value !== "popular" ? e.target.value : null, page: null })}
              className="font-mono text-xs font-bold border-2 border-[#E7DCC4] dark:border-[#2a3d4d] rounded-[3px] px-3 py-2 bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] outline-none focus:border-[#F5A300] flex-1 sm:flex-initial"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  SORT: {opt.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <ProductFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <ShopSkeleton />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <ProductGrid key={searchParams.toString() || "default"} products={products} />
                </AnimatePresence>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 flex-wrap font-mono text-xs">
                    <button
                      onClick={() => updateParams({ page: String(safePage - 1) })}
                      disabled={safePage <= 1}
                      className="p-2.5 rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateParams({ page: String(i + 1) })}
                        className={`w-10 h-10 rounded-[3px] font-mono font-extrabold transition-colors border ${
                          safePage === i + 1
                            ? "bg-[#132A3A] text-[#F5A300] border-[#132A3A]"
                            : "bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] border-[#E7DCC4] dark:border-[#2a3d4d] hover:bg-[#F5A300]/20"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => updateParams({ page: String(safePage + 1) })}
                      disabled={safePage >= totalPages}
                      className="p-2.5 rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {mobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFilterOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 right-0 bottom-0 w-full max-w-sm bg-[#FBF6EC] dark:bg-[#0D1F2C] z-[70] shadow-2xl p-6 overflow-y-auto lg:hidden border-r-2 border-[#E7DCC4] dark:border-[#2a3d4d]"
              >
                <ProductFilters
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setMobileFilterOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
