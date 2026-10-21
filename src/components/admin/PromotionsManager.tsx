"use client";

import { useEffect, useRef, useState } from "react";
import { Edit, Loader2, PackagePlus, Plus, TicketPercent, Trash2, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { OfferProductPicker } from "./OfferProductPicker";
import { useConfirm } from "./ConfirmDialog";
import { adminFetcher } from "@/src/lib/admin-api";
import { fetchProducts } from "@/src/lib/api";
import { dhakaInputToIso, getOfferStatus, promotionSaveRequest, toDhakaInputValue, type ComboDeal, type Coupon, type PromotionConfig } from "@/src/lib/offers";
import { formatPrice } from "@/src/lib/utils";
import { useToast } from "@/src/providers/ToastProvider";
import type { Product } from "@/src/types/product";

const inputClass = "h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

function EditorDialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    const focus = document.activeElement;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => { node?.close(); document.body.style.overflow = overflow; if (focus instanceof HTMLElement && focus.isConnected) focus.focus(); };
  }, []);
  return <dialog ref={ref} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} aria-label="Edit promotion" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-fg shadow-xl backdrop:bg-black/60">{children}</dialog>;
}

export function PromotionsManager({ kind, config, onUpdate }: {
  kind: "combos" | "coupons";
  config: PromotionConfig;
  onUpdate: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const [combo, setCombo] = useState<ComboDeal | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState(false);
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [productError, setProductError] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const entries = kind === "combos" ? config.combos : config.coupons;
  const editor = combo ?? coupon;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const ids = [...new Set(config.combos.flatMap((item) => item.products.map((line) => line.product_id)))];
    if (!ids.length) return;
    (async () => {
      try {
        const pages = await Promise.all(Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => fetchProducts({ ids: ids.slice(index * 100, index * 100 + 100), limit: 100 }, controller.signal)));
        if (!controller.signal.aborted) { setProducts(Object.fromEntries(pages.flatMap((page) => page.products).map((product) => [product.id, product]))); setProductError(false); }
      } catch { if (!controller.signal.aborted) setProductError(true); }
    })();
    return () => controller.abort();
  }, [config.combos]);

  const open = (value?: ComboDeal | Coupon) => {
    const start = new Date(); start.setSeconds(0, 0);
    const end = new Date(start.getTime() + 7 * 86_400_000);
    const window = { id: crypto.randomUUID(), enabled: true, starts_at: start.toISOString(), ends_at: end.toISOString() };
    if (kind === "combos") { setCombo(value ? value as ComboDeal : { ...window, title: "", price: 0, products: [] }); setCoupon(null); }
    else { setCoupon(value ? value as Coupon : { ...window, code: "", type: "percentage", value: 10, minimum_spend: 0, maximum_discount: null, max_redemptions: null, per_customer_limit: null }); setCombo(null); setNewCoupon(!value); }
    setStarts(toDhakaInputValue(value?.starts_at ?? window.starts_at));
    setEnds(toDhakaInputValue(value?.ends_at ?? window.ends_at));
    setFormError("");
  };
  const close = () => { if (!saving) { setCombo(null); setCoupon(null); setPickerOpen(false); } };
  const put = (value: ComboDeal | Coupon) => {
    const { body, version } = promotionSaveRequest(value);
    return adminFetcher(`/offers/${kind}`, { method: "PUT", headers: { "X-Expected-Version": version }, body: JSON.stringify(body) });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor) return;
    const startsAt = dhakaInputToIso(starts);
    const endsAt = dhakaInputToIso(ends);
    if (!startsAt || !endsAt || Date.parse(endsAt) <= Date.parse(startsAt)) { setFormError("End must be after start."); return; }
    if (combo && combo.products.length < 2) { setFormError("Add at least two different products to the combo."); return; }
    setSaving(true); setFormError("");
    try {
      await put({ ...editor, starts_at: startsAt, ends_at: endsAt });
      await onUpdate();
      setCombo(null); setCoupon(null);
      addToast(combo ? "Combo deal saved" : "Coupon saved", "success");
    } catch (error) { setFormError(error instanceof Error ? error.message : "Failed to save promotion"); }
    finally { setSaving(false); }
  };
  const toggle = async (value: ComboDeal | Coupon) => {
    setSaving(true);
    try { await put({ ...value, enabled: !value.enabled }); await onUpdate(); addToast(value.enabled ? "Promotion paused" : "Promotion activated", "success"); }
    catch (error) { addToast(error instanceof Error ? error.message : "Failed to update promotion", "error"); }
    finally { setSaving(false); }
  };
  const remove = async (value: ComboDeal | Coupon) => {
    const title = "title" in value ? value.title : value.code;
    if (!await confirm(`Delete ${title}?`, "This promotion will no longer apply to new checkouts. Existing orders keep their saved prices.", { confirmLabel: "Delete", danger: true })) return;
    setSaving(true);
    try { await adminFetcher(`/offers/${kind}/${value.id}`, { method: "DELETE" }); await onUpdate(); addToast("Promotion deleted", "success"); }
    catch (error) { addToast(error instanceof Error ? error.message : "Failed to delete promotion", "error"); }
    finally { setSaving(false); }
  };
  const normalTotal = combo?.products.reduce((sum, line) => sum + (products[line.product_id]?.basePrice ?? products[line.product_id]?.price ?? 0) * line.quantity, 0) ?? 0;

  return (
    <section className="rounded-2xl border border-line bg-surface shadow-xs">
      {dialog}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
        <div><h2 className="text-lg font-semibold">{kind === "combos" ? "Combo deals" : "Coupon codes"} ({entries.length})</h2><p className="mt-1 text-sm text-muted">{kind === "combos" ? "Set one price for a group of products. Discounts apply automatically in checkout." : "Create reusable codes customers can apply at checkout. Codes are not listed publicly."}</p>{kind === "combos" && <p className="mt-1 text-xs text-muted">Overlapping combos use the highest savings first. Each unit counts toward one combo.</p>}</div>
        <Button onClick={() => open()} disabled={saving}><Plus className="h-4 w-4" />{kind === "combos" ? "Add combo deal" : "Add coupon"}</Button>
      </div>
      {!entries.length ? <div className="p-10 text-center">{kind === "combos" ? <PackagePlus className="mx-auto h-8 w-8 text-muted" /> : <TicketPercent className="mx-auto h-8 w-8 text-muted" />}<p className="mt-3 font-semibold">{kind === "combos" ? "No combo deals yet" : "No coupons yet"}</p><p className="mt-1 text-sm text-muted">{kind === "combos" ? "Add a combo, select its products, and choose a bundle price." : "Add a code, choose its discount, and set its valid dates."}</p></div> : (
        <div className="divide-y divide-line">{entries.map((value) => {
          const status = getOfferStatus(value, now);
          return <div key={value.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{"title" in value ? value.title : <span className="font-mono">{value.code}</span>}</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${status === "live" ? "bg-success-soft text-success" : "bg-surface-2 text-muted"}`}>{!value.enabled ? "Paused" : status === "live" ? "Live" : status === "scheduled" ? "Scheduled" : "Ended"}</span></div>
              {"products" in value ? <><p className="mt-2 text-sm font-semibold">Bundle price: {formatPrice(value.price)}</p><ul className="mt-1 space-y-1 text-xs text-muted">{value.products.map((line) => <li key={line.product_id}>{line.quantity} × {products[line.product_id]?.name ?? (productError ? "Product unavailable" : "Loading product…")}</li>)}</ul></> : <><p className="mt-2 text-sm text-muted">{value.type === "percentage" ? `${value.value}% off` : `${formatPrice(value.value)} off`} · Min. spend {formatPrice(value.minimum_spend)}{value.maximum_discount !== null ? ` · Max. discount ${formatPrice(value.maximum_discount)}` : ""}</p><p className="mt-1 text-xs text-muted">Used {value.redemptions ?? 0}{value.max_redemptions ? ` of ${value.max_redemptions}` : ""} time{(value.redemptions ?? 0) === 1 ? "" : "s"}{value.per_customer_limit ? ` · ${value.per_customer_limit} per customer` : " · no per-customer limit"}</p></>}
              <p className="mt-2 text-xs text-muted">{toDhakaInputValue(value.starts_at).replace("T", " ")} — {toDhakaInputValue(value.ends_at).replace("T", " ")} (Dhaka)</p>
            </div>
            <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={saving} onClick={() => void toggle(value)}>{value.enabled ? "Pause" : "Activate"}</Button><Button size="sm" variant="outline" disabled={saving} onClick={() => open(value)}><Edit className="h-3.5 w-3.5" />Edit</Button><Button size="sm" variant="ghost" disabled={saving} onClick={() => void remove(value)} aria-label={`Delete ${"title" in value ? value.title : value.code}`}><Trash2 className="h-4 w-4 text-danger" /></Button></div>
          </div>;
        })}</div>
      )}
      {editor && <EditorDialog onClose={close}>
        <form onSubmit={save}>
          <fieldset disabled={saving} className="min-w-0">
            <header className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="text-lg font-bold">{combo ? "Combo deal" : "Coupon code"}</h2><button type="button" onClick={close} aria-label="Close promotion editor" className="rounded-lg p-2 hover:bg-surface-2"><X className="h-5 w-5" /></button></header>
            <div className="space-y-5 p-5">
              {combo ? <>
                <label className="block text-sm font-semibold">Combo name<input required maxLength={120} value={combo.title} onChange={(event) => setCombo({ ...combo, title: event.target.value })} className={`${inputClass} mt-1.5`} placeholder="e.g. Helmet + riding gloves" /></label>
                <div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Products ({combo.products.length}/20)</h3><Button type="button" variant="outline" size="sm" disabled={combo.products.length >= 20} onClick={() => setPickerOpen(true)}><Plus className="h-4 w-4" />Add products</Button></div>
                  {!combo.products.length && <p className="rounded-xl border border-dashed border-line p-5 text-center text-sm text-muted">Add at least two products from your catalog.</p>}
                  {combo.products.map((line) => <div key={line.product_id} className="flex items-center gap-3 border-b border-line py-3"><span className="min-w-0 flex-1 text-sm">{products[line.product_id]?.name ?? "Product unavailable"}</span><label className="block"><span className="sr-only">Quantity for {products[line.product_id]?.name ?? line.product_id}</span><input type="number" min={1} max={20} required value={line.quantity} onChange={(event) => setCombo({ ...combo, products: combo.products.map((item) => item.product_id === line.product_id ? { ...item, quantity: Number(event.target.value) } : item) })} className={`${inputClass} w-20`} /></label><button type="button" onClick={() => setCombo({ ...combo, products: combo.products.filter((item) => item.product_id !== line.product_id) })} aria-label="Remove combo product" className="p-2 text-danger"><X className="h-4 w-4" /></button></div>)}
                </div>
                <label className="block text-sm font-semibold">Combo price (৳)<input type="number" min="0.01" step="0.01" max="1000000" required value={combo.price || ""} onChange={(event) => setCombo({ ...combo, price: Number(event.target.value) })} className={`${inputClass} mt-1.5`} /><span className="mt-1.5 block text-xs font-normal text-muted">Normal total: {formatPrice(normalTotal)}. The combo applies only when it gives a lower price.</span></label>
              </> : coupon && <>
                <label className="block text-sm font-semibold">Coupon code<input required readOnly={!newCoupon} pattern="[A-Za-z0-9_-]{3,40}" maxLength={40} value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} className={`${inputClass} mt-1.5 font-mono`} placeholder="e.g. WELCOME10" /><span className="mt-1 block text-xs font-normal text-muted">Share this code with customers. Codes cannot be renamed after creation.</span></label>
                <div className="grid grid-cols-2 gap-4"><label className="block text-sm font-semibold">Discount type<select value={coupon.type} onChange={(event) => setCoupon({ ...coupon, type: event.target.value as Coupon["type"] })} className={`${inputClass} mt-1.5`}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount (৳)</option></select></label><label className="block text-sm font-semibold">Discount value<input type="number" min="0.01" step="0.01" max={coupon.type === "percentage" ? 100 : 1000000} required value={coupon.value || ""} onChange={(event) => setCoupon({ ...coupon, value: Number(event.target.value) })} className={`${inputClass} mt-1.5`} /></label></div>
                <div className="grid grid-cols-2 gap-4"><label className="block text-sm font-semibold">Minimum spend (৳)<input type="number" min={0} max={1000000} step="0.01" required value={coupon.minimum_spend} onChange={(event) => setCoupon({ ...coupon, minimum_spend: Number(event.target.value) })} className={`${inputClass} mt-1.5`} /></label><label className="block text-sm font-semibold">Discount cap (৳)<input type="number" min="0.01" max={1000000} step="0.01" value={coupon.maximum_discount ?? ""} onChange={(event) => setCoupon({ ...coupon, maximum_discount: event.target.value ? Number(event.target.value) : null })} className={`${inputClass} mt-1.5`} placeholder="No cap" /></label></div>
                <div className="grid grid-cols-2 gap-4"><label className="block text-sm font-semibold">Total uses<input type="number" min={1} max={1000000} step={1} value={coupon.max_redemptions ?? ""} onChange={(event) => setCoupon({ ...coupon, max_redemptions: event.target.value ? Number(event.target.value) : null })} className={`${inputClass} mt-1.5`} placeholder="Unlimited" /></label><label className="block text-sm font-semibold">Uses per customer<input type="number" min={1} max={1000} step={1} value={coupon.per_customer_limit ?? ""} onChange={(event) => setCoupon({ ...coupon, per_customer_limit: event.target.value ? Number(event.target.value) : null })} className={`${inputClass} mt-1.5`} placeholder="Unlimited" /></label></div>
                <p className="text-xs text-muted">One code per order. Cancelled orders do not count as uses. Minimum spend and coupon discounts are calculated after combo discounts, excluding shipping.</p>
              </>}
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Starts (Dhaka)<input type="datetime-local" required value={starts} onChange={(event) => setStarts(event.target.value)} className={`${inputClass} mt-1.5`} /></label><label className="block text-sm font-semibold">Ends (Dhaka)<input type="datetime-local" required value={ends} onChange={(event) => setEnds(event.target.value)} className={`${inputClass} mt-1.5`} /></label></div>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={editor.enabled} onChange={(event) => { if (combo) setCombo({ ...combo, enabled: event.target.checked }); else if (coupon) setCoupon({ ...coupon, enabled: event.target.checked }); }} className="h-4 w-4 accent-accent" />Active during these dates</label>
              {formError && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{formError}</p>}
            </div>
            <footer className="flex justify-between border-t border-line p-5"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" loading={saving}>{saving && <Loader2 className="sr-only" />}Save {combo ? "combo deal" : "coupon"}</Button></footer>
          </fieldset>
        </form>
        {pickerOpen && combo && <OfferProductPicker maxProducts={20} selectedIds={combo.products.map((line) => line.product_id)} onClose={() => setPickerOpen(false)} onAdd={(added) => {
          setProducts((current) => ({ ...current, ...Object.fromEntries(added.map((product) => [product.id, product])) }));
          setCombo((current) => current ? { ...current, products: [...current.products, ...added.filter((product) => !current.products.some((line) => line.product_id === product.id)).map((product) => ({ product_id: product.id, quantity: 1 }))].slice(0, 20) } : null);
        }} />}
      </EditorDialog>}
    </section>
  );
}
