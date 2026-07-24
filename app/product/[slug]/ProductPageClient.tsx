"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Truck,
  RefreshCw,
  Check,
  PackageSearch,
} from "lucide-react";
import { ProductGallery } from "@/src/components/product/ProductGallery";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { ReviewSection } from "@/src/components/product/ReviewSection";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Rating } from "@/src/components/ui/Rating";
import { ProductDetailSkeleton } from "@/src/components/ui/Skeleton";
import { cn, formatPrice, slugify } from "@/src/lib/utils";
import { useCartStore } from "@/src/store/useCartStore";
import { useToast } from "@/src/providers/ToastProvider";
import { useProduct, useRelatedProducts, useCategories } from "@/src/hooks/useApi";

const STOCK_LABEL = {
  "in-stock": "In stock",
  "low-stock": "Low stock — order soon",
  "out-of-stock": "Out of stock",
} as const;

export function ProductPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem, toggleWishlist, isInWishlist, items } = useCartStore();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const { data: product, isLoading } = useProduct(slug);
  const { data: related } = useRelatedProducts(slug);
  const { data: liveCategories = [] } = useCategories();

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container py-10">
        <EmptyState
          icon={<PackageSearch className="h-7 w-7 text-subtle" />}
          title="Product not found"
          description="The product you're looking for doesn't exist or is no longer available."
          actionLabel="Back to shop"
          actionHref="/shop"
        />
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock === "out-of-stock";
  const inCart = items.some((i) => i.product.id === product.id);
  const showAdded = justAdded || inCart;
  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem({
      product,
      quantity,
      selectedSize,
      selectedColor,
    });
    setJustAdded(true);
    addToast(`${product.name} added to cart`, "success");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("Product link copied to clipboard", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-canvas"
    >
      <div className="container py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/shop/${liveCategories.find((c) => c.name === product.category)?.slug ?? slugify(product.category)}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Buy box */}
          <div className="lg:col-span-5">
            <Card padded className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="label-caps mb-1.5 text-subtle">{product.category}</p>
                  <h1 className="text-xl font-bold leading-tight text-fg sm:text-2xl">
                    {product.name}
                  </h1>
                </div>
                {discountPercent ? (
                  <Badge variant="sale" className="shrink-0">-{discountPercent}%</Badge>
                ) : product.isNew ? (
                  <Badge variant="new" className="shrink-0">New</Badge>
                ) : null}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Rating value={product.rating} count={product.reviewCount} size="md" />
                <span className="font-mono text-[11px] text-subtle">
                  SKU {product.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="mt-4 border-y border-line py-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular text-3xl font-bold text-price">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="tabular text-sm text-muted line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="tabular text-[13px] font-semibold text-sale">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-[13px] font-semibold",
                    isOutOfStock
                      ? "text-danger"
                      : product.stock === "low-stock"
                      ? "text-accent-hover"
                      : "text-success",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isOutOfStock
                        ? "bg-danger"
                        : product.stock === "low-stock"
                        ? "bg-accent"
                        : "bg-success",
                    )}
                  />
                  {STOCK_LABEL[product.stock]}
                </p>
              </div>

              {/* Sizes */}
              {product.variants?.sizes && (
                <div className="mt-4">
                  <p className="mb-2 text-[13px] font-semibold text-fg">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                        className={cn(
                          "min-w-11 rounded-md border px-3 py-2 text-[13px] font-semibold transition-colors",
                          selectedSize === size
                            ? "border-brand bg-brand text-brand-fg"
                            : "border-line-strong bg-surface text-fg hover:border-brand",
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.variants?.colors && (
                <div className="mt-4">
                  <p className="mb-2 text-[13px] font-semibold text-fg">
                    Colour
                    {selectedColor && (
                      <span className="ml-1.5 font-normal text-muted">{selectedColor}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        aria-label={color.name}
                        aria-pressed={selectedColor === color.name}
                        title={color.name}
                        className={cn(
                          "h-9 w-9 rounded-full border-2 transition-all",
                          selectedColor === color.name
                            ? "border-accent ring-2 ring-accent/40"
                            : "border-line-strong hover:border-brand",
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-4">
                <p className="mb-2 text-[13px] font-semibold text-fg">Quantity</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-md border border-line-strong bg-surface">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-11 w-11 items-center justify-center text-fg transition-colors hover:bg-surface-2 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span
                      aria-live="polite"
                      className="tabular w-12 border-x border-line text-center text-sm font-bold text-fg"
                    >
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(q + 1, 100))}
                      disabled={isOutOfStock}
                      aria-label="Increase quantity"
                      className="flex h-11 w-11 items-center justify-center text-fg transition-colors hover:bg-surface-2 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-[13px] text-muted">
                    Total{" "}
                    <span className="tabular font-bold text-price">
                      {formatPrice(product.price * (isOutOfStock ? 0 : quantity))}
                    </span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2.5">
                <Button
                  type="button"
                  size="lg"
                  variant={isOutOfStock ? "outline" : showAdded ? "secondary" : "primary"}
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  aria-live="polite"
                  className="min-h-12 flex-1"
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wishlisted}
                  className="h-12 w-12 shrink-0"
                >
                  <Heart className={cn("h-5 w-5", wishlisted && "fill-sale text-sale")} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  aria-label="Share this product"
                  className="h-12 w-12 shrink-0"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Reassurance */}
              <ul className="mt-5 space-y-2 border-t border-line pt-4 text-[13px] text-muted">
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                  <span>
                    <span className="font-semibold text-fg">Cash on delivery</span> available
                    nationwide
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 shrink-0 text-info" />
                  <span>
                    Delivered in <span className="font-semibold text-fg">24–48 hours</span> inside
                    Dhaka
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <RefreshCw className="h-4 w-4 shrink-0 text-subtle" />
                  <span>
                    <span className="font-semibold text-fg">7-day</span> exchange policy
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-8">
            <Card padded>
              <h2 className="text-lg font-bold text-fg">Product details</h2>
              <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-muted">
                {product.description}
              </p>
              {product.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </section>
        )}

        <ReviewSection productId={product.id} />

        {(related || []).length > 0 && (
          <section className="mt-10 border-t border-line pt-8">
            <h2 className="mb-5 text-xl font-bold text-fg sm:text-2xl">
              You may also like
            </h2>
            <ProductGrid products={related || []} />
          </section>
        )}
      </div>
    </motion.div>
  );
}
