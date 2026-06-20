"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { categories } from "@/src/lib/constants";
import { MobileNav } from "./MobileNav";
import { useTheme } from "@/src/providers/ThemeProvider";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

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
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl shadow-sm border-b border-zinc-200 dark:border-zinc-700"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="relative z-10">
            <span className="font-serif text-2xl font-bold tracking-tight text-primary dark:text-primary-light">
              Cholo<span className="text-zinc-900 dark:text-zinc-100">Kini</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 transition-colors"
            >
              Shop All
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setCategoryOpen(true)}
              onMouseLeave={() => setCategoryOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 transition-colors">
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
                        className="block px-4 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/shop?sort=popular"
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 transition-colors"
            >
              Best Sellers
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-2"
                  >
                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3">
                      <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchQuery.trim()) {
                            window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                          }
                        }}
                        placeholder="Search products..."
                        className="flex-1 bg-transparent py-2.5 text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                        autoFocus
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
              className="hidden sm:flex p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
            >
              <Heart className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </Link>

            <Link
              href="/cart"
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
            >
              <motion.div
                animate={totalItems > 0 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <ShoppingBag className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              </motion.div>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>
        </div>
      </header>
      <div className="h-16 md:h-20" />

      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
