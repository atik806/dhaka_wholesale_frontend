"use client";

import { useState } from "react";
import { Star, Loader2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useProductReviews } from "@/src/hooks/useApi";
import { submitReview, type Review } from "@/src/lib/api";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useToast } from "@/src/providers/ToastProvider";
import { Button, buttonClasses } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Textarea } from "@/src/components/ui/Field";
import { cn, formatDate } from "@/src/lib/utils";

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
    <section className="mt-10 border-t border-line pt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-fg sm:text-2xl">Customer reviews</h2>
        {user && !formOpen && (
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            Write a review
          </Button>
        )}
        {!user && (
          <Link href="/login" className={buttonClasses({ variant: "outline", size: "sm" })}>
            Sign in to review
          </Link>
        )}
      </div>

      {formOpen && (
        <Card padded className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-2 text-[13px] font-semibold text-fg">Your rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} out of 5`}
                    aria-pressed={rating === star}
                    className="rounded-sm p-0.5"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        star <= (hoveredStar || rating)
                          ? "fill-accent text-accent"
                          : "fill-surface-3 text-surface-3",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Your review"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              minLength={10}
              maxLength={1000}
              required
              hint="Minimum 10 characters."
              placeholder="Share your experience with this product…"
            />

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting || text.length < 10} loading={submitting}>
                {submitting ? "Submitting…" : "Submit review"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormOpen(false);
                  setText("");
                  setRating(5);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 border border-line">
            <MessageSquare className="h-5 w-5 text-subtle" />
          </div>
          <p className="text-sm font-semibold text-fg">No reviews yet</p>
          <p className="mt-1 text-sm text-muted">Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: Review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="tabular text-[13px] text-muted">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
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
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-fg">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-fg">{name}</p>
            <time className="tabular shrink-0 text-xs text-subtle">
              {formatDate(review.created_at)}
            </time>
          </div>
          <div className="mb-2 flex" role="img" aria-label={`Rated ${review.rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-3.5 w-3.5",
                  star <= review.rating
                    ? "fill-accent text-accent"
                    : "fill-surface-3 text-surface-3",
                )}
              />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted">{review.text}</p>
        </div>
      </div>
    </Card>
  );
}
