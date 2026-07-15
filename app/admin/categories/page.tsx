"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { fetchCategories } from "@/src/lib/api";
import { CategoryForm, type CategoryFormData } from "@/src/components/admin/CategoryForm";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { adminFetcher } from "@/src/lib/admin-api";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description: string;
}

export default function CategoriesPage() {
  const { confirm, dialog } = useConfirm();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchCategories();
        if (active) setCategories(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load categories");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleCreate = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      await adminFetcher("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editingId) return;
    setSubmitting(true);
    try {
      await adminFetcher(`/categories/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: CategoryItem) => {
    const ok = await confirm("Delete Category", `Are you sure you want to delete "${category.name}"?`, { confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminFetcher(`/categories/${category.slug}`, { method: "DELETE" });
      await load();
    } catch {
      alert("Failed to delete category");
    }
  };

  const openCreate = () => {
    setEditingCategory(null);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setEditingId(category.slug);
    setFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 text-center">{error}</div>
    );
  }

  return (
    <div>
      {dialog}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Categories</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-700/50">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">No categories found</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {cat.image && (
                      <div className="relative w-10 h-10 shrink-0">
                        <Image src={cat.image} alt={cat.name} fill className="rounded-lg object-cover" sizes="40px" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{cat.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{cat.productCount} products</p>
                      {cat.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-500 hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-zinc-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table view */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Products</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Description</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-500 dark:text-zinc-400">No categories found</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cat.image && (
                          <div className="relative w-10 h-10 shrink-0">
                            <Image src={cat.image} alt={cat.name} fill className="rounded-lg object-cover" sizes="40px" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                          </div>
                        )}
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{cat.slug}</td>
                    <td className="px-4 py-3">{cat.productCount}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 max-w-xs truncate">{cat.description}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-500 hover:text-primary" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-zinc-500 hover:text-red-500" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryForm
        key={formOpen ? (editingCategory?.slug ?? "new") : "closed"}
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingCategory(null); setEditingId(null); }}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        initialData={editingCategory ? {
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          image_url: editingCategory.image,
        } : undefined}
        loading={submitting}
      />
    </div>
  );
}
