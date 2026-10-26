"use client";
import { useState } from "react";
import Link from "next/link";
import {
  can,
  opsSave,
  type InventoryProduct,
  type InventoryVariant,
} from "@/src/lib/operations-api";
import { formatPrice } from "@/src/lib/utils";
import { useAdminAccess } from "./AccessContext";
import {
  useOpsList,
  PageTitle,
  Panel,
  Field,
  Pager,
  ListState,
  ErrorMessage,
  inputClass,
  buttonClass,
  secondaryClass,
} from "./shared";
type Movement = {
  id: string;
  inventory_variants?: { sku: string } | null;
  delta: number;
  balance: number;
  reason: string;
  variant_id: string | null;
  created_at: string;
};
function Allocation({
  product,
  busy,
  save,
}: {
  product: InventoryProduct;
  busy: boolean;
  save: (path: string, data: unknown) => Promise<void>;
}) {
  const sizes = product.sizes?.length ? product.sizes : [""];
  const colors = product.colors?.length
    ? product.colors.map((c) => c.name)
    : [""];
  const choices = sizes.flatMap((size) =>
    colors.map((color) => ({ size, color })),
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        void save("inventory/" + product.id + "/configure", {
          variants: choices.map((v, i) => ({
            ...v,
            sku: f.get("sku" + i),
            stock_quantity: Number(f.get("quantity" + i)),
            low_stock_threshold: Number(f.get("threshold" + i)),
            unit_cost:
              f.get("cost" + i) === "" ? null : Number(f.get("cost" + i)),
          })),
        });
      }}
      className="space-y-4"
    >
      <p className="text-sm text-muted">
        Distribute the existing <strong>{product.stock_quantity}</strong> units
        across the choices below. The allocation must total exactly{" "}
        {product.stock_quantity}. Complete active orders before allocating. This
        switches the product to separate stock for each SKU.
      </p>
      <div className="space-y-4">
        {choices.map((v, i) => (
          <fieldset
            key={i}
            className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <legend className="px-2 text-sm font-semibold">
              {[v.size, v.color].filter(Boolean).join(" / ") || "Default item"}
            </legend>
            <Field label="SKU">
              <input
                name={"sku" + i}
                className={inputClass}
                defaultValue={[product.slug, v.size, v.color]
                  .filter(Boolean)
                  .join("-")
                  .toUpperCase()}
                maxLength={100}
                required
              />
            </Field>
            <Field label="Allocate units">
              <input
                name={"quantity" + i}
                type="number"
                min="0"
                max="1000000"
                defaultValue={choices.length === 1 ? product.stock_quantity : 0}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Low stock alert at">
              <input
                name={"threshold" + i}
                type="number"
                min="0"
                defaultValue={product.low_stock_threshold}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Unit cost (BDT)">
              <input
                name={"cost" + i}
                type="number"
                min="0"
                step="0.01"
                defaultValue={product.unit_cost ?? ""}
                className={inputClass}
              />
            </Field>
          </fieldset>
        ))}
      </div>
      <button disabled={busy || choices.length > 200} className={buttonClass}>
        Allocate variant stock
      </button>
      {choices.length > 200 && (
        <p className="text-danger text-sm">
          Reduce product options before allocating more than 200 combinations.
        </p>
      )}
    </form>
  );
}
function Adjustment({
  product,
  busy,
  save,
}: {
  product: InventoryProduct;
  busy: boolean;
  save: (path: string, data: unknown) => Promise<void>;
}) {
  const [variantId, setVariantId] = useState(
    product.inventory_variants?.[0]?.id ?? "",
  );
  const selected =
    product.inventory_mode === "variant"
      ? product.inventory_variants.find((v) => v.id === variantId)
      : product;
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!selected) return;
        const f = new FormData(e.currentTarget);
        void save("inventory/" + product.id + "/adjust", {
          variant_id: product.inventory_mode === "variant" ? variantId : null,
          expected_quantity: selected.stock_quantity,
          expected_version: selected.inventory_version,
          delta: Number(f.get("delta")),
          reason: f.get("reason"),
          request_key: crypto.randomUUID(),
          low_stock_threshold: Number(f.get("threshold")),
          unit_cost: f.get("cost") === "" ? null : Number(f.get("cost")),
        });
      }}
    >
      {product.inventory_mode === "variant" && (
        <Field label="SKU">
          <select
            className={inputClass}
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            {product.inventory_variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.sku} · {v.stock_quantity} units
              </option>
            ))}
          </select>
        </Field>
      )}
      {selected && (
        <div key={variantId} className="space-y-3">
          <p className="text-sm text-muted">
            Current stock: <strong>{selected.stock_quantity}</strong>. Enter a
            positive number to add units or a negative number to remove units.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Stock change">
              <input
                name="delta"
                type="number"
                min={-selected.stock_quantity}
                max="1000000"
                defaultValue="0"
                className={inputClass}
                required
              />
            </Field>
            <Field label="Low stock alert at">
              <input
                name="threshold"
                type="number"
                min="0"
                defaultValue={selected.low_stock_threshold}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Unit cost (BDT)">
              <input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                defaultValue={selected.unit_cost ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Reason for this adjustment">
            <textarea
              name="reason"
              maxLength={2000}
              className={inputClass}
              placeholder="For example: received 12 units from supplier"
              required
            />
          </Field>
          <button disabled={busy} className={buttonClass}>
            Save adjustment
          </button>
        </div>
      )}
    </form>
  );
}
export function InventoryPage() {
  const { permissions } = useAdminAccess();
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<InventoryProduct | null>(null),
    [mode, setMode] = useState("adjust"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const list = useOpsList<InventoryProduct>("inventory", { page, search });
  const movements = useOpsList<Movement>("movements", {
    product_id: selected?.id,
    limit: 25,
  });
  async function save(path: string, data: unknown) {
    setBusy(true);
    setError("");
    try {
      await opsSave(path, data);
      setSelected(null);
      list.refresh();
      movements.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        title="Inventory"
        description="Manage stock by SKU, track adjustments, and record product costs."
      />
      <div className="space-y-6">
        <Panel title="Stock overview">
          <Field label="Search products">
            <input
              className={inputClass}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Product name"
            />
          </Field>
          <ListState
            loading={list.loading}
            error={list.error}
            empty={!list.data.length}
          />
          {!list.loading &&
            list.data.map((p) => (
              <article key={p.id} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      className="font-semibold text-link"
                      href={"/admin/products/" + p.slug}
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      {p.stock_quantity} total units ·{" "}
                      {p.inventory_mode === "variant"
                        ? p.inventory_variants.length + " SKUs"
                        : "Shared product stock"}{" "}
                      ·{" "}
                      {p.unit_cost === null
                        ? "Unit cost unknown"
                        : formatPrice(p.unit_cost) + " unit cost"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {can(permissions, "inventory.manage") && (
                      <>
                        <button
                          className={secondaryClass}
                          onClick={() => {
                            setSelected(p);
                            setMode("adjust");
                            setError("");
                          }}
                        >
                          Adjust stock
                        </button>
                        {p.inventory_mode !== "variant" && (
                          <button
                            className={secondaryClass}
                            onClick={() => {
                              setSelected(p);
                              setMode("allocate");
                              setError("");
                            }}
                          >
                            Allocate SKUs
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {p.inventory_variants?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.inventory_variants.map((v: InventoryVariant) => (
                      <span
                        key={v.id}
                        className={
                          "rounded-lg px-3 py-1 text-xs " +
                          (v.stock_quantity <= v.low_stock_threshold
                            ? "bg-danger-soft text-danger"
                            : "bg-surface-2 text-muted")
                        }
                      >
                        {v.sku}: {v.stock_quantity}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          <Pager meta={list.meta} onPage={setPage} />
        </Panel>
        {selected && (
          <>
            <Panel
              title={
                selected.name +
                " · " +
                (mode === "allocate" ? "Allocate stock" : "Stock adjustment")
              }
            >
              <button
                className={secondaryClass}
                disabled={busy}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <ErrorMessage message={error} />
              {mode === "allocate" ? (
                <Allocation
                  key={selected.id}
                  product={selected}
                  save={save}
                  busy={busy}
                />
              ) : (
                <Adjustment
                  key={selected.id}
                  product={selected}
                  save={save}
                  busy={busy}
                />
              )}
            </Panel>
            <Panel title="Recent stock movements">
              <ListState
                loading={movements.loading}
                error={movements.error}
                empty={!movements.data.length}
              />
              {movements.data.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm"
                >
                  <span>
                    {m.inventory_variants?.sku ?? "Product stock"} -{" "}
                    {m.reason.replaceAll("_", " ")} ·{" "}
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                  <strong>
                    {m.delta > 0 ? "+" : ""}
                    {m.delta} → {m.balance} units
                  </strong>
                </div>
              ))}
            </Panel>
          </>
        )}
      </div>
    </>
  );
}
