"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  User,
  LogOut,
  X,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useCartHydrated } from "@/src/store/useCartStore";
import { useAuthStore, useAuthHydrated, useIsLoggedIn } from "@/src/store/useAuthStore";
import { useCategories } from "@/src/hooks/useApi";
import { fetchProducts } from "@/src/lib/api";
import { formatPrice, safeImage } from "@/src/lib/utils";
import { MobileNav } from "./MobileNav";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Product } from "@/src/types/product";

export const Header = memo(function Header() {
  const { data: categories = [] } = useCategories();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
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

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
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
        const result = await fetchProducts({ search: searchQuery.trim(), limit: 6 }, controller.signal);
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
  }, [searchQuery]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      setSearchOpen(false);
      setMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  const handleResultClick = useCallback(() => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const renderSearchDropdown = () => (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
        >
          {searchLoading && (
            <div className="px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500">Searching...</div>
          )}
          {!searchLoading && searchResults.length > 0 && (
            <div className="py-1">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <img
                    src={safeImage(product.images)}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
              {searchTotal > 6 && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full px-4 py-2.5 text-sm text-[#0b2c5f] dark:text-primary-light font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors border-t border-zinc-100 dark:border-zinc-700"
                >
                  View all {searchTotal} results
                </button>
              )}
            </div>
          )}
          {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No products found</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#0b2c5f] text-white text-xs py-2 hidden md:block">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              01302228993
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hover:text-white/80 transition-colors">Track Order</Link>
            <span className="text-white/40">|</span>
            <Link href="/contact" className="hover:text-white/80 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-100 dark:border-zinc-800"
            : "bg-white dark:bg-zinc-900"
        }`}
      >
        <div className="container flex items-center justify-between h-14 md:h-16">
          <div className="relative z-10">
            <SiteLogo variant="header" priority showWordmark />
          </div>

          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/shop"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Shop All
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setCategoryOpen(true)}
              onMouseLeave={() => setCategoryOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {categoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-2"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop/${cat.slug}`}
                        className="block px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        onClick={() => setCategoryOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/shop?sort=popular"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Best Sellers
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:gap-1.5">
            <div ref={searchRef} className="relative hidden sm:block">
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 w-52 lg:w-64 transition-colors focus-within:ring-2 focus-within:ring-[#0b2c5f]/20 focus-within:bg-white dark:focus-within:bg-zinc-700">
                <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      searchInputRef.current?.focus();
                    }}
                    className="shrink-0 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                )}
              </div>
              {renderSearchDropdown()}
            </div>
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="sm:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </button>

            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              )}
            </button>

            <Link
              href="/wishlist"
              className="hidden sm:flex p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
            >
              <Heart className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </Link>

            <div ref={userMenuRef} className="relative hidden sm:block">
              {authHydrated && isLoggedIn ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#0b2c5f] dark:bg-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                </button>
              ) : authHydrated ? (
                <Link
                  href="/login"
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </Link>
              ) : null}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-700">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/cart"
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              {cartHydrated && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-[#e31c23] text-white text-[10px] font-bold rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-zinc-900 sm:hidden"
          >
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                    if (e.key === "Escape") setMobileSearchOpen(false);
                  }}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      mobileSearchInputRef.current?.focus();
                    }}
                    className="shrink-0 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 shrink-0"
              >
                Cancel
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-60px)]">
              {searchLoading && (
                <div className="px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500">Searching...</div>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <div className="py-1">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <img
                        src={safeImage(product.images)}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                  {searchTotal > 6 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full px-4 py-3 text-sm text-[#0b2c5f] dark:text-primary-light font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                    >
                      View all {searchTotal} results
                    </button>
                  )}
                </div>
              )}
              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No products found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
