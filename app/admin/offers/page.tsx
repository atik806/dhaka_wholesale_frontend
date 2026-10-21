"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  CalendarClock,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Search,
  Tag,
  TicketPercent,
  X,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { OfferProductPicker } from "@/src/components/admin/OfferProductPicker";
import { PromotionsManager } from "@/src/components/admin/PromotionsManager";
import { adminFetcher } from "@/src/lib/admin-api";
import { fetchProducts } from "@/src/lib/api";
import {
  dhakaInputToIso,
  getCountdownParts,
  getDiscountPercent,
  getOfferStatus,
  toDhakaInputValue,
  type FlashSale,
  type PromotionConfig,
} from "@/src/lib/offers";
import { formatPrice } from "@/src/lib/utils";
import { useToast } from "@/src/providers/ToastProvider";
import type { Product } from "@/src/types/product";

type Tab = "flash" | "combos" | "coupons";

interface SelectedProduct {
  product: Product;
  salePrice: string;
}

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-fg shadow-xs transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

function defaultSaleWindow() {
  const start = new Date();
  start.setSeconds(0, 0);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    starts: toDhakaInputValue(start.toISOString()),
    ends: toDhakaInputValue(end.toISOString()),
  };
}

function Countdown({ endsAt }: { endsAt: string | null }) {
  const [now, setNow] = useState(() => Date.now());


  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = getCountdownParts(endsAt, now);
  const units = [
    [countdown.days, "DAYS"],
    [countdown.hours, "HRS"],
    [countdown.minutes, "MIN"],
    [countdown.seconds, "SEC"],
  ] as const;

  return (
    <div className="mt-4 flex gap-2" aria-label="Sale countdown">
      {units.map(([value, label]) => (
        <div key={label} className="min-w-12 rounded-lg bg-black/25 px-2 py-2 text-center">
          <strong className="block font-mono text-lg leading-none tabular-nums">
            {String(value).padStart(2, "0")}
          </strong>
          <span className="mt-1 block text-[9px] font-bold tracking-wide text-white/75">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function OffersPage() {
  const { addToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const defaults = useMemo(() => defaultSaleWindow(), []);
  const [tab, setTab] = useState<Tab>("flash");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<string, SelectedProduct>>({});
  const [savedSale, setSavedSale] = useState<FlashSale | null>(null);
  const [saleName, setSaleName] = useState("Flash sale");
  const [starts, setStarts] = useState(defaults.starts);
  const [ends, setEnds] = useState(defaults.ends);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [promotionConfig, setPromotionConfig] = useState<PromotionConfig>({ combos: [], coupons: [] });

  const loadPromotions = useCallback(async () => {
    const response = await adminFetcher<PromotionConfig>("/offers/manage");
    setPromotionConfig(response.data);
  }, []);

  const loadOffer = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await adminFetcher<FlashSale | null>(`/offers?fresh=${Date.now()}`);
      await loadPromotions();
      const sale = response.data;
      const ids = sale?.products.map((item) => item.product_id) ?? [];
      const pages = await Promise.all(
        Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) =>
          fetchProducts({ ids: ids.slice(index * 100, index * 100 + 100), limit: 100 }),
        ),
      );
      const products = pages.flatMap((page) => page.products);
      const nextSelected: Record<string, SelectedProduct> = {};
      for (const product of products) {
        const item = sale?.products.find((item) => item.product_id === product.id);
        if (item) nextSelected[product.id] = { product, salePrice: String(item.price) };
      }
      setSelected(nextSelected);
      setSavedSale(sale);
      setSaleName(sale?.title || "Flash sale");
      setStarts(toDhakaInputValue(sale?.starts_at) || defaults.starts);
      setEnds(toDhakaInputValue(sale?.ends_at) || defaults.ends);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, [defaults.ends, defaults.starts, loadPromotions]);

  useEffect(() => {
    (async () => {
      await loadOffer();
    })();
  }, [loadOffer]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (!search.trim()) { setCatalog([]); setSearchError(""); setSearching(false); return; }
      setSearching(true);
      setSearchError("");
      try {
        const result = await fetchProducts({ search: search.trim(), limit: 20 }, controller.signal);
        if (!controller.signal.aborted) setCatalog(result.products);
      } catch {
        if (!controller.signal.aborted) { setCatalog([]); setSearchError("Product search failed. Try again."); }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search]);

  const selectedList = useMemo(() => Object.values(selected), [selected]);
  const startsAt = dhakaInputToIso(starts);
  const endsAt = dhakaInputToIso(ends);
  const status = getOfferStatus(savedSale ?? {}, now);
  const searchResults = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return [];
    return catalog
      .filter((product) => !selected[product.id])
      .filter((product) => product.name.toLocaleLowerCase().includes(query))
      .slice(0, 8);
  }, [catalog, search, selected]);

  const addProducts = (products: Product[]) => {
    setSelected((current) => {
      const next = { ...current };
      for (const product of products) {
        if (next[product.id] || Object.keys(next).length >= 200) continue;
        const normalPrice = product.basePrice ?? product.price;
        const suggestedPrice = Math.max(0.01, Math.round(normalPrice * 90) / 100);
        next[product.id] = { product, salePrice: String(product.price < normalPrice ? product.price : suggestedPrice) };
      }
      return next;
    });
    setSearch("");
  };

  const removeProduct = (productId: string) => {
    setSelected((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  const saveSale = async () => {
    const title = saleName.trim();
    if (!title) {
      addToast("Enter a sale name", "error");
      return;
    }
    if (!startsAt || !endsAt || Date.parse(endsAt) <= Date.parse(startsAt)) {
      addToast("The end time must be after the start time", "error");
      return;
    }
    if (Date.parse(endsAt) <= Date.now()) {
      addToast("Choose an end time in the future", "error");
      return;
    }
    if (selectedList.length === 0) {
      addToast("Add at least one product to the sale", "error");
      return;
    }

    const invalid = selectedList.find(({ product, salePrice }) => {
      const normalPrice = product.basePrice ?? product.price;
      const price = Number(salePrice);
      return !Number.isFinite(price) || price <= 0 || price >= normalPrice;
    });
    if (invalid) {
      addToast(`Enter a valid sale price below normal price for ${invalid.product.name}`, "error");
      return;
    }

    setSaving(true);
    try {
      const sale: FlashSale = {
        title,
        enabled: true,
        starts_at: startsAt,
        ends_at: endsAt,
        products: selectedList.map(({ product, salePrice }) => ({ product_id: product.id, price: Number(salePrice) })),
      };
      const response = await adminFetcher<FlashSale>("/offers", {
        method: "PUT",
        body: JSON.stringify(sale),
      });
      setSavedSale(response.data);
      addToast(getOfferStatus(response.data, Date.now()) === "scheduled" ? "Flash sale scheduled" : "Flash sale is live", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to save sale", "error");
    } finally {
      setSaving(false);
    }
  };

  const endSale = async () => {
    const ok = await confirm(
      "End this flash sale now?",
      "All managed products will return to their normal prices and the homepage banner will be hidden.",
      { confirmLabel: "End sale", danger: true },
    );
    if (!ok) return;

    setSaving(true);
    try {
      await adminFetcher("/offers/end", { method: "POST" });
      setSavedSale((current) => current ? { ...current, enabled: false } : null);
      addToast("Sale ended and normal prices restored", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to end sale", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
      </div>
    );
  }

  if (loadError) return (
    <div className="rounded-2xl border border-line bg-surface p-8 text-center">
      <h1 className="text-xl font-bold">Offers could not be loaded</h1>
      <p role="alert" className="my-4 text-sm text-danger">{loadError}</p>
      <Button onClick={loadOffer}>Try again</Button>
    </div>
  );

  const tabs: { id: Tab; label: string; count: number; icon: typeof BadgePercent }[] = [
    { id: "flash", label: "Flash sale", count: selectedList.length, icon: BadgePercent },
    { id: "combos", label: "Combo deals", count: promotionConfig.combos.length, icon: PackagePlus },
    { id: "coupons", label: "Coupons", count: promotionConfig.coupons.length, icon: TicketPercent },
  ];

  const statusLabel = status === "live" ? "Live now" : status === "scheduled" ? "Scheduled" : status === "ended" ? "Ended" : savedSale ? "Inactive" : "Draft";
  const statusClass = status === "live"
    ? "bg-success-soft text-success"
    : status === "scheduled"
      ? "bg-info-soft text-info"
      : "bg-surface-2 text-muted";

  return (
    <fieldset disabled={saving} className="mx-auto min-w-0 max-w-6xl pb-12">
      {dialog}
      {pickerOpen && <OfferProductPicker selectedIds={Object.keys(selected)} onAdd={addProducts} onClose={() => setPickerOpen(false)} />}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-accent-text">
            <Tag className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Promotions</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Offers</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Run a flash sale, set product prices, and control the homepage promotion from one place.
          </p>
        </div>
        {tab === "flash" && (
          <Button onClick={saveSale} loading={saving} className="sm:self-end">
            {!saving && <Save className="h-4 w-4" />}
            Save sale
          </Button>
        )}
      </header>

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Offer types">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === id ? "text-fg" : "text-muted hover:text-fg"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] tabular-nums">{count}</span>
            {tab === id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      {tab !== "flash" ? (
        <PromotionsManager key={tab} kind={tab} config={promotionConfig} onUpdate={loadPromotions} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold">Sale details</h2>
                  <p className="mt-0.5 text-xs text-muted">Dhaka time (UTC+6). Prices return to normal automatically.</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusLabel}
                </span>
              </div>
              <div className="space-y-5 p-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Sale name</span>
                  <input value={saleName} onChange={(event) => setSaleName(event.target.value)} className={inputClass} maxLength={120} />
                  <span className="mt-1.5 block text-xs text-muted">Shown as the homepage promotion title.</span>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><CalendarClock className="h-4 w-4 text-muted" />Starts</span>
                    <input type="datetime-local" value={starts} onChange={(event) => setStarts(event.target.value)} className={`${inputClass} min-w-0`} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><CalendarClock className="h-4 w-4 text-muted" />Ends</span>
                    <input type="datetime-local" value={ends} onChange={(event) => setEnds(event.target.value)} className={`${inputClass} min-w-0`} />
                  </label>
                </div>
                {savedSale?.enabled && status !== "ended" && (
                  <div className="flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger-soft p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-muted">Prices return to normal automatically when the sale ends. You can also end it early.</p>
                    <Button variant="danger" size="sm" onClick={endSale} disabled={saving} className="shrink-0">End sale now</Button>
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold">Products on sale ({selectedList.length})</h2>
                  <p className="mt-0.5 text-xs text-muted">Add products, then set a sale price for each one.</p>
                </div>
                <Button size="sm" onClick={() => setPickerOpen(true)} disabled={selectedList.length >= 200}>
                  <Plus className="h-4 w-4" />Add products
                </Button>
              </div>
              <div className="p-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="Add a product: type its name"
                    aria-label="Search products to add"
                  />
                  {search.trim() && (
                    <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-line bg-surface p-1.5 shadow-lg">
                      {searchResults.length ? searchResults.map((product) => (
                        <button key={product.id} type="button" onClick={() => addProducts([product])} className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{product.name}</span>
                            <span className="block text-xs text-muted">{product.category}</span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold">{formatPrice(product.basePrice ?? product.price)}</span>
                        </button>
                      )) : <p className="px-3 py-4 text-center text-sm text-muted">{searching ? "Searching…" : searchError || "No matching products"}</p>}
                    </div>
                  )}
                </div>

                <div className="mt-4 divide-y divide-line">
                  {selectedList.length === 0 ? (
                    <div className="py-10 text-center">
                      <PackagePlus className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold">No products added yet</p>
                      <p className="mt-1 text-xs text-muted">Choose products from your catalog to start this sale.</p>
                      <Button onClick={() => setPickerOpen(true)} className="mt-4"><Plus className="h-4 w-4" />Add products from catalog</Button>
                    </div>
                  ) : selectedList.map(({ product, salePrice }) => {
                    const normalPrice = product.basePrice ?? product.price;
                    const discount = getDiscountPercent(normalPrice, Number(salePrice));
                    const validPrice = Number(salePrice) > 0 && Number(salePrice) < normalPrice;
                    return (
                      <div key={product.id} className="grid grid-cols-[minmax(0,1fr)_80px_36px] items-center gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_120px_70px_36px]">
                        <div className="col-span-3 min-w-0 sm:col-span-1">
                          <p className="text-sm font-semibold">{product.name}</p>
                          <p className="mt-1 text-xs text-muted">Normal price <span className="line-through">{formatPrice(normalPrice)}</span></p>
                        </div>
                        <label className="relative block">
                          <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-muted">৳</span>
                          <input
                            type="number"
                            min="0.01"
                            max={Math.max(0.01, normalPrice - 0.01)}
                            step="0.01"
                            value={salePrice}
                            onChange={(event) => setSelected((current) => ({
                              ...current,
                              [product.id]: { ...current[product.id], salePrice: event.target.value },
                            }))}
                            className={`${inputClass} h-10 pl-8 font-mono`}
                            aria-label={`Sale price for ${product.name}`}
                          />
                        </label>
                        <span className={`text-sm font-bold ${validPrice ? "text-success" : "text-danger"}`}>{validPrice ? discount ? `${discount}% off` : "<1% off" : "Check price"}</span>
                        <button type="button" onClick={() => removeProduct(product.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${product.name}`}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs xl:sticky xl:top-6">
            <div className="border-b border-line px-4 py-3.5">
              <h2 className="text-sm font-semibold">Homepage preview</h2>
              <p className="mt-0.5 text-xs text-muted">What customers will see</p>
            </div>
            <div className="p-4">
              <p className="mb-3 text-xs text-muted">Preview updates as you edit. Select Save sale to publish.</p>
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#df4a16] to-[#a7280e] p-4 text-white shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">Limited time offer</span>
                <h3 className="mt-2 font-serif text-xl font-bold text-white">{saleName.trim() || "Flash sale"}</h3>
                <p className="mt-1 text-xs text-white/85">Limited stock at these prices. Ends soon.</p>
                <Countdown endsAt={endsAt} />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">
                {endsAt ? `Ends ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(endsAt))}` : "Choose a valid end time"}
              </p>
            </div>
          </aside>
        </div>
      )}
    </fieldset>
  );
}
