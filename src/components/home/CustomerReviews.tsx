"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/src/lib/constants";
import { Card } from "@/src/components/ui/Card";
import { Rating } from "@/src/components/ui/Rating";
import { Section, SectionHeader } from "@/src/components/ui/Section";
import { formatDate } from "@/src/lib/utils";

interface Review {
  id: string;
  rating: number;
  text: string;
  created_at: string;
  product_id: string;
  profiles: { name: string; avatar_url: string | null } | null;
  products: { name: string; slug: string; images: string[] } | null;
}

export function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/reviews/recent`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => setReviews(json.data ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <Section>
      <SectionHeader
        eyebrow="Customer reviews"
        title="What customers say"
        description="Real feedback from customers across Bangladesh."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {reviews.map((review) => (
          <Card key={review.id} padded className="relative flex flex-col">
            <Quote
              className="absolute top-5 right-5 w-6 h-6 text-surface-3"
              aria-hidden="true"
            />

            <div className="flex items-center gap-2 mb-3 pr-8">
              <Rating value={review.rating} />
              <span className="text-xs text-subtle tabular">
                {formatDate(review.created_at)}
              </span>
            </div>

            <p className="text-sm text-fg leading-relaxed line-clamp-4 mb-5">
              &ldquo;{review.text}&rdquo;
            </p>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-line">
              <div className="w-9 h-9 rounded-full bg-brand text-brand-fg font-bold text-sm flex items-center justify-center shrink-0">
                {review.profiles?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-fg truncate">
                  {review.profiles?.name ?? "Customer"}
                </p>
                {review.products && (
                  <Link
                    href={`/product/${review.products.slug}`}
                    className="text-xs text-brand hover:text-accent-hover transition-colors truncate block"
                  >
                    {review.products.name}
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
