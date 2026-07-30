"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { fetchCategories, fetchCategoryTree } from "@/src/lib/api";
import { CategoryForm, type CategoryFormData } from "@/src/components/admin/CategoryForm";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { adminFetcher } from "@/src/lib/admin-api";
import { cn } from "@/src/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description: string;
  parentId: string | null;
  children?: CategoryItem[];
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
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const load = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const tree = await fetchCategoryTree();
      setCategories(tree);
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
        const tree = await fetchCategoryTree();
        if (active) {
          setCategories(tree);
          const expanded: Record<string, boolean> = {};
          tree.forEach((p) => { expanded[p.id] = true; });
          setExpandedParents(expanded);
        }
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
      const body: Record<string, unknown> = { ...data };
      if (!body.parent_id) delete body.parent_id;
      await adminFetcher("/categories", {
        method: "POST",
        body: JSON.stringify(body),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editingId) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...data };
      if (!body.parent_id) delete body.parent_id;
      await adminFetcher(`/categories/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: CategoryItem) => {
    const ok = await confirm("Delete Category", `Are you sure you want to delete "${category.name}"?`, { confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminFetcher(`/categories/${category.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const openCreate = () => {
    setEditingCategory(null);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setEditingId(category.id);
    setFormOpen(true);
  };

  const findParentId = (cat: CategoryItem): string | null => {
    for (const parent of categories) {
      if (parent.children?.some((c) => c.id === cat.id)) {
        return parent.id;
      }
    }
    return cat.parentId ?? null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-link" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger bg-danger-soft rounded-2xl p-6 text-center">{error}</div>
    );
  }

  return (
    <div>
      {dialog}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent text-accent-fg rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-line overflow-hidden">
        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-700/50">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted">No categories found</div>
          ) : (
            categories.flatMap((parent) => {
              const items: { cat: CategoryItem; depth: number }[] = [
                { cat: parent, depth: 0 },
                ...(parent.children?.map((child) => ({ cat: child, depth: 1 })) ?? []),
              ];
              return items.map(({ cat, depth }) => (
                <div key={cat.id} className="p-4" style={{ paddingLeft: depth === 1 ? '2.5rem' : '1rem' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {cat.image && (
                        <div className="relative w-10 h-10 shrink-0">
                          <Image src={cat.image} alt={cat.name} fill className="rounded-lg object-cover" sizes="40px" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{depth === 0 ? cat.name : <span className="text-muted">— </span>}{cat.name}</p>
                        <p className="text-xs text-muted">{cat.productCount} products</p>
                        {cat.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{cat.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-zinc-500 hover:text-link-hover">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg hover:bg-danger-soft transition-colors text-zinc-500 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ));
            })
          )}
        </div>

        {/* Desktop table view */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2/50">
                <th className="text-left px-4 py-3 font-medium text-muted">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Products</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Description</th>
                <th className="text-right px-4 py-3 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted">No categories found</td>
                </tr>
              ) : (
                categories.flatMap((parent) => {
                  const isExpanded = expandedParents[parent.id] !== false;
                  const rows: { cat: CategoryItem; depth: number; isParent: boolean }[] = [
                    { cat: parent, depth: 0, isParent: true },
                    ...(parent.children && isExpanded
                      ? parent.children.map((child) => ({ cat: child, depth: 1, isParent: false }))
                      : []),
                  ];
                  return rows.map(({ cat, depth, isParent }) => (
                    <tr key={cat.id} className={cn(
                      "border-b border-line/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors",
                      depth === 1 && "bg-surface-2/30"
                    )}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3" style={{ paddingLeft: depth === 1 ? '1.5rem' : '0' }}>
                          {isParent && parent.children && parent.children.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedParents((prev) => ({
                                ...prev,
                                [parent.id]: !isExpanded,
                              }))}
                              className="p-0.5 rounded hover:bg-surface-2 transition-colors"
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-subtle" /> : <ChevronRight className="w-3.5 h-3.5 text-subtle" />}
                            </button>
                          )}
                          {depth === 1 && !cat.image && <span className="w-4 shrink-0" />}
                          {cat.image && (
                            <div className="relative w-10 h-10 shrink-0">
                              <Image src={cat.image} alt={cat.name} fill className="rounded-lg object-cover" sizes="40px" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                            </div>
                          )}
                          <span className={cn("font-medium", depth === 1 && "text-muted")}>
                            {depth === 1 && <span className="text-subtle mr-1">—</span>}
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted text-[13px]">{cat.slug}</td>
                      <td className="px-4 py-3 text-[13px]">{cat.productCount}</td>
                      <td className="px-4 py-3 text-muted max-w-xs truncate text-[13px]">{cat.description}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-zinc-500 hover:text-link-hover" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg hover:bg-danger-soft transition-colors text-zinc-500 hover:text-red-500" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })
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
          id: editingCategory.id,
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          image_url: editingCategory.image,
          parent_id: findParentId(editingCategory) ?? '',
        } : undefined}
        loading={submitting}
      />
    </div>
  );
}
