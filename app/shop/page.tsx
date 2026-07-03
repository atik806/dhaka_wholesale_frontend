"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import products from "@/src/data/products.json";
import type { Product } from "@/src/types/product";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { ProductFilters } from "@/src/components/product/ProductFilters";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { sortOptions } from "@/src/lib/constants";

const ITEMS_PER_PAGE = 12;

export default function ShopPageWrapper() {
  return (
    <Suspense fallback={<div className="container py-20 text-center text-zinc-500 dark:text-zinc-400">Loading...</div>}>
      <ShopPage />
    </Suspense>
  );
}

function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categoriesParam = searchParams.get("categories") || "";
  const priceRange = searchParams.get("price") || "all";
  const ratingParam = searchParams.get("rating");
  const sort = searchParams.get("sort") || "popular";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const filters = useMemo(() => ({
    categories: categoriesParam ? categoriesParam.split(",") : [],
    priceRange,
    rating: ratingParam ? parseInt(ratingParam, 10) : null,
  }), [categoriesParam, priceRange, ratingParam]);

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

  const filtered = useMemo(() => {
    let result = [...products] as Product[];

    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number);
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    if (filters.rating !== null) {
      result = result.filter((p) => Math.round(p.rating) >= filters.rating!);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [filters, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Shop" }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
            All Products
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{filtered.length} products found</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center justify-center gap-2 lg:hidden px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-1 sm:flex-initial"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value !== "popular" ? e.target.value : null, page: null })}
            className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/20 flex-1 sm:flex-initial"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
          <AnimatePresence mode="wait">
            <ProductGrid key={searchParams.toString() || "default"} products={paginated} />
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12 flex-wrap">
              <button
                onClick={() => updateParams({ page: String(safePage - 1) })}
                disabled={safePage <= 1}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParams({ page: String(i + 1) })}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    safePage === i + 1
                      ? "bg-primary text-white"
                      : "border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => updateParams({ page: String(safePage + 1) })}
                disabled={safePage >= totalPages}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-zinc-800 z-[70] shadow-2xl p-6 overflow-y-auto lg:hidden"
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
    </motion.div>
  );
}
