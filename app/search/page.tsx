"use client";

import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Product } from "@/src/types/product";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { fetchProducts } from "@/src/lib/api";

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
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    fetchProducts({ search: query, limit: 100 })
      .then((result) => {
        setResults(result.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
                router.push(newUrl);
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
            {loading ? "Searching..." : results.length === 0
              ? `No results found for "${query}"`
              : `Showing ${results.length} result${results.length > 1 ? "s" : ""} for "${query}"`}
          </p>
        </div>
      )}

      {!loading && results.length > 0 ? (
        <ProductGrid products={results} />
      ) : !loading && query ? (
        <EmptyState
          icon={<Search className="w-10 h-10 text-primary dark:text-primary-light" />}
          title="No results found"
          description="Try adjusting your search terms or browse our categories."
          actionLabel="Browse Categories"
          actionHref="/shop"
        />
      ) : !query ? (
        <EmptyState
          icon={<Search className="w-10 h-10 text-primary dark:text-primary-light" />}
          title="Search our store"
          description="Type above to find products across all categories."
          actionLabel="Shop All"
          actionHref="/shop"
        />
      ) : null}
    </motion.div>
  );
}
