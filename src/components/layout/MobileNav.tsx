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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#132A3A] dark:bg-[#0A1A28] border-t border-[#E7DCC4]/20"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-14 px-1">
          {navItems.map((item) => {
            const active = item.isAccount
              ? (item.href === "/account" && (pathname === "/account" || pathname.startsWith("/account/"))) ||
                (item.href === "/login" && pathname === "/login")
              : isActive(item.href);
            const href = item.isAccount && isLoggedIn ? "/account" : item.isAccount ? "/login" : item.href;
            const baseClass = `flex flex-col items-center justify-center gap-0.5 transition-colors flex-1 min-w-0 max-w-[72px] py-1 ${
              active ? "text-[#F5A300]" : "text-[#E7DCC4]/60 hover:text-[#F5A300]"
            }`;

            if (item.isCart) {
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`${baseClass} relative`}
                  aria-current={active ? "page" : undefined}
                >
                  <motion.div whileTap={{ scale: 0.85 }} className="relative">
                    <item.icon className="w-5 h-5" />
                    {cartHydrated && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center bg-[#BE3D1F] text-white text-[9px] font-mono font-bold rounded-full px-0.5">
                        {totalItems}
                      </span>
                    )}
                  </motion.div>
                  <span className="text-[10px] font-medium font-mono truncate w-full text-center">{item.label}</span>
                </Link>
              );
            }

            if (item.isWishlist) {
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`${baseClass} relative`}
                  aria-current={active ? "page" : undefined}
                >
                  <motion.div whileTap={{ scale: 0.85 }} className="relative">
                    <item.icon className="w-5 h-5" />
                    {wishlistIds.length > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center bg-[#BE3D1F] text-white text-[9px] font-mono font-bold rounded-full px-0.5">
                        {wishlistIds.length}
                      </span>
                    )}
                  </motion.div>
                  <span className="text-[10px] font-medium font-mono truncate w-full text-center">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={href}
                className={baseClass}
                aria-current={active ? "page" : undefined}
              >
                <motion.div whileTap={{ scale: 0.85 }}>
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="text-[10px] font-medium font-mono truncate w-full text-center">{item.label}</span>
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#FBF6EC] dark:bg-[#0D1F2C] z-[70] shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E7DCC4] dark:border-[#2a3d4d] bg-[#132A3A] dark:bg-[#0A1A28]">
                <SiteLogo variant="mobile" href={null} showWordmark />
                <button
                  onClick={onClose}
                  className="p-2 rounded-[2px] hover:bg-[#0D1F2C] dark:hover:bg-[#071520] transition-colors text-[#E7DCC4] hover:text-[#F5A300]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-70px)]">
                {/* Quick Search */}
                <button
                  onClick={() => { onClose(); onSearchOpen(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-[2px] text-sm font-bold font-sans text-[#132A3A] dark:text-[#E7DCC4] bg-[#E7DCC4]/40 dark:bg-[#132A3A] hover:bg-[#F5A300]/20 transition-colors"
                >
                  <Search className="w-4 h-4 text-[#F5A300]" /> Search Products...
                </button>

                {/* Departments panel */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openDepartments();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-[2px] text-sm font-bold font-sans text-white bg-[#132A3A] hover:bg-[#0D1F2C] transition-colors"
                >
                  <Grid3X3 className="w-4 h-4 text-[#F5A300]" /> Browse Departments
                </button>

                {/* Categories */}
                <div className="pt-3 pb-1">
                  <p className="px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#BE3D1F] mb-1">
                    Categories
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop/${cat.slug}`}
                      onClick={onClose}
                      className={`block px-4 py-2.5 rounded-[2px] text-sm font-sans transition-colors ${
                        pathname === `/shop/${cat.slug}`
                          ? "text-[#D88900] bg-[#F5A300]/15 font-bold"
                          : "text-[#1C1A17]/80 dark:text-[#a0b4c4] hover:text-[#D88900] hover:bg-[#F5A300]/10"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <hr className="my-3 border-[#E7DCC4] dark:border-[#2a3d4d]" />

                {/* Quick Links — secondary nav not in bottom bar */}
                <Link
                  href="/shop?sort=newest"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[2px] text-sm font-bold font-sans transition-colors ${
                    pathname === "/shop" && pathname.includes("newest")
                      ? "text-[#D88900] bg-[#F5A300]/15"
                      : "text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]/10 hover:text-[#D88900]"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#F5A300]" /> New Arrivals
                </Link>
                <Link
                  href="/shop?sort=popular"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-[2px] text-sm font-bold font-sans text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]/10 hover:text-[#D88900] transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-[#F5A300]" /> Best Sellers
                </Link>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-[2px] text-sm font-bold font-sans text-[#F5A300] hover:bg-[#F5A300]/10 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Contact Us
                </Link>

                <hr className="my-3 border-[#E7DCC4] dark:border-[#2a3d4d]" />

                {/* Account Section */}
                {authHydrated && (
                  isLoggedIn ? (
                    <div className="pt-2 pb-1">
                      <p className="px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#132A3A]/60 dark:text-[#a0b4c4] mb-1">
                        Account
                      </p>
                      <div className="px-4 py-2 mb-1 bg-[#132A3A] dark:bg-[#0A1A28] rounded-[2px]">
                        <p className="text-sm font-bold text-[#F5A300] font-sans">{user?.name}</p>
                        <p className="text-xs text-[#E7DCC4]/70 font-mono">{user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-[2px] text-sm font-sans text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]/10 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#F5A300]" /> My Account
                      </Link>
                      <button
                        onClick={() => { logout(); onClose(); router.push("/"); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-[2px] text-sm font-sans text-[#BE3D1F] hover:bg-[#BE3D1F]/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-[2px] text-sm font-bold font-sans text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]/10 hover:text-[#D88900] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#F5A300]" /> Sign In / Register
                    </Link>
                  )
                )}

                <hr className="my-3 border-[#E7DCC4] dark:border-[#2a3d4d]" />

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-[2px] text-sm font-bold font-sans text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]/10 hover:text-[#D88900] transition-colors min-h-[44px]"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[#F5A300]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#F5A300]" />
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
