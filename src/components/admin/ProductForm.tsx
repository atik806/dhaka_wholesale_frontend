"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import type { Category } from "@/src/types/product";
import { Button } from "@/src/components/ui/Button";
import { ImageUpload } from "@/src/components/admin/ImageUpload";

export interface ProductFormValues {
  name: string;
  description: string;
  price: number | "";
  original_price: number | "";
  category_id: string;
  images: string;
  stock: string;
  tags: string;
  sizes: string;
  colors: string;
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
    stock: initialValues?.stock ?? "in-stock",
    tags: initialValues?.tags ?? "",
    sizes: initialValues?.sizes ?? "",
    colors: initialValues?.colors ?? "",
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const update = (key: keyof ProductFormValues, value: string | boolean | number | string[]) => {
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
    `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
      errors[field]
        ? "border-red-400 dark:border-red-500"
        : "border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          <label className={labelClass}>Stock</label>
          <select
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className={inputClass("stock")}
          >
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
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
        <label className={labelClass}>Product Images</label>
        <ImageUpload
          value={form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : []}
          onChange={(urls) => update("images", urls.join(", "))}
        />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <label className={labelClass}>Colors (name:hex, comma-separated)</label>
          <input
            type="text"
            value={form.colors}
            onChange={(e) => update("colors", e.target.value)}
            placeholder="Red:#FF0000, Blue:#0000FF"
            className={inputClass("colors")}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_new}
            onChange={(e) => update("is_new", e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary/30"
          />
          New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => update("is_featured", e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary/30"
          />
          Featured
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
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
