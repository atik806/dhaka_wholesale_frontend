"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Search, X } from "lucide-react";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Input } from "@/src/components/ui/Input";
import { ShopSkeleton } from "@/src/components/ui/Skeleton";
import { fetchProducts } from "@/src/lib/api";

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
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
      className="min-h-screen bg-canvas"
    >
      <div className="container py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Search" }]} />

        <header className="mb-5">
          <h1 className="text-2xl font-bold text-fg sm:text-3xl">Search products</h1>
          <p className="mt-1.5 text-sm text-muted">
            Find products across every category in the store.
          </p>
        </header>

        <div className="mb-6 max-w-xl">
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
          <p className="mb-5 text-[13px] text-muted">
            {loading
              ? "Searching…"
              : displayResults.length === 0
              ? `No results for “${query}”`
              : <>
                  <span className="tabular font-semibold text-fg">{displayResults.length}</span>{" "}
                  {displayResults.length === 1 ? "result" : "results"} for{" "}
                  <span className="font-semibold text-fg">“{query}”</span>
                </>}
          </p>
        )}

        {loading && query ? (
          <ProductGrid products={[]} loading />
        ) : !loading && displayResults.length > 0 ? (
          <ProductGrid products={displayResults} />
        ) : !loading && query ? (
          <EmptyState
            icon={<Search className="h-7 w-7 text-subtle" />}
            title="No results found"
            description="Try different or fewer keywords, or browse our categories instead."
            actionLabel="Browse products"
            actionHref="/shop"
          />
        ) : !query ? (
          <EmptyState
            icon={<Search className="h-7 w-7 text-subtle" />}
            title="Search our store"
            description="Type above to find products across all categories."
            actionLabel="Shop all"
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
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(localQuery);
          }}
          placeholder="Search products…"
          aria-label="Search products"
          leadingIcon={<Search className="h-4 w-4" />}
          className={localQuery ? "pr-10" : undefined}
          autoFocus
        />
        {localQuery && (
          <button
            type="button"
            onClick={() => setLocalQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button onClick={() => onSubmit(localQuery)} className="shrink-0">
        Search
      </Button>
    </div>
  );
}
