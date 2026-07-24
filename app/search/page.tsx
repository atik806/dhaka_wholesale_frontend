"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Search, X, BookOpen } from "lucide-react";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ShopSkeleton } from "@/src/components/ui/Skeleton";
import { fetchProducts } from "@/src/lib/api";

export default function SearchPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center font-mono text-xs text-[#132A3A] dark:text-[#E7DCC4]">LOADING SEARCH...</div>
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
  const category = searchParams.get("category") || "";

  const { data, isLoading } = useSWR(
    query
      ? `/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
      : null,
    () =>
      fetchProducts({
        search: query,
        limit: 48,
        sort: "popular",
        ...(category ? { category } : {}),
      }),
    { revalidateOnFocus: false },
  );

  const loading = Boolean(query) && isLoading;
  const displayResults = query ? (data?.products ?? []) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C]"
    >
      {/* Page Header */}
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d] py-10 md:py-14">
        <div className="container">
          <Breadcrumbs items={[{ label: "Search" }]} />
          <div className="max-w-2xl mt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <BookOpen className="w-3.5 h-3.5" /> SEARCH
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold">
              Search Products
            </h1>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-xl mb-10">
          <SearchQueryInput
            key={query}
            initialQuery={query}
            onSubmit={(value) => {
              const trimmed = value.trim();
              router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
            }}
          />
        </div>

        {query && (
          <div className="mb-6">
            <p className="font-mono text-xs text-[#1C1A17]/70 dark:text-[#a0b4c4]">
              {loading ? "SEARCHING..." : displayResults.length === 0
                ? `No results found for "${query}"`
                : `Showing ${displayResults.length} result${displayResults.length > 1 ? "s" : ""} for "${query}"`}
            </p>
          </div>
        )}

        {loading && query ? (
          <ShopSkeleton />
        ) : !loading && displayResults.length > 0 ? (
          <ProductGrid products={displayResults} />
        ) : !loading && query ? (
          <EmptyState
            icon={<Search className="w-10 h-10 text-[#132A3A]/40 dark:text-[#a0b4c4]" />}
            title="No results found"
            description="Try adjusting your search terms or browse our categories."
            actionLabel="Browse Categories"
            actionHref="/shop"
          />
        ) : !query ? (
          <EmptyState
            icon={<Search className="w-10 h-10 text-[#132A3A]/40 dark:text-[#a0b4c4]" />}
            title="Search our store"
            description="Type above to find products across all categories."
            actionLabel="Shop All"
            actionHref="/shop"
          />
        ) : null}
      </div>
    </motion.div>
  );
}

function SearchQueryInput({
  initialQuery,
  onSubmit,
}: {
  initialQuery: string;
  onSubmit: (value: string) => void;
}) {
  const [localQuery, setLocalQuery] = useState(initialQuery);

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 focus-within:border-[#F5A300] transition-colors">
      <Search className="w-5 h-5 text-[#F5A300] shrink-0" />
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(localQuery);
        }}
        placeholder="Search products..."
        className="flex-1 bg-transparent py-3 text-sm outline-none text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4] font-mono"
        autoFocus
      />
      {localQuery && (
        <button
          type="button"
          onClick={() => setLocalQuery("")}
          className="p-1 rounded-[2px] hover:bg-[#FBF6EC] dark:bg-[#0D1F2C] transition-colors text-[#132A3A] dark:text-[#E7DCC4]"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
