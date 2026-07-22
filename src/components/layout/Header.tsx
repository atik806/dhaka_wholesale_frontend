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
  Truck,
  ShieldCheck,
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
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="absolute top-full right-0 mt-2 w-72 sm:w-96 max-w-[calc(100vw-2rem)] bg-[#FBF6EC] dark:bg-[#132A3A] rounded-[3px] shadow-2xl border border-[#E7DCC4] dark:border-[#2a3d4d] overflow-hidden z-50 text-[#1C1A17] dark:text-[#E7DCC4]"
        >
          {searchLoading && (
            <div className="px-4 py-3 text-xs font-mono text-[#132A3A]/70 dark:text-[#E7DCC4]/70">SEARCHING...</div>
          )}
          {!searchLoading && searchResults.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 bg-[#132A3A] dark:bg-[#0A1A28] text-[#F5A300] font-mono text-[10px] uppercase font-bold tracking-wider">
                Matching Items ({searchResults.length})
              </div>
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E7DCC4]/50 dark:border-[#2a3d4d] hover:bg-[#F5A300]/10 transition-colors"
                >
                  <img
                    src={safeImage(product.images)}
                    alt={product.name}
                    className="w-10 h-10 rounded-[2px] object-cover bg-white dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d]"
                  />
                  <div className="flex-1 min-w-0">
                    <p                     className="text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] truncate">{product.name}</p>
                    <p className="text-xs font-mono font-bold text-[#1F6F50]">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
              {searchTotal > 6 && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full px-4 py-2.5 text-xs font-mono font-bold text-[#132A3A] dark:text-[#E7DCC4] bg-[#E7DCC4]/40 dark:bg-[#0A1A28] hover:bg-[#F5A300] hover:text-[#132A3A] transition-colors border-t border-[#E7DCC4] dark:border-[#2a3d4d]"
                >
                  VIEW ALL {searchTotal} RESULTS &rarr;
                </button>
              )}
            </div>
          )}
          {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-mono text-[#1C1A17]/60 dark:text-[#a0b4c4]">NO MATCHES FOUND FOR &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* 1. Dark mono-font announcement bar on top */}
      <div className="bg-[#0D1F2C] dark:bg-[#071520] text-[#E7DCC4] text-[11px] font-mono py-2 border-b border-[#E7DCC4]/20 hidden md:block">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[#F5A300] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              COD AVAILABLE NATIONWIDE
            </span>
            <span className="text-[#E7DCC4]/30">|</span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#F5A300]" />
              01302228993
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/track-order" className="hover:text-[#F5A300] transition-colors flex items-center gap-1">
              <Package className="w-3 h-3 text-[#F5A300]" /> Track Order
            </Link>
            <span className="text-[#E7DCC4]/30">|</span>
            <Link href="/contact" className="hover:text-[#F5A300] transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Navy header with circular rotated logo mark, marigold underline on nav hover, pill-shaped account button in marigold */}
      <header
        className={`sticky top-0 z-50 bg-[#132A3A] dark:bg-[#0A1A28] transition-all duration-200 border-b border-[#E7DCC4]/20 dark:border-[#2a3d4d]/20 ${
          scrolled ? "shadow-xl py-0.5" : ""
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="relative z-10 shrink-0">
            <SiteLogo variant="header" priority showWordmark />
          </div>

          {/* Nav links with marigold underline on hover */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              href="/shop"
              className="relative py-1 text-sm font-semibold text-[#E7DCC4] hover:text-[#F5A300] transition-colors group after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#F5A300] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Shop All
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setCategoryOpen(true)}
              onMouseLeave={() => setCategoryOpen(false)}
            >
              <button className="relative py-1 flex items-center gap-1 text-sm font-semibold text-[#E7DCC4] hover:text-[#F5A300] transition-colors group after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#F5A300] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
                Categories <ChevronDown className="w-3.5 h-3.5 text-[#F5A300]" />
              </button>
              <AnimatePresence>
                {categoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                     className="absolute top-full left-0 mt-2 w-60 bg-[#FBF6EC] dark:bg-[#132A3A] rounded-[3px] shadow-2xl border border-[#E7DCC4] dark:border-[#2a3d4d] py-2 text-[#1C1A17] dark:text-[#E7DCC4]"
                  >
                    <div className="px-4 py-1.5 bg-[#132A3A] dark:bg-[#0A1A28] text-[#F5A300] font-mono text-[10px] uppercase font-bold tracking-wider mb-1">
                      Market Categories
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop/${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]/15 hover:text-[#D88900] transition-colors border-b border-[#E7DCC4]/40 last:border-0"
                        onClick={() => setCategoryOpen(false)}
                      >
                        <span>{cat.name}</span>
                          <span className="font-mono text-[10px] bg-[#132A3A] dark:bg-[#0A1A28] text-[#E7DCC4] px-1.5 py-0.5 rounded-[2px]">
                          {cat.productCount}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/shop?sort=newest"
              className="relative py-1 text-sm font-semibold text-[#E7DCC4] hover:text-[#F5A300] transition-colors group after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#F5A300] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              New Arrivals
            </Link>
            <Link
              href="/shop?sort=popular"
              className="relative py-1 text-sm font-semibold text-[#E7DCC4] hover:text-[#F5A300] transition-colors group after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#F5A300] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Best Sellers
            </Link>
            <Link
              href="/contact"
              className="relative py-1 text-sm font-semibold text-[#F5A300] hover:text-white transition-colors group after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Action Icons & Pill-shaped Account Button */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Box */}
            <div ref={searchRef} className="relative hidden md:block">
              <div className="flex items-center gap-2 bg-[#0D1F2C] dark:bg-[#071520] border border-[#E7DCC4]/30 rounded-[3px] px-3 py-1.5 w-48 lg:w-60 focus-within:border-[#F5A300] transition-colors">
                <Search className="w-4 h-4 text-[#F5A300] shrink-0" />
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
                  className="flex-1 bg-transparent text-xs font-mono outline-none text-white placeholder:text-[#E7DCC4]/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      searchInputRef.current?.focus();
                    }}
                    className="shrink-0 p-0.5 hover:text-[#F5A300] text-[#E7DCC4]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {renderSearchDropdown()}
            </div>

            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2 text-[#E7DCC4] hover:text-[#F5A300] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              className="p-2 text-[#E7DCC4] hover:text-[#F5A300] transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <Link
              href="/wishlist"
              className="hidden md:block p-2 text-[#E7DCC4] hover:text-[#F5A300] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="p-2 text-[#E7DCC4] hover:text-[#F5A300] transition-colors relative flex items-center gap-1 bg-[#0D1F2C] dark:bg-[#071520] border border-[#E7DCC4]/30 rounded-[3px] px-2.5 py-1.5"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#F5A300]" />
              <span className="font-mono text-xs font-bold text-white hidden md:inline">Cart</span>
              {cartHydrated && totalItems > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-[#BE3D1F] text-white font-mono text-[10px] font-bold rounded-full border border-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Pill-shaped Account Button in Marigold */}
            <div ref={userMenuRef} className="relative">
              {authHydrated && isLoggedIn ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center gap-1.5 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] font-bold text-xs px-3.5 py-1.5 rounded-full border border-[#D88900] shadow-sm transition-transform active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] truncate">{user?.name?.split(" ")[0] || "Account"}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              ) : authHydrated ? (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] font-bold text-xs px-3.5 py-1.5 rounded-full border border-[#D88900] shadow-sm transition-transform active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Account</span>
                </Link>
              ) : null}

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-[#FBF6EC] dark:bg-[#132A3A] rounded-[3px] shadow-2xl border border-[#E7DCC4] dark:border-[#2a3d4d] py-2 z-50 text-[#1C1A17] dark:text-[#E7DCC4]"
                  >
                    <div className="px-4 py-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d] bg-[#132A3A] dark:bg-[#0A1A28] text-white">
                      <p className="text-xs font-bold truncate text-[#F5A300]">
                        {user?.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#E7DCC4]/70 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#F5A300]/15 transition-colors border-b border-[#E7DCC4]/40 dark:border-[#2a3d4d]"
                    >
                      <User className="w-4 h-4 text-[#F5A300]" />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-[#BE3D1F] hover:bg-[#BE3D1F]/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle — tablets only (768px–1024px), phones use bottom nav */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="hidden md:flex lg:hidden p-2 text-[#E7DCC4] hover:text-[#F5A300] transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onSearchOpen={() => setMobileSearchOpen(true)} />

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#132A3A] dark:bg-[#0A1A28] text-white md:hidden"
          >
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#E7DCC4]/20 dark:border-[#2a3d4d]/20">
              <div className="flex items-center gap-2 flex-1 bg-[#0D1F2C] dark:bg-[#071520] border border-[#E7DCC4]/30 rounded-[3px] px-3 py-2">
                <Search className="w-4 h-4 text-[#F5A300] shrink-0" />
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
                  className="flex-1 bg-transparent text-xs font-mono outline-none text-white placeholder:text-[#E7DCC4]/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      mobileSearchInputRef.current?.focus();
                    }}
                    className="shrink-0 p-0.5 text-[#E7DCC4]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-xs font-mono font-bold text-[#F5A300] shrink-0 px-2"
              >
                CLOSE
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-70px)] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#1C1A17] dark:text-[#E7DCC4]">
              {searchLoading && (
                <div className="px-4 py-4 text-xs font-mono text-[#132A3A] dark:text-[#E7DCC4]">Searching...</div>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[#132A3A] dark:bg-[#0A1A28] text-[#F5A300] font-mono text-xs font-bold">
                    Results ({searchResults.length})
                  </div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 border-b border-[#E7DCC4] dark:border-[#2a3d4d] hover:bg-[#F5A300]/10"
                    >
                      <img
                        src={safeImage(product.images)}
                        alt={product.name}
                        className="w-12 h-12 rounded-[2px] object-cover bg-white dark:bg-[#0D1F2C] border border-[#E7DCC4] dark:border-[#2a3d4d]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#132A3A] dark:text-[#E7DCC4] truncate">{product.name}</p>
                        <p className="text-xs font-mono font-bold text-[#1F6F50]">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                  {searchTotal > 6 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full px-4 py-3 text-xs font-mono font-bold text-[#132A3A] dark:text-[#E7DCC4] bg-[#E7DCC4]/50 dark:bg-[#0A1A28] border-t border-[#E7DCC4] dark:border-[#2a3d4d]"
                    >
                      VIEW ALL {searchTotal} RESULTS &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
