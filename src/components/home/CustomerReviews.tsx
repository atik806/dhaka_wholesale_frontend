"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Link from "next/link";
import { Card } from "@/src/components/ui/Card";
import { Section, SectionHeader } from "@/src/components/ui/Section";
import { useRecentReviews } from "@/src/hooks/useApi";
import type { RecentReview } from "@/src/lib/api";

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function ReviewStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(value)
              ? "fill-accent text-accent"
              : "fill-surface-3 text-surface-3"
          }`}
        />
      ))}
    </div>
  );
}

interface CustomerReviewsProps {
  /** Server-rendered data so the section paints instantly; SWR revalidates in the background. */
  fallbackData?: RecentReview[];
}

export function CustomerReviews({ fallbackData }: CustomerReviewsProps) {
  const { data: reviews = [] } = useRecentReviews(fallbackData);

  if (reviews.length === 0) return null;

  return (
    <Section>
      <SectionHeader
        eyebrow="Customer reviews"
        title="What customers say"
        description="Real feedback from customers across Bangladesh."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {reviews.slice(0, 6).map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <Card padded className="relative flex h-full flex-col">
              {/* Decorative quote mark */}
              <Quote
                className="absolute top-4 right-4 w-7 h-7 text-surface-3/70"
                aria-hidden="true"
                strokeWidth={1}
              />

              {/* Rating + date */}
              <div className="flex items-center justify-between gap-3 mb-3.5 pr-6">
                <ReviewStars value={review.rating} />
                <span className="text-[11px] text-subtle tabular shrink-0">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {/* Review text */}
              <div className="flex-1">
                <p className="text-sm text-fg leading-relaxed line-clamp-4 italic">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-line">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-hover text-brand-fg font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {review.profiles?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-fg truncate">
                    {review.profiles?.name ?? "Customer"}
                  </p>
                  {review.products && (
                    <Link
                      href={`/product/${review.products.slug}`}
                      className="text-[12px] text-link hover:text-link-hover transition-colors truncate block"
                    >
                      {review.products.name}
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
