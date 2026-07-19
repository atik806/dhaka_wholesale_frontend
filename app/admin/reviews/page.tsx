"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Trash2, Star } from "lucide-react";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { formatDate } from "@/src/lib/utils";
import { fetchAdminReviews, deleteAdminReview, type AdminReview } from "@/src/lib/admin-api";
import { useRealtimeData } from "@/src/hooks/useRealtimeData";
import { useToast } from "@/src/providers/ToastProvider";

export default function AdminReviewsPage() {
  const { addToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: reviews, loading, error } = useRealtimeData<AdminReview>({
    table: "reviews",
    initialFetch: useCallback(async () => {
      const res = await fetchAdminReviews({ page: 1, limit: 1000 });
      return res.reviews;
    }, []),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return reviews;
    const q = search.toLowerCase();
    return reviews.filter(
      (r) =>
        (r.products?.name || "").toLowerCase().includes(q) ||
        (r.profiles?.name || "").toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const handleDelete = useCallback(async (review: AdminReview) => {
    const ok = await confirm("Delete Review", "Are you sure you want to delete this review? This cannot be undone.", { confirmLabel: "Delete", danger: true });
    if (!ok) return;
    setActionLoading(review.id);
    try {
      await deleteAdminReview(review.id);
      addToast("Review deleted", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete review", "error");
    } finally {
      setActionLoading(null);
    }
  }, [confirm, addToast]);

  const columns: Column<AdminReview>[] = useMemo(() => [
    {
      key: "product",
      label: "Product",
      render: (review) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {review.products?.name || "Unknown Product"}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (review) => (
        <span>{review.profiles?.name || "Unknown"}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (review) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      key: "text",
      label: "Review",
      render: (review) => {
        const truncated = review.text.length > 60 ? review.text.slice(0, 60) + "..." : review.text;
        return (
          <span
            className="text-zinc-600 dark:text-zinc-300 max-w-xs block truncate"
            title={review.text}
          >
            {truncated}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      render: (review) => (
        <span className="text-zinc-500 dark:text-zinc-400">{formatDate(review.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (review) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(review); }}
          disabled={actionLoading === review.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
        >
          {actionLoading === review.id
            ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />
          }
          Delete
        </button>
      ),
    },
  ], [actionLoading, handleDelete]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl px-6 py-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {dialog}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage customer product reviews &mdash; <span className="text-primary font-medium">{reviews.length}</span> total
          </p>
        </div>
      </div>

      <DataTable<AdminReview>
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        mobileCard={(review) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{review.products?.name || "Unknown Product"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{review.profiles?.name || "Unknown"}</p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"}`} />
                ))}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 line-clamp-2">{review.text}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatDate(review.created_at)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(review); }}
              disabled={actionLoading === review.id}
              className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </motion.div>
  );
}
