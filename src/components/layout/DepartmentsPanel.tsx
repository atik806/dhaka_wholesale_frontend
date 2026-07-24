"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronRight,
  Package,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useCategories } from "@/src/hooks/useApi";
import { useDepartmentsStore } from "@/src/store/useDepartmentsStore";
import { safeImage } from "@/src/lib/utils";

const QUICK_LINKS = [
  { href: "/shop", label: "All Shop", icon: Package },
  { href: "/shop?sort=newest", label: "New In", icon: Sparkles },
  { href: "/shop?sort=popular", label: "Bestsellers", icon: TrendingUp },
];

export function DepartmentsPanel() {
  const pathname = usePathname();
  const { data: categories = [], isLoading } = useCategories();
  const open = useDepartmentsStore((s) => s.open);
  const setOpen = useDepartmentsStore((s) => s.setOpen);
  const toggleDepartments = useDepartmentsStore((s) => s.toggleDepartments);
  const closeDepartments = useDepartmentsStore((s) => s.closeDepartments);

  // Desktop: keep departments open by default (Wholesale Club–style persistence)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (mq.matches) setOpen(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [setOpen]);

  // Close overlay drawer after navigation on small screens only
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      closeDepartments();
    }
  }, [pathname, closeDepartments]);

  useEffect(() => {
    if (!open || window.matchMedia("(min-width: 1024px)").matches) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const panelInner = (
    <div className="flex h-full flex-col bg-white dark:bg-[#0D1F2C] text-[#1C1A17] dark:text-[#E7DCC4]">
      {/* Header — matches Wholesale Club DEPARTMENTS bar */}
      <div className="flex items-center gap-3 bg-[#132A3A] px-4 py-3.5 text-white shrink-0">
        <button
          type="button"
          onClick={toggleDepartments}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label={open ? "Collapse departments" : "Expand departments"}
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold uppercase tracking-wide text-sm sm:text-base">
          Departments
        </span>
        <button
          type="button"
          onClick={closeDepartments}
          className="ml-auto p-1 rounded hover:bg-white/10 transition-colors lg:hidden"
          aria-label="Close departments"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Quick links row */}
        <div className="grid grid-cols-3 gap-2 p-3 border-b border-[#E8E8E8] dark:border-[#2a3d4d]">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => {
                if (window.matchMedia("(max-width: 1023px)").matches) {
                  closeDepartments();
                }
              }}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-[#132A3A]/25 dark:border-[#E7DCC4]/25 bg-white dark:bg-[#132A3A] px-2 py-3 text-center hover:border-[#F5A300] hover:shadow-sm transition-colors"
            >
              <Icon className="w-5 h-5 text-[#132A3A] dark:text-[#F5A300]" />
              <span className="text-[11px] font-semibold leading-tight text-[#1C1A17] dark:text-[#E7DCC4]">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Featured strip */}
        <div className="px-4 py-3 text-center border-b border-[#E8E8E8] dark:border-[#2a3d4d] bg-[#FAFAFA] dark:bg-[#071520]">
          <p className="text-sm font-bold text-[#BE3D1F]">Monthly Essential Items</p>
        </div>

        {/* Category list */}
        <nav aria-label="Departments">
          {isLoading && (
            <p className="px-4 py-6 text-sm text-[#565959]">Loading departments…</p>
          )}
          {!isLoading && categories.length === 0 && (
            <p className="px-4 py-6 text-sm text-[#565959]">No departments yet.</p>
          )}
          <ul>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/shop/${cat.slug}`}
                  onClick={() => {
                    if (window.matchMedia("(max-width: 1023px)").matches) {
                      closeDepartments();
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#EEEEEE] dark:border-[#2a3d4d] hover:bg-[#F7F8F8] dark:hover:bg-[#132A3A] transition-colors"
                >
                  <span className="relative w-9 h-9 shrink-0 rounded-md overflow-hidden bg-[#F3F3F3] dark:bg-[#071520] border border-[#E8E8E8] dark:border-[#2a3d4d]">
                    <Image
                      src={safeImage(cat.image ? [cat.image] : [])}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-[#444] dark:text-[#E7DCC4] truncate">
                      {cat.name}
                    </span>
                    <span className="block text-[11px] text-[#888] dark:text-[#a0b4c4]">
                      {cat.productCount ?? 0} items
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#AAA] shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="p-3 border-t border-[#E8E8E8] dark:border-[#2a3d4d] shrink-0">
        <Link
          href="/contact"
          onClick={() => {
            if (window.matchMedia("(max-width: 1023px)").matches) {
              closeDepartments();
            }
          }}
          className="flex w-full items-center justify-center rounded-md bg-[#132A3A] hover:bg-[#0D1F2C] text-white text-sm font-semibold py-3 transition-colors"
        >
          Product Request
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Always-visible edge tab (mobile + when desktop panel closed) */}
      <button
        type="button"
        onClick={toggleDepartments}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-[45] flex items-center rounded-r-md bg-[#132A3A] text-white shadow-lg px-2 py-4 transition-opacity lg:hidden ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Open departments"
      >
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Departments
        </span>
      </button>

      {/* Mobile / tablet overlay drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close departments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/45 lg:hidden"
              onClick={closeDepartments}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-[min(100vw-3rem,20rem)] shadow-2xl lg:hidden"
            >
              {panelInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop persistent sidebar — stays in view under the sticky header */}
      <aside
        id="departments-panel"
        className={`hidden lg:flex shrink-0 sticky top-[6.25rem] z-30 h-[calc(100dvh-6.25rem)] border-r border-[#E8E8E8] dark:border-[#2a3d4d] bg-white dark:bg-[#0D1F2C] transition-[width] duration-300 ease-out overflow-hidden ${
          open ? "w-[280px]" : "w-12"
        }`}
        aria-label="Departments"
      >
        {open ? (
          <div className="w-[280px] h-full">{panelInner}</div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-12 h-full flex flex-col items-center justify-center gap-3 bg-[#132A3A] text-white hover:bg-[#0D1F2C] transition-colors"
            aria-label="Expand departments"
          >
            <Menu className="w-5 h-5" />
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Departments
            </span>
          </button>
        )}
      </aside>
    </>
  );
}
