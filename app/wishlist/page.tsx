"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import products from "@/src/data/products.json";
import type { Product } from "@/src/types/product";
import { useCartStore } from "@/src/store/useCartStore";
import { ProductCard } from "@/src/components/product/ProductCard";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";

export default function WishlistPage() {
  const { wishlistIds } = useCartStore();
  const wishlistProducts = (products as Product[]).filter((p) =>
    wishlistIds.includes(p.id)
  );

  if (wishlistProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container"
      >
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
        <EmptyState
          icon={<Heart className="w-10 h-10 text-primary dark:text-primary-light" />}
          title="Your wishlist is empty"
          description="Save items you love by tapping the heart icon on any product."
          actionLabel="Explore Products"
          actionHref="/shop"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        My Wishlist ({wishlistProducts.length})
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlistProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
