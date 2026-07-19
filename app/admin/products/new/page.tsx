"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchCategories } from "@/src/lib/api";
import type { Category } from "@/src/types/product";
import { ProductForm, type ProductFormValues } from "@/src/components/admin/ProductForm";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/providers/ToastProvider";
import { adminFetcher } from "@/src/lib/admin-api";

export default function NewProductPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((cats) => { if (active) setCategories(cats); })
      .catch(() => { if (active) addToast("Failed to load categories", "error"); })
      .finally(() => { if (active) setCategoriesLoading(false); });
    return () => { active = false; };
  }, [addToast]);

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        original_price: values.original_price ? Number(values.original_price) : null,
        category_id: values.category_id,
        images: values.images.split(",").map((s) => s.trim()).filter(Boolean),
        stock: values.stock,
        is_new: values.is_new,
        is_featured: values.is_featured,
      };
      if (values.tags.trim()) {
        body.tags = values.tags.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (values.sizes.trim()) {
        body.sizes = values.sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (values.colors.trim()) {
        body.colors = values.colors
          .split(",")
          .map((s) => {
            const [name, hex] = s.trim().split(":");
            return name && hex ? { name: name.trim(), hex: hex.trim() } : null;
          })
          .filter(Boolean);
      }
      await adminFetcher("/products", {
        method: "POST",
        body: JSON.stringify(body),
      });
      addToast("Product created successfully", "success");
      router.push("/admin/products");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
        <h1 className="font-serif text-2xl font-bold">New Product</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Add a new product to your store</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6"
      >
        <ProductForm
          onSubmit={handleSubmit}
          loading={loading}
          categories={categories}
          mode="create"
        />
      </motion.div>
    </div>
  );
}
