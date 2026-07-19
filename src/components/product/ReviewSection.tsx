"use client";

import { useState } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { useProductReviews } from "@/src/hooks/useApi";
import { submitReview, type Review } from "@/src/lib/api";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useToast } from "@/src/providers/ToastProvider";
import { formatDate } from "@/src/lib/utils";

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [page, setPage] = useState(1);
  const { data: reviewsData, isLoading, mutate } = useProductReviews(productId, page);
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const { addToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reviews = reviewsData?.data || [];
  const meta = reviewsData?.meta;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setSubmitting(true);
    try {
      await submitReview(productId, rating, text, session.access_token);
      setText("");
      setRating(5);
      setFormOpen(false);
      mutate();
      addToast("Review submitted!", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold">Reviews</h2>
        {user && !formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Write a Review
          </button>
        )}
        {!user && (
          <a
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign in to review
          </a>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700 space-y-4">
          <p className="text-sm font-medium">Your Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="p-0.5"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoveredStar || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            minLength={10}
            maxLength={1000}
            required
            placeholder="Share your experience with this product (min 10 characters)..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || text.length < 10}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => { setFormOpen(false); setText(""); setRating(5); }}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.profiles?.name || "Anonymous";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-primary dark:text-primary-light">
            {initial}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium truncate">{name}</p>
            <time className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
              {formatDate(review.created_at)}
            </time>
          </div>
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {review.text}
          </p>
        </div>
      </div>
    </div>
  );
}
