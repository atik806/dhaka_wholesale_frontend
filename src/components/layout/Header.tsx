"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  User,
  LogOut,
  MapPin,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useCartHydrated } from "@/src/store/useCartStore";
import { useAuthStore, useAuthHydrated, useIsLoggedIn } from "@/src/store/useAuthStore";
import { useCategories } from "@/src/hooks/useApi";
import { fetchProducts } from "@/src/lib/api";
import { formatPrice, safeImage } from "@/src/lib/utils";
import { MobileNav } from "./MobileNav";
import { CartNavButton } from "./CartNavButton";
import { FloatingCartButton } from "./FloatingCartButton";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Product } from "@/src/types/product";

/** The header bar stays dark in both themes, so its own hover/label styles are local. */
const navItem =
  "rounded-md transition-colors hover:bg-white/10 focus-visible:ring-offset-0";

export const Header = memo(function Header() {
  const { data: categories = [] } = useCategories();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartHydrated = useCartHydrated();
  const cartItems = useCartStore((s) => s.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const authHydrated = useAuthHydrated();
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const deliverCity =
    user?.shipping_address?.city?.trim() ||
    user?.shipping_address?.address?.trim()?.split(",")[0] ||
    "Bangladesh";

  useEffect(() => {
    if (!mobileSearchOpen) return;
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setMobileSearchOpen(false);
      setSearchOpen(true);
      requestAnimationFrame(() => searchInputRef.current?.focus());
      return;
    }
    mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchTotal(0);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const result = await fetchProducts(
          {
            search: searchQuery.trim(),
            limit: 6,
            ...(searchCategory !== "all" ? { category: searchCategory } : {}),
          },
          controller.signal,
        );
        setSearchResults(result.products);
        setSearchTotal(result.total);
      } catch {
        // aborted or failed
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, searchCategory]);

  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim();
    setSearchOpen(false);
    setMobileSearchOpen(false);
    if (searchCategory !== "all" && !q) {
      router.push(`/shop/${searchCategory}`);
      return;
    }
    if (!q) {
      router.push("/shop");
      return;
    }
    const params = new URLSearchParams({ q });
    if (searchCategory !== "all") params.set("category", searchCategory);
    router.push(`/search?${params.toString()}`);
  }, [searchQuery, searchCategory, router]);

  const handleResultClick = useCallback(() => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(t)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Hide nav on scroll down; show on scroll up / near top
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (y < 48) {
        setNavHidden(false);
      } else if (delta > 6 && y > 100) {
        setNavHidden(true);
        setUserMenuOpen(false);
        setSearchOpen(false);
      } else if (delta < -6) {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const secondaryLinks = [
    { href: "/shop?sort=newest", label: "New Arrivals" },
    { href: "/shop?sort=popular", label: "Best Sellers" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/shipping-returns", label: "Shipping" },
    { href: "/faq", label: "Help" },
    { href: "/contact", label: "Customer Service" },
  ];

  const searchResultRows = searchResults.map((product) => (
    <Link
      key={product.id}
      href={`/product/${product.slug}`}
      onClick={handleResultClick}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors"
    >
      <img
        src={safeImage(product.images)}
        alt=""
        className="w-11 h-11 rounded-md object-cover bg-surface-2 border border-line shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-fg truncate">{product.name}</p>
        <p className="text-sm font-bold text-price tabular">{formatPrice(product.price)}</p>
      </div>
    </Link>
  ));

  const accountFirstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-brand-deep text-white shadow-md transition-transform duration-300 ease-out will-change-transform ${
          navHidden ? "-translate-y-full pointer-events-none" : "translate-y-0"
        }`}
      >
        <div className="px-3 lg:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 min-h-[58px] sm:min-h-[62px] py-2">
            <div className={`shrink-0 px-1.5 py-1 ${navItem}`}>
              <SiteLogo variant="header" priority showWordmark />
            </div>

            <Link
              href={isLoggedIn ? "/account" : "/shipping-returns"}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-2 shrink-0 max-w-[12rem] ${navItem}`}
            >
              <MapPin className="w-[18px] h-[18px] shrink-0 text-accent" />
              <span className="min-w-0">
                <span className="block text-[11px] text-white/60 leading-none">Deliver to</span>
                <span className="block text-[13px] font-semibold leading-tight truncate">
                  {deliverCity}
                </span>
              </span>
            </Link>

            {/* Search — the dominant element, Amazon-style */}
            <div ref={searchRef} className="relative hidden md:flex flex-1 min-w-0 self-center">
              <form
                className="flex w-full h-11 rounded-lg overflow-hidden bg-surface border border-transparent focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
              >
                <label htmlFor="nav-search-category" className="sr-only">
                  Search category
                </label>
                <select
                  id="nav-search-category"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="hidden lg:block max-w-[8.5rem] shrink-0 bg-surface-2 text-fg text-[13px] font-medium border-0 border-r border-line px-2.5 outline-none cursor-pointer"
                >
                  <option value="all">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                  placeholder="Search products, brands and categories"
                  className="flex-1 min-w-0 bg-surface text-fg text-sm px-3.5 outline-none placeholder:text-subtle"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="shrink-0 w-12 bg-accent hover:bg-accent-hover text-accent-fg flex items-center justify-center transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </form>

              <AnimatePresence>
                {searchOpen && (searchLoading || searchQuery.trim()) && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-surface rounded-lg shadow-xl border border-line overflow-hidden z-50"
                  >
                    {searchLoading && (
                      <div className="px-4 py-3 text-sm text-muted">Searching…</div>
                    )}
                    {!searchLoading && searchResults.length > 0 && (
                      <div className="py-1">
                        {searchResultRows}
                        {searchTotal > 6 && (
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="w-full px-4 py-2.5 text-sm text-left font-semibold text-brand hover:text-accent-hover bg-surface-2 border-t border-line transition-colors"
                          >
                            See all {searchTotal} results
                          </button>
                        )}
                      </div>
                    )}
                    {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-muted">
                        No matches for &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto shrink-0">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className={`md:hidden p-2.5 ${navItem}`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                suppressHydrationWarning
                className={`p-2.5 text-white/70 hover:text-white ${navItem}`}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              <div ref={userMenuRef} className="relative">
                {authHydrated && isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                    className={`flex flex-col justify-center px-2 py-1.5 text-left min-w-0 ${navItem}`}
                  >
                    <span className="text-[11px] text-white/60 leading-none truncate max-w-[6rem] sm:max-w-[7rem]">
                      Hello, {accountFirstName}
                    </span>
                    <span className="text-[13px] font-semibold leading-tight flex items-center gap-0.5">
                      Account
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </span>
                  </button>
                ) : authHydrated ? (
                  <Link
                    href="/login"
                    className={`flex flex-col justify-center px-2 py-1.5 ${navItem}`}
                  >
                    <span className="text-[11px] text-white/60 leading-none">Hello, sign in</span>
                    <span className="text-[13px] font-semibold leading-tight">Account</span>
                  </Link>
                ) : (
                  <div className="w-16 sm:w-20 h-9" aria-hidden />
                )}

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute top-full right-0 mt-1.5 w-64 bg-surface rounded-lg shadow-xl border border-line py-1.5 z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-line">
                        <p className="text-sm font-semibold text-fg truncate">{user?.name}</p>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg hover:bg-surface-2 transition-colors"
                      >
                        <User className="w-4 h-4 text-muted" />
                        Your account
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg hover:bg-surface-2 transition-colors"
                      >
                        <Package className="w-4 h-4 text-muted" />
                        Your orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg hover:bg-surface-2 border-b border-line transition-colors"
                      >
                        <Heart className="w-4 h-4 text-muted" />
                        Wishlist
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-danger hover:bg-surface-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href={isLoggedIn ? "/account" : "/login?redirect=/account"}
                className={`hidden lg:flex flex-col justify-center px-2 py-1.5 ${navItem}`}
              >
                <span className="text-[11px] text-white/60 leading-none">Returns</span>
                <span className="text-[13px] font-semibold leading-tight">&amp; Orders</span>
              </Link>

              <CartNavButton totalItems={totalItems} hydrated={cartHydrated} />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2.5 ${navItem}`}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary bar — categories live in the persistent left sidebar */}
        <div className="bg-brand border-t border-white/5">
          <div className="px-3 lg:px-4 flex items-center min-h-[38px] gap-1 overflow-x-auto scrollbar-none">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`shrink-0 px-2.5 py-1.5 text-[13px] text-white/85 hover:text-white whitespace-nowrap ${navItem}`}
              >
                {link.label}
              </Link>
            ))}
            <span className="hidden xl:inline shrink-0 ml-auto px-2.5 py-1.5 text-[13px] font-semibold text-accent whitespace-nowrap">
              Cash on delivery nationwide · ৳80 Dhaka / ৳120 outside
            </span>
          </div>
        </div>
      </header>

      <FloatingCartButton visible={navHidden && !mobileMenuOpen && !mobileSearchOpen} />

      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onSearchOpen={() => setMobileSearchOpen(true)}
      />

      {/* Mobile search overlay */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-canvas md:hidden flex flex-col"
          >
            <div className="flex items-center gap-2 px-3 py-3 bg-brand-deep shrink-0">
              <form
                className="flex flex-1 min-w-0 h-11 rounded-lg overflow-hidden bg-surface"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
              >
                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setMobileSearchOpen(false);
                  }}
                  placeholder="Search products"
                  className="flex-1 min-w-0 bg-surface text-fg text-sm px-3.5 outline-none placeholder:text-subtle"
                />
                <button
                  type="submit"
                  className="w-12 bg-accent text-accent-fg flex items-center justify-center shrink-0"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-sm font-semibold text-accent shrink-0 px-2 py-2"
              >
                Cancel
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-surface divide-y divide-line">
              {searchLoading && <div className="px-4 py-4 text-sm text-muted">Searching…</div>}
              {!searchLoading && searchResults.length > 0 && searchResultRows}
              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  No matches for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
