"use client";

import { useRef, useState, memo, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/src/types/product";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Rating } from "@/src/components/ui/Rating";
import { cn, formatPrice, safeImage } from "@/src/lib/utils";
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
  const inCart = useCartStore((s) => s.items.some((i) => i.product.id === product.id));
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(safeImage(product.images));
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const showAdded = justAdded || inCart;
  const isOutOfStock = product.stock === "out-of-stock";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === "out-of-stock") return;
    addItem({
      product,
      quantity: 1,
      selectedSize: product.variants?.sizes?.[0],
      selectedColor: product.variants?.colors?.[0]?.name,
    });
    setJustAdded(true);
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
      className="h-full"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:border-line-strong hover:shadow-lg hover:-translate-y-0.5">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          <Link
            href={`/product/${product.slug}`}
            className="block h-full w-full"
            tabIndex={-1}
            aria-hidden="true"
          >
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-110",
                isOutOfStock && "opacity-60",
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              onError={() => setImgSrc("/placeholder.svg")}
            />
          </Link>

          {/* Hover overlay — subtle dark gradient on hover */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badges */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
            {discountPercent ? (
              <Badge variant="sale">-{discountPercent}%</Badge>
            ) : product.isNew ? (
              <Badge variant="new">New</Badge>
            ) : null}
            {isOutOfStock && <Badge variant="out-of-stock">Out of stock</Badge>}
          </div>

          {/* Wishlist button */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={wishlisted}
            className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface/80 text-muted shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-line-strong hover:bg-surface hover:text-fg hover:shadow-md active:scale-90"
          >
            <Heart
              className={cn("h-[18px] w-[18px] transition-all duration-200", wishlisted && "fill-sale text-sale scale-110")}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-3 sm:p-3.5">
          {/* Category label */}
          <p className="label-caps mb-1.5 truncate text-subtle tracking-wider">
            {product.category}
          </p>

          {/* Product name */}
          <h3 className="text-[13px] font-semibold leading-snug sm:text-sm">
            <Link
              href={`/product/${product.slug}`}
              className="line-clamp-2 text-fg transition-colors hover:text-accent-hover"
            >
              {product.name}
            </Link>
          </h3>

          {/* Rating */}
          <div className="mt-1.5">
            <Rating value={product.rating} count={product.reviewCount} size="sm" />
          </div>

          {/* Price section */}
          <div className="mt-auto pt-2.5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="tabular text-[16px] font-bold text-price sm:text-[17px] tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="tabular text-xs text-muted line-through decoration-2">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.stock === "low-stock" && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <p className="text-[11px] font-semibold text-accent-hover">Only a few left</p>
              </div>
            )}
          </div>

          {/* Add to cart button */}
          <div className="mt-3">
            <Button
              variant={isOutOfStock ? "outline" : showAdded ? "secondary" : "primary"}
              size="sm"
              fullWidth
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-live="polite"
              className="transition-all duration-200"
            >
              {isOutOfStock ? (
                "Sold out"
              ) : showAdded ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to cart</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
