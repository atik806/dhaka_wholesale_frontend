"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, BookOpen } from "lucide-react";
import type { Product } from "@/src/types/product";
import { useCartStore } from "@/src/store/useCartStore";
import { ProductCard } from "@/src/components/product/ProductCard";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProductCardSkeleton } from "@/src/components/ui/Skeleton";
import { fetchProducts } from "@/src/lib/api";

export default function WishlistPage() {
  const wishlistIds = useCartStore((s) => s.wishlistIds);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      return;
    }
    let active = true;
    const controller = new AbortController();
    fetchProducts({ limit: 100, ids: wishlistIds }, controller.signal)
      .then((result) => {
        if (active) {
          setWishlistProducts(result.products.filter((p) => wishlistIds.includes(p.id)));
          setLoading(false);
        }
      })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [wishlistIds]);

  if (wishlistIds.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-[#FBF6EC]"
      >
        <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] py-10 md:py-14">
          <div className="container">
            <Breadcrumbs items={[{ label: "Wishlist" }]} />
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <BookOpen className="w-3.5 h-3.5" /> WISHLIST
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold">
              My Wishlist
            </h1>
          </div>
        </div>
        <div className="container">
          <EmptyState
            icon={<Heart className="w-10 h-10 text-[#BE3D1F]" />}
            title="Your wishlist is empty"
            description="Save items you love by tapping the heart icon on any product."
            actionLabel="Explore Products"
            actionHref="/shop"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC]"
    >
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] py-10 md:py-14">
        <div className="container">
          <Breadcrumbs items={[{ label: "Wishlist" }]} />
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
            <BookOpen className="w-3.5 h-3.5" /> WISHLIST
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold">
            My Wishlist ({loading ? "..." : wishlistProducts.length})
          </h1>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: Math.min(wishlistIds.length, 8) }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : wishlistProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>
      </div>
    </motion.div>
  );
}
