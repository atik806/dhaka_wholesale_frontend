"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/src/lib/constants";

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
    fetch(`${API_BASE}/reviews/recent`)
      .then((res) => res.json())
      .then((json) => setReviews(json.data ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-primary-light mb-2 block">
            Customer Reviews
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            What People Are Saying
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-zinc-800/80 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-3.5 h-3.5 ${
                      j < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-bold text-primary dark:text-primary-light">
                    {review.profiles?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{review.profiles?.name ?? "Anonymous"}</p>
                    {review.products && (
                      <Link
                        href={`/product/${review.products.slug}`}
                        className="text-[11px] text-zinc-400 hover:text-primary transition-colors"
                      >
                        {review.products.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
