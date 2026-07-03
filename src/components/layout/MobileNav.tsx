"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { categories } from "@/src/lib/constants";
import { useTheme } from "@/src/providers/ThemeProvider";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    const focusable = navRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
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
      prev?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.nav
            ref={navRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-zinc-800 z-[70] shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <span className="font-serif text-xl font-bold text-primary dark:text-primary-light">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-70px)]">
              <Link
                href="/shop"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Shop All
              </Link>
              <div className="pt-2 pb-1">
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop/${cat.slug}`}
                    onClick={onClose}
                    className="block px-4 py-2.5 rounded-xl text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/shop?sort=newest"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                href="/shop?sort=popular"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Best Sellers
              </Link>
              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
              <hr className="my-3 border-zinc-200 dark:border-zinc-700" />
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
