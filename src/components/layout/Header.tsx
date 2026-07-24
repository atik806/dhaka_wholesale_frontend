"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  User,
  LogOut,
  X,
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
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Product } from "@/src/types/product";

export const Header = memo(function Header() {
  const { data: categories = [] } = useCategories();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
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
  const departmentsRef = useRef<HTMLDivElement>(null);
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
      if (departmentsRef.current && !departmentsRef.current.contains(t)) setDepartmentsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const secondaryLinks = [
    { href: "/shop", label: "Shop All" },
    { href: "/shop?sort=newest", label: "New Arrivals" },
    { href: "/shop?sort=popular", label: "Best Sellers" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/shipping-returns", label: "Shipping" },
    { href: "/faq", label: "Help" },
    { href: "/contact", label: "Customer Service" },
  ];

  const renderSearchDropdown = (wide = false) => (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className={`absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a2d3d] rounded-b-md shadow-2xl border border-[#D5D9D9] dark:border-[#2a3d4d] overflow-hidden z-50 text-[#0F1111] dark:text-[#E7DCC4] ${
            wide ? "" : "min-w-[16rem]"
          }`}
        >
          {searchLoading && (
            <div className="px-4 py-3 text-sm text-[#565959]">Searching…</div>
          )}
          {!searchLoading && searchResults.length > 0 && (
            <div className="py-1">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F8F8] dark:hover:bg-[#0D1F2C] transition-colors"
                >
                  <img
                    src={safeImage(product.images)}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover bg-[#F7F8F8] border border-[#D5D9D9]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-sm font-bold text-[#B12704]">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
              {searchTotal > 6 && (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full px-4 py-2.5 text-sm text-left text-[#2162A1] hover:underline bg-[#F7F8F8] dark:bg-[#0A1A28] border-t border-[#D5D9D9] dark:border-[#2a3d4d]"
                >
                  See all {searchTotal} results
                </button>
              )}
            </div>
          )}
          {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[#565959]">
              No matches for &quot;{searchQuery}&quot;
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const accountFirstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      {/* ── Amazon-style primary nav ── */}
      <header className="sticky top-0 z-50 bg-[#131921] text-white shadow-md">
        <div className="px-2 sm:px-3 lg:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 min-h-[56px] sm:min-h-[60px] py-1.5">
            {/* Logo */}
            <div className="shrink-0 px-1 py-1 rounded-sm hover:outline hover:outline-1 hover:outline-white">
              <SiteLogo variant="header" priority showWordmark />
            </div>

            {/* Deliver to */}
            <Link
              href={isLoggedIn ? "/account" : "/shipping-returns"}
              className="hidden sm:flex flex-col justify-center px-2 py-1.5 rounded-sm hover:outline hover:outline-1 hover:outline-white shrink-0 max-w-[9rem] lg:max-w-[11rem]"
            >
              <span className="flex items-center gap-1 text-[11px] text-[#CCC] leading-none pl-5">
                Deliver to
              </span>
              <span className="flex items-center gap-1 text-[13px] font-bold leading-tight truncate">
                <MapPin className="w-4 h-4 shrink-0 text-white -mt-0.5" />
                <span className="truncate">{deliverCity}</span>
              </span>
            </Link>

            {/* Search — grows to fill center (Amazon pattern) */}
            <div ref={searchRef} className="relative hidden md:flex flex-1 min-w-0 h-10 self-center">
              <form
                className="flex w-full h-full rounded-md overflow-hidden focus-within:outline focus-within:outline-2 focus-within:outline-[#F5A300]"
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
                  className="hidden lg:block max-w-[7.5rem] shrink-0 bg-[#E6E6E6] text-[#0F1111] text-xs font-medium border-0 border-r border-[#CDCDCD] px-2 outline-none cursor-pointer"
                >
                  <option value="all">All</option>
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
                  placeholder="Search Dhaka Wholesale"
                  className="flex-1 min-w-0 bg-white text-[#0F1111] text-sm px-3 outline-none placeholder:text-[#767676]"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="shrink-0 w-11 sm:w-12 bg-[#F5A300] hover:bg-[#D88900] text-[#131921] flex items-center justify-center transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </form>
              {renderSearchDropdown(true)}
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto shrink-0">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-sm hover:outline hover:outline-1 hover:outline-white"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                suppressHydrationWarning
                className="p-2 rounded-sm hover:outline hover:outline-1 hover:outline-white text-[#CCC] hover:text-white"
                aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Account */}
              <div ref={userMenuRef} className="relative">
                {authHydrated && isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex flex-col justify-center px-1.5 sm:px-2 py-1 rounded-sm hover:outline hover:outline-1 hover:outline-white text-left min-w-0"
                  >
                    <span className="text-[11px] text-[#CCC] leading-none truncate max-w-[5.5rem] sm:max-w-[7rem]">
                      Hello, {accountFirstName}
                    </span>
                    <span className="text-[12px] sm:text-[13px] font-bold leading-tight flex items-center gap-0.5">
                      Account &amp; Lists
                      <ChevronDown className="w-3 h-3 hidden sm:inline opacity-80" />
                    </span>
                  </button>
                ) : authHydrated ? (
                  <Link
                    href="/login"
                    className="flex flex-col justify-center px-1.5 sm:px-2 py-1 rounded-sm hover:outline hover:outline-1 hover:outline-white"
                  >
                    <span className="text-[11px] text-[#CCC] leading-none">Hello, sign in</span>
                    <span className="text-[12px] sm:text-[13px] font-bold leading-tight flex items-center gap-0.5">
                      Account &amp; Lists
                      <ChevronDown className="w-3 h-3 hidden sm:inline opacity-80" />
                    </span>
                  </Link>
                ) : (
                  <div className="w-16 sm:w-24 h-9" aria-hidden />
                )}

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-[#1a2d3d] rounded-md shadow-2xl border border-[#D5D9D9] dark:border-[#2a3d4d] py-2 z-50 text-[#0F1111] dark:text-[#E7DCC4]"
                    >
                      <div className="px-4 py-2 border-b border-[#D5D9D9] dark:border-[#2a3d4d]">
                        <p className="text-sm font-bold truncate">{user?.name}</p>
                        <p className="text-xs text-[#565959] dark:text-[#a0b4c4] truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F7F8F8] dark:hover:bg-[#0D1F2C]"
                      >
                        <User className="w-4 h-4 text-[#F5A300]" />
                        Your Account
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F7F8F8] dark:hover:bg-[#0D1F2C]"
                      >
                        <Package className="w-4 h-4 text-[#F5A300]" />
                        Your Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F7F8F8] dark:hover:bg-[#0D1F2C] border-b border-[#D5D9D9] dark:border-[#2a3d4d]"
                      >
                        <Heart className="w-4 h-4 text-[#F5A300]" />
                        Wishlist
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#B12704] hover:bg-[#F7F8F8] dark:hover:bg-[#0D1F2C]"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Returns & Orders */}
              <Link
                href={isLoggedIn ? "/account" : "/login?redirect=/account"}
                className="hidden md:flex flex-col justify-center px-2 py-1 rounded-sm hover:outline hover:outline-1 hover:outline-white"
              >
                <span className="text-[11px] text-[#CCC] leading-none">Returns</span>
                <span className="text-[13px] font-bold leading-tight">&amp; Orders</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-end gap-0.5 px-2 py-1 rounded-sm hover:outline hover:outline-1 hover:outline-white min-w-[52px]"
                aria-label={`Cart, ${totalItems} items`}
              >
                <span className="relative inline-flex">
                  <ShoppingCart className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.75} />
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[#F5A300] text-sm font-bold tabular-nums leading-none">
                    {cartHydrated ? (totalItems > 99 ? "99+" : totalItems) : 0}
                  </span>
                </span>
                <span className="hidden sm:inline text-[13px] font-bold pb-0.5">Cart</span>
              </Link>

              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-sm hover:outline hover:outline-1 hover:outline-white"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Secondary category bar ── */}
        <div className="relative bg-[#232F3E] text-white text-[13px]">
          <div className="px-2 sm:px-3 lg:px-4 flex items-center gap-1 min-h-[39px] overflow-x-auto scrollbar-none">
            <div ref={departmentsRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
                    setMobileMenuOpen(true);
                    return;
                  }
                  setDepartmentsOpen((o) => !o);
                }}
                className={`inline-flex items-center gap-1.5 font-bold px-2 py-1.5 rounded-sm hover:outline hover:outline-1 hover:outline-white whitespace-nowrap ${
                  departmentsOpen ? "outline outline-1 outline-[#F5A300]" : ""
                }`}
              >
                <Menu className="w-4 h-4" />
                All
              </button>

              <AnimatePresence>
                {departmentsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 top-full mt-1 w-72 max-h-[70vh] overflow-y-auto bg-white dark:bg-[#1a2d3d] text-[#0F1111] dark:text-[#E7DCC4] rounded-md shadow-2xl border border-[#D5D9D9] dark:border-[#2a3d4d] z-50"
                  >
                    <div className="px-4 py-3 bg-[#232F3E] text-white font-bold text-sm">
                      Shop by Department
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setDepartmentsOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-[#F7F8F8] dark:hover:bg-[#0D1F2C] border-b border-[#E7DCC4]/40"
                    >
                      All products
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop/${cat.slug}`}
                        onClick={() => setDepartmentsOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#F7F8F8] dark:hover:bg-[#0D1F2C] border-b border-[#E7DCC4]/30 last:border-0"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-[#565959]">{cat.productCount}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {secondaryLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="shrink-0 px-2 py-1.5 rounded-sm hover:outline hover:outline-1 hover:outline-white whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}

            <span className="hidden xl:inline shrink-0 px-2 py-1.5 text-[#F5A300] font-semibold whitespace-nowrap">
              COD nationwide · ৳80 Dhaka / ৳120 outside
            </span>
          </div>
        </div>
      </header>

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
            className="fixed inset-0 z-[60] bg-[#131921] text-white md:hidden"
          >
            <div className="flex items-center gap-2 px-3 pt-3 pb-3">
              <form
                className="flex flex-1 min-w-0 h-11 rounded-md overflow-hidden"
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
                  placeholder="Search Dhaka Wholesale"
                  className="flex-1 min-w-0 bg-white text-[#0F1111] text-sm px-3 outline-none"
                />
                <button
                  type="submit"
                  className="w-12 bg-[#F5A300] text-[#131921] flex items-center justify-center"
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
                className="text-sm font-bold text-[#F5A300] shrink-0 px-1"
              >
                Cancel
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-70px)] bg-white dark:bg-[#0D1F2C] text-[#0F1111] dark:text-[#E7DCC4]">
              {searchLoading && (
                <div className="px-4 py-4 text-sm text-[#565959]">Searching…</div>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 border-b border-[#E7E7E7] dark:border-[#2a3d4d]"
                    >
                      <img
                        src={safeImage(product.images)}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover border border-[#D5D9D9]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm font-bold text-[#B12704]">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
