"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronRight, Package, Sparkles, TrendingUp, X } from "lucide-react";
import { useCategories } from "@/src/hooks/useApi";
import { useDepartmentsStore } from "@/src/store/useDepartmentsStore";
import { safeImage } from "@/src/lib/utils";

const QUICK_LINKS = [
  { href: "/shop", label: "All shop", icon: Package },
  { href: "/shop?sort=newest", label: "New in", icon: Sparkles },
  { href: "/shop?sort=popular", label: "Bestsellers", icon: TrendingUp },
];

const isCompact = () => window.matchMedia("(max-width: 1023px)").matches;

export function DepartmentsPanel() {
  const pathname = usePathname();
  const { data: categories = [], isLoading } = useCategories();
  const open = useDepartmentsStore((s) => s.open);
  const setOpen = useDepartmentsStore((s) => s.setOpen);
  const toggleDepartments = useDepartmentsStore((s) => s.toggleDepartments);
  const closeDepartments = useDepartmentsStore((s) => s.closeDepartments);
  // The drawer and the rail render the same markup, so only mount one of them —
  // otherwise every category link is duplicated in the accessibility tree.
  const [isDesktop, setIsDesktop] = useState(false);

  // Desktop keeps the rail open by default; small screens use the drawer.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setOpen(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [setOpen]);

  useEffect(() => {
    if (isCompact()) closeDepartments();
  }, [pathname, closeDepartments]);

  useEffect(() => {
    if (!open || !isCompact()) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeIfCompact = () => {
    if (isCompact()) closeDepartments();
  };

  const panelInner = (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center gap-3 bg-brand px-4 py-3.5 text-white shrink-0">
        <button
          type="button"
          onClick={toggleDepartments}
          className="p-1 -ml-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label={open ? "Collapse categories" : "Expand categories"}
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="label-caps text-[13px] tracking-widest">Categories</span>
        <button
          type="button"
          onClick={closeDepartments}
          className="ml-auto p-1 -mr-1 rounded-md hover:bg-white/10 transition-colors lg:hidden"
          aria-label="Close categories"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="grid grid-cols-3 gap-2 p-3">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={closeIfCompact}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-3 text-center hover:border-accent hover:bg-surface-2 transition-colors"
            >
              <Icon className="w-[18px] h-[18px] text-link" />
              <span className="text-[11px] font-semibold leading-tight text-fg">{label}</span>
            </Link>
          ))}
        </div>

        <p className="label-caps px-4 py-2.5 text-subtle border-y border-line bg-surface-2">
          Shop by category
        </p>

        <nav aria-label="Categories">
          {isLoading && (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="shimmer w-9 h-9 rounded-md shrink-0" />
                  <div className="shimmer h-3.5 flex-1 rounded" />
                </div>
              ))}
            </div>
          )}
          {!isLoading && categories.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted">No categories yet.</p>
          )}
          <ul className="divide-y divide-line">
            {categories.map((cat) => {
              const active = pathname === `/shop/${cat.slug}`;
              return (
                <li key={cat.id}>
                  <Link
                    href={`/shop/${cat.slug}`}
                    onClick={closeIfCompact}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      active
                        ? "bg-accent-soft border-l-[3px] border-l-accent pl-[13px]"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    <span className="relative w-9 h-9 shrink-0 rounded-md overflow-hidden bg-surface-2 border border-line">
                      <Image
                        src={safeImage(cat.image ? [cat.image] : [])}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-[13px] leading-tight truncate ${
                          active ? "font-bold text-fg" : "font-medium text-fg"
                        }`}
                      >
                        {cat.name}
                      </span>
                      <span className="block text-[11px] text-subtle tabular">
                        {cat.productCount ?? 0} items
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-subtle shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="p-3 border-t border-line shrink-0">
        <Link
          href="/contact"
          onClick={closeIfCompact}
          className="flex w-full items-center justify-center rounded-md bg-brand hover:bg-brand-hover text-white text-sm font-semibold h-11 transition-colors"
        >
          Request a product
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Edge tab so categories stay reachable on small screens */}
      <button
        type="button"
        onClick={toggleDepartments}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-[45] flex items-center rounded-r-md bg-brand text-white shadow-lg px-1.5 py-4 transition-opacity lg:hidden ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Open categories"
      >
        <span
          className="label-caps text-[10px] tracking-widest"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Categories
        </span>
      </button>

      <AnimatePresence>
        {open && !isDesktop && (
          <>
            <motion.button
              type="button"
              aria-label="Close categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/50 lg:hidden"
              onClick={closeDepartments}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-[min(100vw-3rem,20rem)] shadow-xl lg:hidden"
            >
              {panelInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Persistent desktop rail */}
      <aside
        id="categories-panel"
        className={`hidden lg:flex shrink-0 sticky top-[6.25rem] z-30 h-[calc(100dvh-6.25rem)] border-r border-line bg-surface transition-[width] duration-300 ease-out overflow-hidden ${
          open ? "w-[264px]" : "w-11"
        }`}
        aria-label="Categories"
      >
        {open ? (
          <div className="w-[264px] h-full">{panelInner}</div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-11 h-full flex flex-col items-center justify-center gap-3 bg-brand text-white hover:bg-brand-hover transition-colors"
            aria-label="Expand categories"
          >
            <Menu className="w-5 h-5" />
            <span
              className="label-caps text-[10px] tracking-widest"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Categories
            </span>
          </button>
        )}
      </aside>
    </>
  );
}
