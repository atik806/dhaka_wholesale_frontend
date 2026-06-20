"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Heart, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import products from "@/src/data/products.json";
import type { Product } from "@/src/types/product";
import { ProductGallery } from "@/src/components/product/ProductGallery";
import { ProductGrid } from "@/src/components/product/ProductGrid";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Badge } from "@/src/components/ui/Badge";
import { Rating } from "@/src/components/ui/Rating";
import { Button } from "@/src/components/ui/Button";
import { formatPrice } from "@/src/lib/utils";
import { useCartStore } from "@/src/store/useCartStore";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem, toggleWishlist, isInWishlist } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();

  const product = (products as Product[]).find((p) => p.id === params.id);

  const related = useMemo(() => {
    if (!product) return [];
    return (products as Product[])
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const handleAdd = () => {
    addItem({
      product,
      quantity,
      selectedSize,
      selectedColor,
    });
    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  const badge = product.isNew
    ? { variant: "new" as const, label: "New Arrival" }
    : product.originalPrice
    ? { variant: "sale" as const, label: "Sale" }
    : product.stock === "out-of-stock"
    ? { variant: "out-of-stock" as const, label: "Sold Out" }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          { label: product.category, href: `/shop/${product.category.toLowerCase().replace(/\s+/g, "-")}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
                {product.name}
              </h1>
            </div>
            {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          </div>

          <Rating value={product.rating} count={product.reviewCount} size="md" />

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-zinc-500 dark:text-zinc-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mt-6">
            {product.description}
          </p>

          {product.variants?.sizes && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      selectedSize === size
                        ? "border-primary bg-primary-50 dark:bg-primary-50/20 text-primary dark:text-primary-light"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants?.colors && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Color</p>
              <div className="flex gap-2">
                {product.variants.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor === color.name
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <Button size="lg" className="flex-1" onClick={handleAdd}>
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </Button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlisted ? "fill-red-500 dark:fill-red-400 text-red-500 dark:text-red-400" : ""
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-700">
            {[
              { icon: Truck, label: "Free Shipping", sub: "On orders over $50" },
              { icon: Shield, label: "Secure Checkout", sub: "SSL encrypted" },
              { icon: RotateCcw, label: "Easy Returns", sub: "30-day policy" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className="w-5 h-5 mx-auto text-primary dark:text-primary-light mb-2" />
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
            Tags: {product.tags.map((t) => `#${t}`).join(", ")}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-bold mb-8">
            You May Also Like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </motion.div>
  );
}
