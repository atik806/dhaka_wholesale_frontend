"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { PackagePlus } from "lucide-react";
import { API_BASE } from "@/src/lib/constants";
import { fetchProducts } from "@/src/lib/api";
import { getOfferStatus, type ComboDeal } from "@/src/lib/offers";
import { formatPrice, safeImage } from "@/src/lib/utils";
import { useCartStore } from "@/src/store/useCartStore";
import { useToast } from "@/src/providers/ToastProvider";
import { Button } from "@/src/components/ui/Button";
import type { Product } from "@/src/types/product";

async function fetchCombos(): Promise<ComboDeal[]> {
  const response = await fetch(`${API_BASE}/offers/combos`);
  if (!response.ok) throw new Error("Could not load combo deals");
  return (await response.json()).data ?? [];
}

function ComboCard({ combo, products }: { combo: ComboDeal; products: Map<string, Product> }) {
  const { addToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [choices, setChoices] = useState<Record<string, { size?: string; color?: string }>>({});
  const complete = combo.products.every((line) => {
    const product = products.get(line.product_id);
    const choice = choices[line.product_id];
    return product && product.stock !== "out-of-stock" &&
      (!product.variants?.sizes?.length || choice?.size) &&
      (!product.variants?.colors?.length || choice?.color);
  });
  const normal = combo.products.reduce((sum, line) => sum + (products.get(line.product_id)?.price ?? 0) * line.quantity, 0);
  const lowerPrice = normal > 0 ? Math.min(combo.price, normal) : combo.price;
  const addCombo = () => {
    if (!complete) return;
    const cart = useCartStore.getState().items;
    for (const line of combo.products) {
      const product = products.get(line.product_id)!;
      const existing = cart.filter((item) => item.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
      if (product.stockQuantity !== undefined && existing + line.quantity > product.stockQuantity) {
        addToast(`Not enough stock for ${product.name}`, "error"); return;
      }
    }
    for (const line of combo.products) {
      addItem({ product: products.get(line.product_id)!, quantity: line.quantity, selectedSize: choices[line.product_id]?.size, selectedColor: choices[line.product_id]?.color });
    }
    addToast(`${combo.title} added. Combo savings apply automatically at checkout.`, "success");
  };
  return <article className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-xs">
    <h3 className="text-xl font-bold">{combo.title}</h3>
    <div className="my-4 flex-1 space-y-4">{combo.products.map((line) => {
      const product = products.get(line.product_id);
      return <div key={line.product_id}>
        <div className="flex items-center gap-3"><Image src={safeImage(product?.images)} width={48} height={48} alt="" unoptimized className="h-12 w-12 rounded-lg bg-surface-2 object-cover" /><div className="min-w-0 flex-1">{product ? <Link href={`/product/${product.slug}`} className="text-sm font-semibold hover:text-link">{line.quantity} × {product.name}</Link> : <span className="text-sm text-danger">Product unavailable</span>}{product?.stock === "out-of-stock" && <p className="text-xs text-danger">Out of stock</p>}</div></div>
        {product && <div className="mt-2 flex gap-2">
          {!!product.variants?.sizes?.length && <select aria-label={`Size for ${product.name}`} value={choices[product.id]?.size ?? ""} onChange={(event) => setChoices((current) => ({ ...current, [product.id]: { ...current[product.id], size: event.target.value } }))} className="min-w-0 flex-1 rounded-lg border border-line bg-surface p-2 text-xs"><option value="">Choose size</option>{product.variants.sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select>}
          {!!product.variants?.colors?.length && <select aria-label={`Color for ${product.name}`} value={choices[product.id]?.color ?? ""} onChange={(event) => setChoices((current) => ({ ...current, [product.id]: { ...current[product.id], color: event.target.value } }))} className="min-w-0 flex-1 rounded-lg border border-line bg-surface p-2 text-xs"><option value="">Choose color</option>{product.variants.colors.map((color) => <option key={color.name} value={color.name}>{color.name}</option>)}</select>}
        </div>}
      </div>;
    })}</div>
    <div className="mb-3 flex items-center gap-2"><strong className="text-xl">{formatPrice(lowerPrice)}</strong>{normal > lowerPrice && <span className="text-sm text-muted line-through">{formatPrice(normal)}</span>}</div>
    <p className="mb-4 text-xs text-muted">{normal <= combo.price && normal > 0 ? "Current individual prices are lower, so you pay the lower total." : "Combo savings are applied automatically in cart and checkout."} Choose any required sizes or colors before adding.</p>
    <Button onClick={addCombo} disabled={!complete}><PackagePlus className="h-4 w-4" />Add combo to cart</Button>
  </article>;
}

export function ComboDeals({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  const deals = useSWR('/offers/combos', fetchCombos, { refreshInterval: 15_000 });
  const ids = [...new Set((deals.data ?? []).flatMap((combo) => combo.products.map((line) => line.product_id)))];
  const catalog = useSWR(ids.length ? ['combo-catalog', ids.join(',')] : null, async () => {
    const pages = await Promise.all(Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => fetchProducts({ ids: ids.slice(index * 100, index * 100 + 100), limit: 100 })));
    return new Map(pages.flatMap((page) => page.products).map((product) => [product.id, product]));
  }, { refreshInterval: 15_000 });
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1_000); return () => window.clearInterval(timer); }, []);
  const active = (deals.data ?? []).filter((combo) => getOfferStatus(combo, now) === 'live');
  if (compact && (!active.length || deals.error || catalog.error)) return null;
  return <section className={compact ? "container py-10 sm:py-14" : "mb-10"}>
    <div className="mb-5 flex items-center justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent-text">Buy together & save</p><h2 className="text-2xl font-bold">Combo deals</h2></div>{compact && <Link href="/offers" className="text-sm font-semibold text-link">All offers →</Link>}</div>
    {deals.error || catalog.error ? <div role="alert" className="space-y-3 rounded-xl border border-line p-5 text-center"><p className="text-sm text-muted">Combo deals could not be loaded.</p><Button variant="outline" onClick={() => { void deals.mutate(); void catalog.mutate(); }}>Try again</Button></div>
      : deals.isLoading || (ids.length > 0 && catalog.isLoading) ? <p className="py-8 text-center text-sm text-muted">Loading combo deals…</p>
      : !active.length ? <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">No live combo deals right now.</p>
      : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(compact ? active.slice(0, 3) : active).map((combo) => <ComboCard key={combo.id} combo={combo} products={catalog.data ?? new Map()} />)}</div>}
  </section>;
}
