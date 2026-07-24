"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingBag, Minus, Plus, Share2, ShieldCheck, Truck, RefreshCw, Check } from "lucide-react";
import { ProductGallery } from "@/src/components/product/ProductGallery";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { ReviewSection } from "@/src/components/product/ReviewSection";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Badge } from "@/src/components/ui/Badge";
import { Rating } from "@/src/components/ui/Rating";
import { ProductDetailSkeleton } from "@/src/components/ui/Skeleton";
import { formatPrice, slugify } from "@/src/lib/utils";
import { useCartStore } from "@/src/store/useCartStore";
import { useToast } from "@/src/providers/ToastProvider";
import { useProduct, useRelatedProducts, useCategories } from "@/src/hooks/useApi";

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
      <div className="container py-20 text-center bg-[#FBF6EC] dark:bg-[#0D1F2C]">
        <h1 className="font-serif text-2xl font-bold text-[#132A3A] dark:text-[#E7DCC4]">Product Not Found</h1>
        <p className="font-mono text-xs text-[#1C1A17]/60 mt-2">The requested product could not be found.</p>
        <Link href="/shop" className="mt-4 inline-block font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] bg-[#F5A300] px-4 py-2 rounded-[3px] border border-[#D88900]">
          RETURN TO MARKET SHOP &rarr;
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock === "out-of-stock";
  const inCart = items.some((i) => i.product.id === product.id);
  const showAdded = justAdded || inCart;

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

  const badge = product.isNew
    ? { variant: "new" as const, label: "NEW" }
    : product.originalPrice
    ? { variant: "sale" as const, label: `-${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF` }
    : product.stock === "out-of-stock"
    ? { variant: "out-of-stock" as const, label: "SOLD OUT" }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-6 md:py-10 bg-[#FBF6EC] dark:bg-[#0D1F2C]"
    >
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          { label: product.category, href: `/shop/${liveCategories.find((c) => c.name === product.category)?.slug ?? slugify(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4]/70 uppercase tracking-widest block mb-1">
                {product.category} • SKU #{product.id.slice(0, 6)}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4] leading-tight">
                {product.name}
              </h1>
            </div>
            {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          </div>

          <Rating value={product.rating} count={product.reviewCount} size="md" />

          <div className="flex items-baseline gap-3 mt-4 p-3 bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d] rounded-[2px]">
            <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#1F6F50]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-sm text-[#1C1A17]/50 dark:text-[#a0b4c4] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && (
              <span className="font-mono text-xs font-bold text-[#BE3D1F] bg-[#BE3D1F]/10 px-2 py-0.5 rounded-[2px] border border-[#BE3D1F]/20">
                SAVE {formatPrice(product.originalPrice - product.price)} / UNIT
              </span>
            )}
          </div>

          <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4] text-xs sm:text-sm leading-relaxed mt-5 font-sans">
            {product.description}
          </p>

          {/* Sizes Variant */}
          {product.variants?.sizes && (
            <div className="mt-6">
              <p className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-2">Available Sizes</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-[2px] font-mono text-xs font-bold border transition-all ${
                      selectedSize === size
                        ? "border-[#F5A300] bg-[#132A3A] text-[#F5A300]"
                        : "border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] text-[#132A3A] dark:text-[#E7DCC4] hover:border-[#F5A300]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors Variant */}
          {product.variants?.colors && (
            <div className="mt-5">
              <p className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-2">Available Colors</p>
              <div className="flex gap-2">
                {product.variants.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name
                        ? "border-[#F5A300] ring-2 ring-[#F5A300]/40 scale-110"
                        : "border-[#E7DCC4] dark:border-[#2a3d4d] hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-5">
            <p className="font-mono text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-2">Order Quantity (Units)</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-[#E7DCC4] dark:border-[#2a3d4d] rounded-[2px] bg-[#FBF6EC] dark:bg-[#0D1F2C]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300] transition-colors disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-mono font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4]">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(q + 1, 100))}
                  disabled={isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300] transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="font-mono text-xs text-[#1F6F50] font-bold">
                Total: {formatPrice(product.price * (isOutOfStock ? 0 : quantity))}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-7">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              aria-live="polite"
              className={`flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-xl font-extrabold text-sm uppercase tracking-wide border shadow-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${
                isOutOfStock
                  ? "bg-[#E7DCC4] text-[#1C1A17]/50 border-[#E7DCC4]"
                  : showAdded
                  ? "bg-[#1F6F50] hover:bg-[#185a41] text-white border-[#185a41]"
                  : "bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] border-[#D88900]"
              }`}
            >
              {isOutOfStock ? (
                "SOLD OUT"
              ) : showAdded ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  ADDED TO CART
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  ADD TO CART
                </>
              )}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-12 h-12 shrink-0 rounded-[2px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] flex items-center justify-center hover:border-[#F5A300] hover:bg-[#FBF6EC] dark:bg-[#0D1F2C] transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlisted ? "fill-[#BE3D1F] text-[#BE3D1F]" : "text-[#132A3A] dark:text-[#E7DCC4]"
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="w-12 h-12 shrink-0 rounded-[2px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] bg-white dark:bg-[#132A3A] flex items-center justify-center hover:border-[#F5A300] hover:bg-[#FBF6EC] dark:bg-[#0D1F2C] transition-colors"
              aria-label="Share item"
            >
              <Share2 className="w-5 h-5 text-[#132A3A] dark:text-[#E7DCC4]" />
            </button>
          </div>

          {/* Market Trust Badges */}
          <div className="mt-6 pt-5 border-t border-[#E7DCC4] dark:border-[#2a3d4d] grid grid-cols-3 gap-2 font-mono text-[10px] text-[#132A3A] dark:text-[#E7DCC4]">
            <div className="flex items-center gap-1.5 bg-[#FBF6EC] dark:bg-[#0D1F2C] p-2 rounded-[2px] border border-[#E7DCC4] dark:border-[#2a3d4d]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5A300]" />
              <span>COD GUARANTEE</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FBF6EC] dark:bg-[#0D1F2C] p-2 rounded-[2px] border border-[#E7DCC4] dark:border-[#2a3d4d]">
              <Truck className="w-3.5 h-3.5 text-[#1F6F50]" />
              <span>24-48H SHIPPING</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FBF6EC] dark:bg-[#0D1F2C] p-2 rounded-[2px] border border-[#E7DCC4] dark:border-[#2a3d4d]">
              <RefreshCw className="w-3.5 h-3.5 text-[#BE3D1F]" />
              <span>7-DAY EXCHANGES</span>
            </div>
          </div>
        </div>
      </div>

      <ReviewSection productId={product.id} />

      {(related || []).length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold text-[#132A3A] dark:text-[#E7DCC4] mb-6">
            Related Market Stock
          </h2>
          <ProductGrid products={related || []} />
        </section>
      )}
    </motion.div>
  );
}
