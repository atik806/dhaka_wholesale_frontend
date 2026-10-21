"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Package, Sparkles, TrendingUp, X } from "lucide-react";
import { useCategoryTree, useCategories } from "@/src/hooks/useApi";
import { useDepartmentsStore } from "@/src/store/useDepartmentsStore";
import { buildCategoryTree } from "@/src/lib/category-tree";
import { CategoryNavigation } from "./CategoryNavigation";

const QUICK_LINKS = [
  { href: "/shop", label: "All shop", icon: Package },
  { href: "/shop?sort=newest", label: "New in", icon: Sparkles },
  { href: "/shop?sort=popular", label: "Bestsellers", icon: TrendingUp },
];

const isCompact = () => window.matchMedia("(max-width: 1023px)").matches;

export function DepartmentsPanel() {
  const pathname = usePathname();
  const { data: categories = [], isLoading } = useCategories();
  const { data: categoryTree = [] } = useCategoryTree();
  const open = useDepartmentsStore((s) => s.open);
  const setOpen = useDepartmentsStore((s) => s.setOpen);
  const toggleDepartments = useDepartmentsStore((s) => s.toggleDepartments);
  const closeDepartments = useDepartmentsStore((s) => s.closeDepartments);
  // The drawer and the rail render the same markup, so only mount one of them —
  // otherwise every category link is duplicated in the accessibility tree.
  const [isDesktop, setIsDesktop] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

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
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') ?? []).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDepartments();
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, isDesktop, closeDepartments]);

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
          <CategoryNavigation
            categories={categoryTree.length ? categoryTree : buildCategoryTree(categories)}
            onNavigate={closeIfCompact}
          />
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
      <AnimatePresence>
        {open && !isDesktop && (
          <motion.button
            key="overlay"
            type="button"
            aria-label="Close categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/50 lg:hidden"
            onClick={closeDepartments}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && !isDesktop && (
          <motion.aside
            key="panel"
            ref={drawerRef}
            id="mobile-categories-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Category menu"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed left-0 top-0 bottom-0 z-[60] w-[min(100vw-3rem,20rem)] shadow-xl lg:hidden"
          >
            {panelInner}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Persistent desktop rail */}
      {isDesktop && <aside
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
      </aside>}
    </>
  );
}
