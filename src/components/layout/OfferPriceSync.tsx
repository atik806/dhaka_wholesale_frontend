"use client";

import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetchFlashSale, fetchProducts } from "@/src/lib/api";
import { useCartHydrated, useCartStore } from "@/src/store/useCartStore";

/** Revalidate open product views and persisted carts when an offer changes or crosses a boundary. */
export function OfferPriceSync() {
  const { data: sale } = useSWR('/offers', () => fetchFlashSale(), {
    refreshInterval: 15_000, dedupingInterval: 1_000, revalidateOnFocus: true,
  });
  const { mutate } = useSWRConfig();
  const cartHydrated = useCartHydrated();

  useEffect(() => {
    if (sale === undefined || !cartHydrated) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    const refresh = async () => {
      void mutate((key) => typeof key === 'string' && (
        key.startsWith('/products') || key.startsWith('/shop?') || key.startsWith('sale-products:')
      ), undefined, { revalidate: true });
      const store = useCartStore.getState();
      if (store.wishlistIds.length) store.setWishlistIds([...store.wishlistIds]);
      const ids = [...new Set(store.items.map((item) => item.product.id))];
      if (!ids.length) return;
      const results = await Promise.allSettled(
        Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) =>
          fetchProducts({ ids: ids.slice(index * 100, index * 100 + 100), limit: 100 }, controller.signal),
        ),
      );
      if (controller.signal.aborted) return;
      const products = new Map(results.flatMap((result) => result.status === 'fulfilled' ? result.value.products : [])
        .map((product) => [product.id, product]));
      // Read the current cart after the request so concurrent quantity edits are retained.
      const current = useCartStore.getState();
      current.replaceItems(current.items.map((item) => ({ ...item, product: products.get(item.product.id) ?? item.product })));
    };

    const schedule = () => {
      if (!sale?.enabled) return;
      const now = Date.now();
      const next = [Date.parse(sale.starts_at), Date.parse(sale.ends_at)]
        .filter((time) => time > now).sort((a, b) => a - b)[0];
      if (next === undefined) return;
      timer = setTimeout(() => { void refresh(); schedule(); }, Math.min(next - now + 50, 2_147_483_647));
    };

    void refresh();
    schedule();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [sale, cartHydrated, mutate]);

  return null;
}
