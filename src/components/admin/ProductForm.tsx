"use client";

import { useState } from "react";
import { Save, Loader2, Plus, Trash2, ImageOff } from "lucide-react";
import Image from "@/src/components/ui/Image";
import type { Category, ProductColor } from "@/src/types/product";
import { Button } from "@/src/components/ui/Button";
import { ImageUpload } from "@/src/components/admin/ImageUpload";
import { STOCK_STATUS_LABELS, parseStockQuantity, stockStatusFor } from "@/src/lib/inventory";

export interface ProductFormValues {
  name: string;
  description: string;
  price: number | "";
  original_price: number | "";
  category_id: string;
  images: string;
  /** Exact units on hand; the In/Low/Out label is derived from it. */
  stock_quantity: number | "";
  tags: string;
  sizes: string;
  colors: ProductColor[];
  is_new: boolean;
  is_featured: boolean;
}

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  loading?: boolean;
  categories: Category[];
  mode: "create" | "edit";
}

export function ProductForm({ initialValues, onSubmit, loading, categories, mode }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    price: initialValues?.price ?? "",
    original_price: initialValues?.original_price ?? "",
    category_id: initialValues?.category_id ?? "",
    images: initialValues?.images ?? "",
    stock_quantity: initialValues?.stock_quantity ?? "",
    tags: initialValues?.tags ?? "",
    sizes: initialValues?.sizes ?? "",
    colors: initialValues?.colors ?? [],
    is_new: initialValues?.is_new ?? false,
    is_featured: initialValues?.is_featured ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    else if (form.description.trim().length < 10) errs.description = "Description must be at least 10 characters";
    if (form.price === "" || Number(form.price) <= 0) errs.price = "Price must be greater than 0";
    if (!form.category_id) errs.category_id = "Category is required";
    const quantity = parseStockQuantity(form.stock_quantity);
    if (typeof quantity === "string") errs.stock_quantity = quantity;
    const parsedImages = form.images.split(",").map((s) => s.trim()).filter(Boolean);
    if (parsedImages.length === 0) errs.images = "At least one product image is required";
    if (form.colors.some((c) => !c.name.trim())) errs.colors = "Every colour needs a name";
    else if (new Set(form.colors.map((c) => c.name.trim().toLowerCase())).size < form.colors.length)
      errs.colors = "Colour names must be different";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const update = (
    key: keyof ProductFormValues,
    value: string | boolean | number | string[] | ProductColor[],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all bg-surface text-fg placeholder:text-muted dark:placeholder:text-zinc-500 ${
      errors[field]
        ? "border-red-400 dark:border-red-500"
        : "border-line focus:ring-2 focus:ring-accent/30 focus:border-accent"
    }`;

  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Product name"
            className={inputClass("name")}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update("price", e.target.value ? Number(e.target.value) : "")}
            placeholder="0.00"
            className={inputClass("price")}
          />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            className={inputClass("category_id")}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
        </div>
        <div>
          <label htmlFor="stock_quantity" className={labelClass}>Units in stock *</label>
          <input
            id="stock_quantity"
            type="number"
            step="1"
            min="0"
            inputMode="numeric"
            value={form.stock_quantity}
            onChange={(e) => update("stock_quantity", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="0"
            aria-describedby="stock_quantity_hint"
            className={inputClass("stock_quantity")}
          />
          {errors.stock_quantity ? (
            <p className="text-xs text-red-500 mt-1">{errors.stock_quantity}</p>
          ) : (
            <p id="stock_quantity_hint" className="text-xs text-muted mt-1">
              {typeof parseStockQuantity(form.stock_quantity) === "number"
                ? `Shown to customers as: ${STOCK_STATUS_LABELS[stockStatusFor(Number(form.stock_quantity))]}`
                : "Orders reduce this count automatically; cancellations add it back."}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Original Price (optional)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.original_price}
          onChange={(e) => update("original_price", e.target.value ? Number(e.target.value) : "")}
          placeholder="0.00"
          className={inputClass("original_price")}
        />
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Product description"
          rows={4}
          className={inputClass("description")}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className={labelClass}>Product Images *</label>
        <ImageUpload
          value={form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : []}
          onChange={(urls) => update("images", urls.join(", "))}
        />
        {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
          placeholder="tag1, tag2, tag3"
          className={inputClass("tags")}
        />
      </div>

      <div>
        <label className={labelClass}>Sizes (comma-separated)</label>
        <input
          type="text"
          value={form.sizes}
          onChange={(e) => update("sizes", e.target.value)}
          placeholder="S, M, L, XL"
          className={inputClass("sizes")}
        />
      </div>

      <ColorsEditor
        colors={form.colors}
        images={form.images.split(",").map((s) => s.trim()).filter(Boolean)}
        onChange={(colors) => update("colors", colors)}
        error={errors.colors}
        inputClass={inputClass("colors")}
        labelClass={labelClass}
      />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_new}
            onChange={(e) => update("is_new", e.target.checked)}
            className="w-4 h-4 rounded border-line-strong text-link focus:ring-accent/30"
          />
          New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => update("is_featured", e.target.checked)}
            className="w-4 h-4 rounded border-line-strong text-link focus:ring-accent/30"
          />
          Featured
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t border-line">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === "create" ? "Create Product" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * One row per colour: name, swatch colour and the product photo that shows
 * it. Customers who pick the colour see that photo.
 */
function ColorsEditor({
  colors,
  images,
  onChange,
  error,
  inputClass,
  labelClass,
}: {
  colors: ProductColor[];
  images: string[];
  onChange: (colors: ProductColor[]) => void;
  error?: string;
  inputClass: string;
  labelClass: string;
}) {
  const set = (i: number, patch: Partial<ProductColor>) =>
    onChange(colors.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className={labelClass + " mb-0"}>Colours</label>
        <button
          type="button"
          onClick={() => onChange([...colors, { name: "", hex: "#000000" }])}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-link hover:bg-surface-2"
        >
          <Plus className="h-4 w-4" />
          Add colour
        </button>
      </div>
      <p className="mb-3 text-xs text-muted">
        Customers must choose one of these when ordering. Pick the photo that shows each colour; the
        product page switches to it when the colour is tapped.
      </p>

      {colors.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">
          No colours. Customers order this product without choosing one.
        </p>
      ) : (
        <ul className="space-y-3">
          {colors.map((color, i) => {
            const missingPhoto = color.image && !images.includes(color.image);
            return (
              <li key={i} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={HEX.test(color.hex) ? color.hex : "#000000"}
                    onChange={(e) => set(i, { hex: e.target.value })}
                    aria-label={`Swatch colour for ${color.name || `colour ${i + 1}`}`}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-0.5"
                  />
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => set(i, { name: e.target.value })}
                    placeholder="Colour name, e.g. Purple"
                    aria-label={`Name of colour ${i + 1}`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => onChange(colors.filter((_, j) => j !== i))}
                    aria-label={`Remove ${color.name || `colour ${i + 1}`}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-medium text-muted">
                    Photo for this colour
                    {missingPhoto && (
                      <span className="ml-1 text-danger">(its photo was removed; pick another)</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => set(i, { image: undefined })}
                      aria-pressed={!color.image}
                      title="No photo"
                      className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-muted ${
                        !color.image ? "border-accent" : "border-line hover:border-line-strong"
                      }`}
                    >
                      <ImageOff className="h-4 w-4" />
                    </button>
                    {images.map((url, n) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => set(i, { image: url })}
                        aria-pressed={color.image === url}
                        aria-label={`Use photo ${n + 1}`}
                        className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 bg-surface-2 ${
                          color.image === url ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-line-strong"
                        }`}
                      >
                        <Image src={url} alt="" fill sizes="56px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/** Colours as the API expects them: trimmed, with photos that still belong to the product. */
export function colorsForApi(colors: ProductColor[], images: string): ProductColor[] {
  const photos = images.split(",").map((s) => s.trim()).filter(Boolean);
  return colors
    .filter((c) => c.name.trim())
    .map((c) => ({
      name: c.name.trim(),
      hex: c.hex,
      ...(c.image && photos.includes(c.image) ? { image: c.image } : {}),
    }));
}
