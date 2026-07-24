"use client";

import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { buttonClasses } from "@/src/components/ui/Button";
import { formatPrice, safeImage } from "@/src/lib/utils";

const stepperButton =
  "w-9 h-9 flex items-center justify-center text-fg hover:bg-surface-2 transition-colors disabled:opacity-40 disabled:pointer-events-none";

export const CartDrawer = memo(function CartDrawer() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const computedTotal = items.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );
  const computedCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-cart", handler);
    return () => window.removeEventListener("open-cart", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const prev = document.activeElement as HTMLElement;
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[80]"
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-canvas z-[90] shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-surface border-b border-line shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShoppingBag className="w-5 h-5 text-link shrink-0" strokeWidth={1.75} />
                  <h2 className="text-base font-bold text-fg truncate">
                    Your Cart
                  </h2>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm bg-surface-2 text-[11px] font-bold tabular text-muted">
                    {computedCount}
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close cart"
                  className="shrink-0 p-2 -mr-2 rounded-md text-subtle hover:text-fg hover:bg-surface-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-7 h-7 text-subtle" strokeWidth={1.75} />
                    </div>
                    <p className="text-base font-bold text-fg">Your cart is empty</p>
                    <p className="text-[13px] text-muted mt-1 max-w-[16rem]">
                      Add some items to get started.
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setOpen(false)}
                      className={buttonClasses({ variant: "primary", size: "md", className: "mt-5" })}
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-line bg-surface border-b border-line">
                    {items.map((item) => (
                      <motion.li
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-3 p-4 sm:px-5"
                      >
                        <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0 bg-surface-2 border border-line">
                          <Image
                            src={safeImage(item.product.images)}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.product.slug}`}
                              onClick={() => setOpen(false)}
                              className="text-[13px] font-semibold text-fg line-clamp-2 hover:text-link transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                              aria-label={`Remove ${item.product.name} from cart`}
                              className="shrink-0 p-1.5 -mr-1 -mt-1 rounded-md text-subtle hover:text-danger hover:bg-danger-soft transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-xs text-muted mt-1">
                              {[item.selectedSize, item.selectedColor]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-2 mt-2.5">
                            <div className="inline-flex items-center rounded-md border border-line-strong bg-surface overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                    item.selectedSize,
                                    item.selectedColor
                                  )
                                }
                                aria-label={`Decrease quantity of ${item.product.name}`}
                                className={stepperButton}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span
                                aria-live="polite"
                                className="w-9 text-center text-sm font-semibold tabular text-fg border-x border-line"
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                    item.selectedSize,
                                    item.selectedColor
                                  )
                                }
                                aria-label={`Increase quantity of ${item.product.name}`}
                                className={stepperButton}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-price tabular">
                                {formatPrice((item.product.price || 0) * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-subtle tabular">
                                  {formatPrice(item.product.price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 && (
                <div className="bg-surface border-t border-line shrink-0 safe-area-bottom">
                  <div className="px-4 sm:px-5 py-4 space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-fg">Subtotal</p>
                        <p className="text-xs text-muted mt-0.5">
                          Delivery calculated at checkout
                        </p>
                      </div>
                      <span className="text-xl font-bold text-price tabular">
                        {formatPrice(computedTotal)}
                      </span>
                    </div>
                    <Link
                      href="/checkout"
                      onClick={() => setOpen(false)}
                      className={buttonClasses({ variant: "primary", size: "lg", fullWidth: true })}
                    >
                      Proceed to Checkout
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setOpen(false)}
                      className={buttonClasses({ variant: "ghost", size: "sm", fullWidth: true })}
                    >
                      View full cart
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
