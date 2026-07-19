"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
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
          <span className="text-xs font-semibold uppercase tracking-widest text-[#f0a11a] mb-2 block">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative bg-white dark:bg-zinc-800/80 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[#0b2c5f]/10 dark:text-primary-light/10" />
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${
                      j < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 dark:fill-zinc-600 text-zinc-200 dark:text-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5 line-clamp-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-700/50">
                <div className="w-10 h-10 rounded-full bg-[#0b2c5f]/10 dark:bg-primary/20 flex items-center justify-center text-sm font-bold text-[#0b2c5f] dark:text-primary-light shrink-0">
                  {review.profiles?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {review.profiles?.name ?? "Anonymous"}
                  </p>
                  {review.products && (
                    <Link
                      href={`/product/${review.products.slug}`}
                      className="text-xs text-zinc-400 hover:text-[#0b2c5f] dark:hover:text-primary-light transition-colors truncate block"
                    >
                      {review.products.name}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
