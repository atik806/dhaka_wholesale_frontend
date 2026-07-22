"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Award } from "lucide-react";
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
    <section className="py-14 md:py-20 bg-[#FBF6EC] dark:bg-[#0D1F2C]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#132A3A] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-2 -rotate-1">
            <Award className="w-3.5 h-3.5" /> VERIFIED MARKET FEEDBACK
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">            Customer Reviews
          </h2>
          <p className="text-xs sm:text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] mt-1 font-sans">
            Real feedback from customers across Bangladesh.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="relative bg-white dark:bg-[#132A3A] rounded-[3px] p-6 border-2 border-[#E7DCC4] dark:border-[#2a3d4d] shadow-sm hover:border-[#F5A300] transition-all duration-200"
            >
              <Quote className="absolute top-4 right-4 w-7 h-7 text-[#132A3A]/10 dark:text-[#E7DCC4]/10" />
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${
                      j < review.rating
                        ? "fill-[#F5A300] text-[#F5A300]"
                        : "fill-[#E7DCC4] text-[#E7DCC4] dark:fill-[#2a3d4d] dark:text-[#2a3d4d]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#1C1A17] dark:text-[#E7DCC4] leading-relaxed mb-5 line-clamp-4 font-sans">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#E7DCC4] dark:border-[#2a3d4d]">
                <div className="w-10 h-10 rounded-[2px] bg-[#132A3A] dark:bg-[#0A1A28] text-[#F5A300] font-mono font-bold flex items-center justify-center text-sm border border-[#E7DCC4] dark:border-[#2a3d4d] shrink-0">
                  {review.profiles?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] truncate">                    {review.profiles?.name ?? "Verified Merchant"}
                  </p>
                  {review.products && (
                    <Link
                      href={`/product/${review.products.slug}`}
                      className="font-mono text-[11px] text-[#1F6F50] hover:underline truncate block"
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
