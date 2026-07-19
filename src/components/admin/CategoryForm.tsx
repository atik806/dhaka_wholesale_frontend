"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { slugify } from "@/src/lib/utils";

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Partial<CategoryFormData>;
  loading?: boolean;
}

export function CategoryForm({ isOpen, onClose, onSubmit, initialData, loading }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited && !initialData) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    if (!slug.trim()) { setError("Slug is required"); return; }
    try {
      await onSubmit({ name: name.trim(), slug: slug.trim(), description: description.trim(), image_url: imageUrl.trim() || '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{initialData ? "Edit Category" : "Add Category"}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Category name"
                  required
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                  placeholder="category-slug"
                  required
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description"
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">{error}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {initialData ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
