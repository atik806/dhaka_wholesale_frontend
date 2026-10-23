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
import { cn, formatPrice, safeImage, IMAGE_BLUR_PLACEHOLDER } from "@/src/lib/utils";
import { useCartStore } from "@/src/store/useCartStore";
import { useToast } from "@/src/providers/ToastProvider";

/** Photo thumbnails shown on the card cover. */
const THUMBS = 4;
/** Cards in the first rows load their photo right away instead of lazily. */
const EAGER_CARDS = 4;

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
  const images = (product.images ?? []).filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  // Thumbnails wait for the main photo, so a grid's main photos don't queue
  // behind three or four thumbnails each.
  const [mainLoaded, setMainLoaded] = useState(false);
  const eager = index < EAGER_CARDS;
  const imgSrc = failed[activeImage]
    ? "/placeholder.svg"
    : images[activeImage] || safeImage(product.images);
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
      // Short, capped stagger: long delays left loaded photos invisible.
      transition={{ duration: 0.25, delay: Math.min(index, 3) * 0.03 }}
      className="h-full"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:border-line-strong hover:shadow-lg hover:-translate-y-0.5">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          <Link
            href={`/product/${product.slug}`}
            className="relative block h-full w-full"
            tabIndex={-1}
            aria-hidden="true"
          >
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_PLACEHOLDER}
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-110",
                isOutOfStock && "opacity-60",
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              onLoad={() => setMainLoaded(true)}
              onError={() => {
                setFailed((f) => ({ ...f, [activeImage]: true }));
                setMainLoaded(true);
              }}
            />
          </Link>

          {/* Up to 4 photos on the cover: tap (or hover) a thumbnail to swap the main
              photo. When there are more, the last tile shows "+N" and opens the product. */}
          {images.length > 1 && mainLoaded && (
            <div className="absolute bottom-2 left-2 z-10 flex gap-1">
              {images.slice(0, THUMBS).map((img, i) => {
                const extra = images.length - THUMBS;
                const isMore = i === THUMBS - 1 && extra > 0;
                const tileClass = cn(
                  "relative h-8 w-8 overflow-hidden rounded-md border-2 bg-surface-2 shadow-sm transition-all sm:h-9 sm:w-9",
                  i === activeImage && !isMore
                    ? "border-accent"
                    : "border-surface/90 hover:border-accent/70",
                );
                const thumb = (
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="36px"
                    loading="lazy"
                    className="object-cover"
                  />
                );
                return isMore ? (
                  <Link
                    key={i}
                    href={`/product/${product.slug}`}
                    aria-label={`See all ${images.length} photos of ${product.name}`}
                    className={tileClass}
                  >
                    {thumb}
                    <span className="tabular absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-bold text-white">
                      +{extra + 1}
                    </span>
                  </Link>
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImage(i);
                    }}
                    onMouseEnter={() => setActiveImage(i)}
                    aria-label={`Show photo ${i + 1} of ${images.length}`}
                    aria-pressed={i === activeImage}
                    className={tileClass}
                  >
                    {thumb}
                  </button>
                );
              })}
            </div>
          )}

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

          {/* Price section */}
          <div className="mt-auto pt-2.5">
            {/* The rating keeps its place beside the price; on narrow cards the old price wraps below. */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="tabular text-[16px] font-bold text-price sm:text-[17px] tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="tabular text-xs text-muted line-through decoration-2">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <Rating value={product.rating} count={product.reviewCount} className="mt-[3px] shrink-0" />
            </div>
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
