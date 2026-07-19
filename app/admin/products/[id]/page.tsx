"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchProductBySlug, fetchCategories } from "@/src/lib/api";
import type { Product, Category } from "@/src/types/product";
import { ProductForm, type ProductFormValues } from "@/src/components/admin/ProductForm";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/providers/ToastProvider";
import { adminFetcher } from "@/src/lib/admin-api";

function productToFormValues(product: Product, categories: Category[]): Partial<ProductFormValues> {
  const cat = categories.find((c) => c.name === product.category);
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    original_price: product.originalPrice ?? "",
    category_id: cat?.id || "",
    images: product.images?.join(", ") || "",
    stock: product.stock,
    tags: product.tags?.join(", ") || "",
    sizes: product.variants?.sizes?.join(", ") || "",
    colors: product.variants?.colors?.map((c) => `${c.name}:${c.hex}`).join(", ") || "",
    is_new: product.isNew || false,
    is_featured: product.isFeatured || false,
  };
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const slug = params.id;
    setProduct(null);
    Promise.all([fetchProductBySlug(slug), fetchCategories()])
      .then(([prod, cats]) => {
        if (!active) return;
        if (!prod) {
          setNotFound(true);
          return;
        }
        setProduct(prod);
        setCategories(cats);
      })
      .catch(() => { if (active) addToast("Failed to load product", "error"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id, addToast]);

  const handleSubmit = async (values: ProductFormValues) => {
    if (!product) return;
    setSaving(true);
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
      await adminFetcher(`/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      addToast("Product updated successfully", "success");
      router.push("/admin/products");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div>
        <div className="mb-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-zinc-500 dark:text-zinc-400">Product not found</p>
        </div>
      </div>
    );
  }

  const initialValues = productToFormValues(product, categories);

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
        <h1 className="font-serif text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{product.name}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6"
      >
        <ProductForm
          key={product.id}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={saving}
          categories={categories}
          mode="edit"
        />
      </motion.div>
    </div>
  );
}
