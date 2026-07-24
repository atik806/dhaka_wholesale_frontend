"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Sun,
  Moon,
  User,
  LogOut,
  Home,
  ShoppingBag,
  Grid3X3,
  Search,
  Sparkles,
  TrendingUp,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useEffect } from "react";
import { useCategories } from "@/src/hooks/useApi";
import { useDepartmentsStore } from "@/src/store/useDepartmentsStore";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/providers/ThemeProvider";
import { useAuthStore, useAuthHydrated, useIsLoggedIn } from "@/src/store/useAuthStore";
import { useCartStore, useCartHydrated } from "@/src/store/useCartStore";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
}

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/shop", icon: Grid3X3, label: "Shop" },
  { href: "/cart", icon: ShoppingBag, label: "Cart", isCart: true },
  { href: "/wishlist", icon: Heart, label: "Wishlist", isWishlist: true },
  { href: "/account", icon: User, label: "Account", isAccount: true },
];

/** Shared row styling for the slide-out drawer links */
const drawerRow =
  "flex items-center gap-3 w-full px-3 min-h-[44px] py-2.5 rounded-md text-sm font-medium text-fg hover:bg-surface-2 transition-colors";

export function MobileNav({ open, onClose, onSearchOpen }: MobileNavProps) {
  const pathname = usePathname();
  const { data: categories = [] } = useCategories();
  const openDepartments = useDepartmentsStore((s) => s.openDepartments);
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
  const wishlistIds = useCartStore((s) => s.wishlistIds);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

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
      {/* Bottom Navigation Bar — phones only (< 768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand border-t border-brand-fg/10 shadow-lg safe-area-bottom"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch h-16">
          {navItems.map((item) => {
            const active = item.isAccount
              ? (item.href === "/account" && (pathname === "/account" || pathname.startsWith("/account/"))) ||
                (item.href === "/login" && pathname === "/login")
              : isActive(item.href);
            const href = item.isAccount && isLoggedIn ? "/account" : item.isAccount ? "/login" : item.href;
            const badgeCount = item.isCart
              ? cartHydrated
                ? totalItems
                : 0
              : item.isWishlist
              ? wishlistIds.length
              : 0;

            return (
              <Link
                key={item.label}
                href={href}
                className={`relative flex flex-1 min-w-0 flex-col items-center justify-center gap-1 transition-colors ${
                  active ? "text-accent" : "text-brand-fg/60 hover:text-brand-fg"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute top-0 h-0.5 w-9 rounded-b-sm bg-accent"
                    aria-hidden
                  />
                )}
                <motion.span whileTap={{ scale: 0.85 }} className="relative block">
                  <item.icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold tabular text-accent-fg ring-2 ring-brand">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </motion.span>
                <span className="text-[10px] font-semibold tracking-tight truncate w-full text-center px-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Slide-out Menu — hamburger on all viewports below xl */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60]"
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-surface z-[70] shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-brand shrink-0">
                <SiteLogo variant="mobile" href={null} showWordmark />
                <button
                  onClick={onClose}
                  className="shrink-0 p-2 rounded-md text-brand-fg/70 hover:text-brand-fg hover:bg-brand-fg/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-10">
                {/* Primary actions */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => { onClose(); onSearchOpen(); }}
                  >
                    <Search className="w-4 h-4 text-subtle" />
                    Search products
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => { onClose(); openDepartments(); }}
                  >
                    <Grid3X3 className="w-4 h-4 text-accent" />
                    Browse all categories
                  </Button>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="mt-6">
                    <p className="label-caps text-subtle px-3 mb-2">Categories</p>
                    <ul>
                      {categories.map((cat) => {
                        const active = pathname === `/shop/${cat.slug}`;
                        return (
                          <li key={cat.id}>
                            <Link
                              href={`/shop/${cat.slug}`}
                              onClick={onClose}
                              aria-current={active ? "page" : undefined}
                              className={`block px-3 min-h-[44px] py-2.5 rounded-md text-sm transition-colors ${
                                active
                                  ? "bg-accent-soft text-fg font-semibold"
                                  : "text-muted hover:bg-surface-2 hover:text-fg"
                              }`}
                            >
                              {cat.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <hr className="my-4 border-line" />

                {/* Quick Links — secondary nav not in bottom bar */}
                <p className="label-caps text-subtle px-3 mb-2">Discover</p>
                <Link href="/shop?sort=newest" onClick={onClose} className={drawerRow}>
                  <Sparkles className="w-4 h-4 text-subtle shrink-0" />
                  New Arrivals
                </Link>
                <Link href="/shop?sort=popular" onClick={onClose} className={drawerRow}>
                  <TrendingUp className="w-4 h-4 text-subtle shrink-0" />
                  Best Sellers
                </Link>
                <Link href="/contact" onClick={onClose} className={drawerRow}>
                  <Phone className="w-4 h-4 text-subtle shrink-0" />
                  Contact Us
                </Link>

                <hr className="my-4 border-line" />

                {/* Account Section */}
                {authHydrated && (
                  isLoggedIn ? (
                    <div>
                      <p className="label-caps text-subtle px-3 mb-2">Account</p>
                      <div className="px-3.5 py-3 mb-2 rounded-lg bg-surface-2 border border-line">
                        <p className="text-sm font-semibold text-fg truncate">{user?.name}</p>
                        <p className="text-[13px] text-muted truncate">{user?.email}</p>
                      </div>
                      <Link href="/account" onClick={onClose} className={drawerRow}>
                        <User className="w-4 h-4 text-subtle shrink-0" />
                        My Account
                      </Link>
                      <button
                        onClick={() => { logout(); onClose(); router.push("/"); }}
                        className="flex items-center gap-3 w-full px-3 min-h-[44px] py-2.5 rounded-md text-sm font-medium text-danger hover:bg-danger-soft transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={onClose} className={drawerRow}>
                      <User className="w-4 h-4 text-subtle shrink-0" />
                      Sign In / Register
                    </Link>
                  )
                )}

                <hr className="my-4 border-line" />

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className={drawerRow}>
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-subtle shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-subtle shrink-0" />
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
