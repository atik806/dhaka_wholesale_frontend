"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { Check, ChevronLeft, ChevronRight, Loader2, Package, Search, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { fetchProducts } from "@/src/lib/api";
import { formatPrice, safeImage } from "@/src/lib/utils";
import type { Product } from "@/src/types/product";

interface OfferProductPickerProps {
  selectedIds: string[];
  onAdd: (products: Product[]) => void;
  onClose: () => void;
  maxProducts?: number;
}

const PAGE_SIZE = 20;

export function OfferProductPicker({ selectedIds, onAdd, onClose, maxProducts = 200 }: OfferProductPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<Record<string, Product>>({});
  const { data, error, isLoading, mutate } = useSWR(
    ["offer-product-picker", page, debouncedSearch],
    ([, currentPage, term]: [string, number, string]) => fetchProducts({
      page: currentPage,
      limit: PAGE_SIZE,
      sort: "newest",
      search: term || undefined,
    }),
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const pendingCount = Object.keys(pending).length;
  const limitReached = selectedIds.length + pendingCount >= maxProducts;
  const loading = isLoading || search.trim() !== debouncedSearch;
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const toggleProduct = (product: Product) => {
    if (selectedIds.includes(product.id)) return;
    setPending((current) => {
      if (current[product.id]) {
        const next = { ...current };
        delete next[product.id];
        return next;
      }
      if (selectedIds.length + Object.keys(current).length >= maxProducts) return current;
      return { ...current, [product.id]: product };
    });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface p-0 text-fg shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[90dvh] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-xl font-bold">Add products to offer</h2>
            <p className="mt-1 text-sm text-muted">Browse the full catalog and select products for this sale.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close product picker" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="shrink-0 space-y-3 px-5 pt-5 sm:px-6">
          <label className="relative block">
            <span className="sr-only">Search all products</span>
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
            <input
              type="search"
              autoFocus
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search products by name"
              className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted" aria-live="polite">
            <span>{data ? `${data.total} ${debouncedSearch ? "matching" : "total"} products` : "All products"}</span>
            <span>{selectedIds.length} already in sale · {pendingCount} selected</span>
          </div>
        </div>

        <div className="min-h-48 flex-1 overflow-y-auto px-5 py-4 sm:px-6" aria-busy={loading}>
          {loading ? (
            <div role="status" className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted"><Loader2 className="h-5 w-5 animate-spin" />Loading products…</div>
          ) : error ? (
            <div role="alert" className="space-y-3 py-10 text-center"><p className="text-sm text-danger">Products could not be loaded.</p><Button variant="outline" onClick={() => void mutate()}>Try again</Button></div>
          ) : !data?.products.length ? (
            <div className="py-10 text-center"><Package className="mx-auto h-8 w-8 text-muted" /><p className="mt-3 text-sm text-muted">{debouncedSearch ? "No matching products. Try another search." : "Your catalog has no products yet."}</p></div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {data.products.map((product) => {
                const alreadyAdded = selectedIds.includes(product.id);
                const checked = alreadyAdded || Boolean(pending[product.id]);
                const disabled = alreadyAdded || (limitReached && !checked);
                return (
                  <label key={product.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${checked ? "border-accent/60 bg-accent-soft" : "border-line hover:bg-surface-2"} ${disabled ? "cursor-default" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleProduct(product)}
                      aria-label={`Select ${product.name}`}
                      className="h-4 w-4 shrink-0 accent-accent"
                    />
                    <Image src={safeImage(product.images)} alt="" width={48} height={48} unoptimized className="h-12 w-12 shrink-0 rounded-lg bg-surface-2 object-cover" onError={(event) => { event.currentTarget.src = "/placeholder.svg"; }} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-sm font-semibold">{product.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{product.category}</span>
                      <span className="mt-1 block text-sm font-semibold">{formatPrice(product.basePrice ?? product.price)}</span>
                      {alreadyAdded && <span className="mt-1 flex items-center gap-1 text-xs font-medium text-success"><Check className="h-3 w-3" />Already in sale</span>}
                      {product.stock === "out-of-stock" && <span className="mt-1 block text-xs text-danger">Out of stock</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <footer className="shrink-0 space-y-4 border-t border-line bg-surface-2 px-5 py-4 sm:px-6">
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setPage((value) => value - 1)} disabled={page <= 1 || loading}><ChevronLeft className="h-4 w-4" />Previous</Button>
              <span className="text-xs text-muted">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={page >= totalPages || loading}>Next<ChevronRight className="h-4 w-4" /></Button>
            </div>
          )}
          {limitReached && <p role="status" className="text-xs text-accent-text">This offer has reached the limit of {maxProducts} products.</p>}
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => { onAdd(Object.values(pending)); onClose(); }} disabled={!pendingCount}>Add selected products ({pendingCount})</Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
