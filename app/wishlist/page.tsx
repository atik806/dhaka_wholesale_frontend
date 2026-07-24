"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/src/types/product";
import { useCartStore } from "@/src/store/useCartStore";
import { ProductCard } from "@/src/components/product/ProductCard";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Card } from "@/src/components/ui/Card";
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
        className="bg-canvas min-h-[70vh]"
      >
        <div className="container py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Wishlist" }]} />
          <h1 className="text-2xl sm:text-3xl font-bold mb-5">My wishlist</h1>
          <Card>
            <EmptyState
              icon={<Heart className="w-7 h-7 text-subtle" />}
              title="Your wishlist is empty"
              description="Tap the heart icon on any product to save it here and come back to it later."
              actionLabel="Explore products"
              actionHref="/shop"
            />
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas min-h-screen"
    >
      <div className="container py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />

        <div className="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">My wishlist</h1>
            <p className="text-[13px] text-muted mt-1">
              {loading ? (
                "Loading your saved items…"
              ) : (
                <>
                  <span className="tabular">{wishlistProducts.length}</span>{" "}
                  {wishlistProducts.length === 1 ? "item" : "items"} saved
                </>
              )}
            </p>
          </div>
          <Link
            href="/shop"
            className="text-[13px] font-semibold text-link hover:text-link-hover underline underline-offset-4 shrink-0"
          >
            Continue shopping
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: Math.min(wishlistIds.length, 8) }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : wishlistProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>

        {!loading && wishlistProducts.length === 0 && (
          <Card className="mt-2">
            <EmptyState
              icon={<Heart className="w-7 h-7 text-subtle" />}
              title="Saved items are unavailable"
              description="The products on your wishlist could not be loaded right now. They may have been removed from the catalog."
              actionLabel="Explore products"
              actionHref="/shop"
            />
          </Card>
        )}
      </div>
    </motion.div>
  );
}
