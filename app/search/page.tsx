"use client";

import { Suspense, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import products from "@/src/data/products.json";
import type { Product } from "@/src/types/product";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";

export default function SearchPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center text-zinc-500 dark:text-zinc-400">Loading...</div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return (products as Product[]).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Search" }]} />

      <div className="max-w-xl mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Search</h1>
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4">
          <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const newUrl = localQuery.trim()
                  ? `/search?q=${encodeURIComponent(localQuery.trim())}`
                  : "/search";
                window.history.pushState({}, "", newUrl);
                window.location.reload();
              }
            }}
            placeholder="Search products..."
            className="flex-1 bg-transparent py-3 text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            autoFocus
          />
          {localQuery && (
            <button
              onClick={() => setLocalQuery("")}
              className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {query && (
        <div className="mb-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {results.length === 0
              ? `No results found for "${query}"`
              : `Showing ${results.length} result${results.length > 1 ? "s" : ""} for "${query}"`}
          </p>
        </div>
      )}

      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : query ? (
        <EmptyState
          icon={<Search className="w-10 h-10 text-primary dark:text-primary-light" />}
          title="No results found"
          description="Try adjusting your search terms or browse our categories."
          actionLabel="Browse Categories"
          actionHref="/shop"
        />
      ) : (
        <EmptyState
          icon={<Search className="w-10 h-10 text-primary dark:text-primary-light" />}
          title="Search our store"
          description="Type above to find products across all categories."
          actionLabel="Shop All"
          actionHref="/shop"
        />
      )}
    </motion.div>
  );
}
