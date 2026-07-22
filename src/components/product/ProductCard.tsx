"use client";

import { useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/src/types/product";
import { Rating } from "@/src/components/ui/Rating";
import { formatPrice, safeImage } from "@/src/lib/utils";
import { useCartStore } from "@/src/store/useCartStore";
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
  const [imgSrc, setImgSrc] = useState(safeImage(product.images));

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

  // Determine discount stamp percentage
  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <div className="group block bg-white dark:bg-[#132A3A] rounded-[3px] border border-[#E7DCC4] dark:border-[#2a3d4d] p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#F5A300] relative">
        <Link href={`/product/${product.slug}`} className="block">
          {/* Colored Image Block Container */}
          <div className="relative aspect-square rounded-[2px] overflow-hidden bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4]/80 dark:border-[#2a3d4d]/80 mb-3 group-hover:border-[#E7DCC4] dark:group-hover:border-[#2a3d4d] transition-colors">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgSrc("/placeholder.svg")}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

            {/* Rotated Brick-Red Discount Stamp Badge Top-Left */}
            {discountPercent ? (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-block bg-[#BE3D1F] text-white font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-[2px] border border-red-950 shadow-sm -rotate-6 tracking-wider uppercase">
                  -{discountPercent}% OFF
                </span>
              </div>
            ) : product.isNew ? (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-block bg-[#132A3A] text-[#F5A300] font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-[2px] border border-[#F5A300]/40 shadow-sm -rotate-3 uppercase">
                  NEW ARRIVAL
                </span>
              </div>
            ) : product.stock === "out-of-stock" ? (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-block bg-[#1C1A17] text-[#E7DCC4] font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] border border-zinc-700 shadow-sm uppercase">
                  OUT OF STOCK
                </span>
              </div>
            ) : null}

            {/* Circular Wishlist Heart Top-Right */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
              <button
                onClick={handleWishlist}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-[#132A3A]/90 border border-[#E7DCC4] dark:border-[#2a3d4d] flex items-center justify-center shadow-sm hover:bg-[#F5A300] hover:border-[#D88900] transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    wishlisted
                      ? "fill-[#BE3D1F] text-[#BE3D1F]"
                      : "text-[#132A3A] dark:text-[#E7DCC4]"
                  }`}
                />
              </button>
              <Link
                href={`/product/${product.slug}`}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-[#132A3A]/90 border border-[#E7DCC4] dark:border-[#2a3d4d] flex items-center justify-center shadow-sm hover:bg-[#132A3A] hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Quick view"
              >
                <Eye className="w-3.5 h-3.5 text-[#132A3A] dark:text-[#E7DCC4] hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="px-0.5">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-mono text-[10px] text-[#132A3A]/70 dark:text-[#a0b4c4] uppercase tracking-widest font-bold truncate">
                {product.category}
              </span>
              <Rating value={product.rating} count={product.reviewCount} size="sm" />
            </div>

            <h3 className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] leading-snug line-clamp-1 group-hover:text-[#F5A300] transition-colors">
              {product.name}
            </h3>

            {/* Price in Market Green with Strikethrough Original Price */}
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="font-mono font-bold text-base text-[#1F6F50]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-xs text-[#1C1A17]/50 dark:text-[#a0b4c4] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

          </div>
        </Link>

        {/* Add to Cart Button */}
        <div className="mt-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === "out-of-stock"}
            className="w-full flex items-center justify-center gap-1.5 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] font-extrabold text-xs py-2 rounded-[3px] border border-[#D88900] shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock === "out-of-stock" ? "SOLD OUT" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </motion.div>
  );
});
