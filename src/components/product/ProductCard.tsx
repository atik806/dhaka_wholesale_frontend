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
      <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all duration-200 hover:border-line-strong hover:shadow-md">
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
                "object-cover transition-transform duration-500 group-hover:scale-105",
                isOutOfStock && "opacity-60",
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              onError={() => setImgSrc("/placeholder.svg")}
            />
          </Link>

          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
            {discountPercent ? (
              <Badge variant="sale">-{discountPercent}%</Badge>
            ) : product.isNew ? (
              <Badge variant="new">New</Badge>
            ) : null}
            {isOutOfStock && <Badge variant="out-of-stock">Out of stock</Badge>}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={wishlisted}
            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface/90 text-muted shadow-xs backdrop-blur-sm transition-colors hover:border-line-strong hover:text-fg"
          >
            <Heart
              className={cn("h-4 w-4 transition-colors", wishlisted && "fill-sale text-sale")}
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <p className="label-caps mb-1 truncate text-subtle">{product.category}</p>

          <h3 className="text-[13px] font-semibold leading-snug sm:text-sm">
            <Link
              href={`/product/${product.slug}`}
              className="line-clamp-2 text-fg transition-colors hover:text-accent-hover"
            >
              {product.name}
            </Link>
          </h3>

          <div className="mt-1.5">
            <Rating value={product.rating} count={product.reviewCount} size="sm" />
          </div>

          <div className="mt-auto pt-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="tabular text-[15px] font-bold text-price sm:text-base">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="tabular text-xs text-muted line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.stock === "low-stock" && (
              <p className="mt-1 text-[11px] font-semibold text-danger">Only a few left</p>
            )}
          </div>

          <Button
            variant={isOutOfStock ? "outline" : showAdded ? "secondary" : "primary"}
            size="md"
            fullWidth
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-live="polite"
            className="mt-2.5"
          >
            {isOutOfStock ? (
              "Sold out"
            ) : showAdded ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Added to cart
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Add to cart
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
});
