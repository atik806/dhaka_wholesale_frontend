"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, BadgePercent } from "lucide-react";
import { fetchFlashSale, fetchProducts } from "@/src/lib/api";
import { getCountdownParts, getOfferStatus } from "@/src/lib/offers";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { ComboDeals } from "@/src/components/product/ComboDeals";
import { Button, buttonClasses } from "@/src/components/ui/Button";

export default function SaleProductsPage() {
  const [now, setNow] = useState(() => Date.now());
  const [page, setPage] = useState(1);
  const sale = useSWR('/offers', () => fetchFlashSale(), { refreshInterval: 15_000 });
  const status = getOfferStatus(sale.data ?? {}, now);
  const products = useSWR(status === 'live' ? `sale-products:${page}` : null,
    () => fetchProducts({ onSale: true, page, limit: 12, sort: 'price-asc' }),
    { refreshInterval: 15_000 });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = getCountdownParts(sale.data?.ends_at, now);

  return (
    <div className="container min-h-[60vh] py-8 sm:py-12">
      <Link href="/shop" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All products</Link>
      <ComboDeals />
      <div className="mb-8 rounded-2xl bg-brand p-6 text-brand-fg sm:p-9">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent"><BadgePercent className="h-4 w-4" />Limited time offer</p>
        <h1 className="text-3xl font-bold text-brand-fg">{sale.data?.title || 'Current offers'}</h1>
        {status === 'live' && <p className="mt-3 text-sm text-brand-fg/80">Ends in {remaining.days}d {String(remaining.hours).padStart(2, '0')}h {String(remaining.minutes).padStart(2, '0')}m {String(remaining.seconds).padStart(2, '0')}s</p>}
      </div>
      {sale.error || products.error ? (
        <div role="alert" className="space-y-4 text-center"><p>Offers could not be loaded.</p><Button onClick={() => { void sale.mutate(); void products.mutate(); }}>Try again</Button></div>
      ) : sale.isLoading ? <p className="py-8 text-center text-muted">Loading offers…</p>
        : status !== 'live' ? <div className="space-y-4 py-8 text-center"><p className="text-muted">{status === 'scheduled' ? 'This sale has not started yet. Check back soon.' : 'There is no live flash sale right now.'}</p><Link href="/shop" className={buttonClasses()}>Browse products</Link></div>
        : <>
          <ProductGrid products={products.data?.products ?? []} loading={products.isLoading} />
          {(products.data?.totalPages ?? 0) > 1 && <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <span className="text-sm text-muted">{page} / {products.data?.totalPages}</span>
            <Button variant="outline" disabled={page >= (products.data?.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>}
        </>}
    </div>
  );
}
