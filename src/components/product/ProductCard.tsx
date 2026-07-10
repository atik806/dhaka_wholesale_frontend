"use client";

import { useRef, memo } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/src/types/product";
import { Badge } from "@/src/components/ui/Badge";
import { Rating } from "@/src/components/ui/Rating";
import { formatPrice, safeImage } from "@/src/lib/utils";
import { useCartStore } from "@/src/store/useCartStore";
import { TiltCard } from "@/src/components/three/TiltCard";
import { useToast } from "@/src/providers/ToastProvider";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = memo(function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const { addToast } = useToast();
  const wishlisted = useCartStore((s) => s.wishlistIds.includes(product.id));
  const cardRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product,
      quantity: 1,
      selectedSize: product.variants?.sizes?.[0],
      selectedColor: product.variants?.colors?.[0]?.name,
    });
    addToast(`${product.name} added to cart`, "success");
    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(
      wishlisted ? "Removed from wishlist" : `${product.name} added to wishlist`,
      "success"
    );
  };

  const badge = product.isNew
    ? { variant: "new" as const, label: "New" }
    : product.originalPrice
    ? { variant: "sale" as const, label: `-${Math.round((1 - product.price / product.originalPrice) * 100)}%` }
    : product.stock === "out-of-stock"
    ? { variant: "out-of-stock" as const, label: "Sold Out" }
    : product.stock === "low-stock"
    ? { variant: "low-stock" as const, label: "Low Stock" }
    : null;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <TiltCard tiltDegree={6} scale={1.01} glare={false}>
        <Link href={`/product/${product.slug}`} className="group block">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 mb-3">
            <Image
              src={safeImage(product.images)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

            {badge && (
              <div className="absolute top-3 left-3">
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
            )}

            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-sm hover:bg-white dark:bg-zinc-800"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  wishlisted ? "fill-red-500 dark:fill-red-400 text-red-500 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
                }`}
              />
            </button>

            <motion.div
              initial={false}
              className="absolute bottom-0 left-0 right-0 p-3 translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300"
            >
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </motion.div>
          </div>

          <div className="px-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="font-medium text-sm leading-tight mb-1.5 line-clamp-1 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
              {product.name}
            </h3>
            <Rating value={product.rating} count={product.reviewCount} size="sm" />
            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold text-sm">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
});
