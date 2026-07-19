"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sun, Moon, User, LogOut, Home, ShoppingBag, Grid3X3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { useCategories } from "@/src/hooks/useApi";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { useTheme } from "@/src/providers/ThemeProvider";
import { useAuthStore, useAuthHydrated, useIsLoggedIn } from "@/src/store/useAuthStore";
import { useCartStore, useCartHydrated } from "@/src/store/useCartStore";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { data: categories = [] } = useCategories();
  const navRef = useRef<HTMLElement>(null);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const authHydrated = useAuthHydrated();
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartHydrated = useCartHydrated();
  const cartItems = useCartStore((s) => s.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
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
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-zinc-500 dark:text-zinc-400 hover:text-[#0b2c5f] dark:hover:text-primary-light transition-colors min-w-[48px]">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/shop" className="flex flex-col items-center gap-0.5 text-zinc-500 dark:text-zinc-400 hover:text-[#0b2c5f] dark:hover:text-primary-light transition-colors min-w-[48px]">
            <Grid3X3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Shop</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-0.5 text-zinc-500 dark:text-zinc-400 hover:text-[#0b2c5f] dark:hover:text-primary-light transition-colors min-w-[48px] relative">
            <ShoppingBag className="w-5 h-5" />
            {cartHydrated && totalItems > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 flex items-center justify-center bg-[#e31c23] text-white text-[9px] font-bold rounded-full">
                {totalItems}
              </span>
            )}
            <span className="text-[10px] font-medium">Cart</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-0.5 text-zinc-500 dark:text-zinc-400 hover:text-[#0b2c5f] dark:hover:text-primary-light transition-colors min-w-[48px]">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Wishlist</span>
          </Link>
          <Link href={isLoggedIn ? "/account" : "/login"} className="flex flex-col items-center gap-0.5 text-zinc-500 dark:text-zinc-400 hover:text-[#0b2c5f] dark:hover:text-primary-light transition-colors min-w-[48px]">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        </div>
      </nav>

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
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-zinc-900 z-[70] shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                <SiteLogo variant="mobile" href={null} showWordmark />
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-70px)]">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Home className="w-4 h-4 text-zinc-400" /> Home
                </Link>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Grid3X3 className="w-4 h-4 text-zinc-400" /> Shop All
                </Link>
                <div className="pt-3 pb-1">
                  <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Categories
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop/${cat.slug}`}
                      onClick={onClose}
                      className="block px-4 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <hr className="my-3 border-zinc-100 dark:border-zinc-800" />
                <Link
                  href="/shop?sort=newest"
                  onClick={onClose}
                  className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  New Arrivals
                </Link>
                <Link
                  href="/shop?sort=popular"
                  onClick={onClose}
                  className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Best Sellers
                </Link>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Heart className="w-4 h-4 text-zinc-400" /> Wishlist
                </Link>
                {authHydrated && (
                  isLoggedIn ? (
                    <div className="pt-2 pb-1">
                      <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Account
                      </p>
                      <div className="px-4 py-2 mb-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <button
                        onClick={() => { logout(); onClose(); router.push("/"); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <User className="w-4 h-4" /> Sign In / Register
                    </Link>
                  )
                )}
                <hr className="my-3 border-zinc-100 dark:border-zinc-800" />
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px]"
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
    </>
  );
}
