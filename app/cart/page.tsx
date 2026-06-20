"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { formatPrice } from "@/src/lib/utils";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCartStore();

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container"
      >
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-primary dark:text-primary-light" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse our collection and find something you love."
          actionLabel="Start Shopping"
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
      <Breadcrumbs items={[{ label: "Cart" }]} />

      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Shopping Cart ({totalItems()})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4"
            >
              <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.id}`}
                  className="font-medium text-sm hover:text-primary dark:hover:text-primary-light transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {item.product.category}
                </p>
                <p className="font-semibold text-sm mt-1">
                  {formatPrice(item.product.price)}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-1.5 rounded-lg hover:bg-danger/10 text-zinc-500 dark:text-zinc-400 hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-1">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Shipping</span>
                <span>{totalPrice() >= 50 ? "Free" : "$5.00"}</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Tax</span>
                <span>{formatPrice(totalPrice() * 0.08)}</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {formatPrice(
                    totalPrice() + (totalPrice() >= 50 ? 0 : 5) + totalPrice() * 0.08
                  )}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white rounded-xl py-3 text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="block text-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
