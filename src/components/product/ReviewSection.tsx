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
    <section className="mt-12 pt-8 border-t border-[#E7DCC4] dark:border-[#2a3d4d]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">Market Reviews</h2>
        {user && !formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="font-mono text-xs font-bold text-[#F5A300] hover:text-[#D88900] transition-colors uppercase tracking-wider"
          >
            Write a Review
          </button>
        )}
        {!user && (
          <a
            href="/login"
            className="font-mono text-xs font-bold text-[#F5A300] hover:text-[#D88900] transition-colors uppercase tracking-wider"
          >
            Sign in to review
          </a>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 bg-[#FBF6EC] dark:bg-[#0D1F2C] rounded-[3px] p-5 border-2 border-[#E7DCC4] dark:border-[#2a3d4d] space-y-4">
          <p className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider">Your Rating</p>
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
                      ? "fill-[#F5A300] text-[#F5A300]"
                      : "fill-[#E7DCC4] text-[#E7DCC4]"
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
            className="w-full px-4 py-3 rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] font-mono text-xs text-[#132A3A] dark:text-[#E7DCC4] focus:outline-none focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20 resize-none placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || text.length < 10}
              className="inline-flex items-center gap-2 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] px-5 py-2.5 rounded-[3px] font-mono text-xs font-extrabold uppercase tracking-wider border border-[#D88900] transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => { setFormOpen(false); setText(""); setRating(5); }}
              className="font-mono text-xs text-[#1C1A17]/60 dark:text-[#a0b4c4] hover:text-[#132A3A] dark:hover:text-[#E7DCC4] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#F5A300]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-10 h-10 text-[#E7DCC4] mx-auto mb-3" />
          <p className="text-[#1C1A17]/60 dark:text-[#a0b4c4] text-sm font-sans">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 flex-wrap font-mono text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-[2px] font-bold border border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] disabled:opacity-40 hover:bg-[#F5A300] transition-colors"
              >
                Previous
              </button>
              <span className="text-[#132A3A] dark:text-[#E7DCC4] font-bold">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-3 py-1.5 rounded-[2px] font-bold border border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] disabled:opacity-40 hover:bg-[#F5A300] transition-colors"
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
    <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-[2px] bg-[#132A3A] dark:bg-[#0A1A28] text-[#F5A300] font-mono font-bold flex items-center justify-center text-sm border border-[#E7DCC4] dark:border-[#2a3d4d] shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] truncate">{name}</p>
            <time className="font-mono text-[11px] text-[#1C1A17]/50 dark:text-[#a0b4c4] shrink-0">
              {formatDate(review.created_at)}
            </time>
          </div>
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.rating
                    ? "fill-[#F5A300] text-[#F5A300]"
                    : "fill-[#E7DCC4] text-[#E7DCC4]"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[#1C1A17]/80 dark:text-[#a0b4c4] leading-relaxed font-sans">
            {review.text}
          </p>
        </div>
      </div>
    </div>
  );
}
