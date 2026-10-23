"use client";

import { motion } from "framer-motion";
import { ChevronRight, Star } from "lucide-react";
import Image from "@/src/components/ui/Image";
import Link from "next/link";
import { Card } from "@/src/components/ui/Card";
import { Section, SectionHeader } from "@/src/components/ui/Section";
import { useRecentReviews } from "@/src/hooks/useApi";
import type { RecentReview } from "@/src/lib/api";
import { isSampleReview, reviewBody } from "@/src/lib/reviews";
import { IMAGE_BLUR_PLACEHOLDER, safeImage } from "@/src/lib/utils";

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
    <div className="flex gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(value)
              ? "fill-accent text-accent"
              : "fill-surface-3 text-surface-3"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: RecentReview }) {
  const name = review.profiles?.name ?? "Customer";
  const sample = isSampleReview(review);

  return (
    <Card padded className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <ReviewStars value={review.rating} />
        {sample && (
          <span className="shrink-0 rounded-full border border-line-strong bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
            Sample review
          </span>
        )}
      </div>

      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-fg line-clamp-5">
        {reviewBody(review.text)}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-fg">
          {name[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-fg">{name}</p>
          <p className="tabular text-[12px] text-subtle">{formatDate(review.created_at)}</p>
        </div>
      </div>

      {review.products && (
        <Link
          href={`/product/${review.products.slug}`}
          className="group mt-4 flex items-center gap-3 rounded-lg border border-line bg-surface-2 p-2 pr-3 transition-colors hover:border-accent"
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-surface">
            <Image
              src={safeImage(review.products.images)}
              alt=""
              fill
              sizes="44px"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_PLACEHOLDER}
              className="object-cover"
            />
          </span>
          <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-fg line-clamp-2">
            {review.products.name}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent-hover" />
        </Link>
      )}
    </Card>
  );
}

interface CustomerReviewsProps {
  /** Server-rendered data so the section paints instantly; SWR revalidates in the background. */
  fallbackData?: RecentReview[];
}

export function CustomerReviews({ fallbackData }: CustomerReviewsProps) {
  const { data: reviews = [] } = useRecentReviews(fallbackData);

  if (reviews.length === 0) return null;

  const shown = reviews.slice(0, 6);
  const hasSamples = shown.some(isSampleReview);

  return (
    <Section>
      <SectionHeader
        eyebrow="Customer reviews"
        title="What customers say"
        description={
          hasSamples
            ? "Sample reviews are marked and shown until more verified buyers share theirs."
            : "Real feedback from shoppers across Bangladesh."
        }
      />

      {/* Phones swipe through the cards; larger screens get a grid. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {shown.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="w-[85%] shrink-0 snap-start sm:w-auto"
          >
            <ReviewCard review={review} />
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
