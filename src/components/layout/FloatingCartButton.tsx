"use client";

import { memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCartStore, useCartHydrated } from "@/src/store/useCartStore";

interface FloatingCartButtonProps {
  visible: boolean;
}

export const FloatingCartButton = memo(function FloatingCartButton({
  visible,
}: FloatingCartButtonProps) {
  const cartHydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const count = cartHydrated ? totalItems : 0;
  const label = count > 99 ? "99+" : String(count);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed z-[55] bottom-[5.5rem] md:bottom-6 right-4 md:right-6"
        >
          <Link
            href="/cart"
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-lg ring-1 ring-brand-fg/15 hover:bg-brand-hover hover:shadow-xl active:scale-95 transition-all duration-150"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingCart className="w-6 h-6" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold tabular text-accent-fg shadow-sm ring-2 ring-canvas">
              {label}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
