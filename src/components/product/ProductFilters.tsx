"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Star, SlidersHorizontal } from "lucide-react";
import { useCategories } from "@/src/hooks/useApi";
import { priceRanges } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";

export interface FilterState {
  categories: string[];
  priceRange: string;
  rating: number | null;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose?: () => void;
  /** Drops the card chrome — use when rendering inside a modal or sheet. */
  bare?: boolean;
}

export function countActiveFilters(filters: FilterState) {
  return (
    filters.categories.length +
    (filters.priceRange !== "all" ? 1 : 0) +
    (filters.rating !== null ? 1 : 0)
  );
}

function CustomCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-sm border transition-colors duration-150",
        checked
          ? "border-accent bg-accent text-accent-fg"
          : "border-line-strong bg-surface",
      )}
    >
      {checked && (
        <svg
          className="h-3 w-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2 6 5 9 10 3" />
        </svg>
      )}
    </button>
  );
}

function CustomRadio({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
        checked ? "border-accent bg-surface" : "border-line-strong bg-surface",
      )}
    >
      {checked && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
    </button>
  );
}

export function ProductFilters({
  filters,
  onChange,
  onClose,
  bare = false,
}: ProductFiltersProps) {
  const { data: categories = [] } = useCategories();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    rating: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const setPrice = (value: string) => {
    onChange({ ...filters, priceRange: value });
  };

  const setRating = (rating: number | null) => {
    onChange({ ...filters, rating });
  };

  const clearAll = () => {
    onChange({ categories: [], priceRange: "all", rating: null });
  };

  const activeCount = countActiveFilters(filters);

  return (
    <div
      className={cn(
        !bare && "rounded-lg border border-line bg-surface p-4 sm:p-5",
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-subtle" />
          <span className="text-sm font-bold text-fg">Filters</span>
          {activeCount > 0 && (
            <span className="tabular inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-fg">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-sm px-2 py-1 text-[12px] font-semibold text-danger transition-colors hover:bg-danger-soft"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-2 hover:text-fg xl:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <FilterSection
        title="Category"
        expanded={expandedSections.category}
        onToggle={() => toggleSection("category")}
      >
        <div className="space-y-1">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="group flex cursor-pointer items-center gap-2.5 py-1"
            >
              <CustomCheckbox
                checked={filters.categories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
              />
              <span className="text-[13px] text-fg transition-colors group-hover:text-accent-hover">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Price"
        expanded={expandedSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-1">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="group flex cursor-pointer items-center gap-2.5 py-1"
            >
              <CustomRadio
                checked={filters.priceRange === range.value}
                onChange={() => setPrice(range.value)}
              />
              <span className="tabular text-[13px] text-fg transition-colors group-hover:text-accent-hover">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Customer rating"
        expanded={expandedSections.rating}
        onToggle={() => toggleSection("rating")}
        last
      >
        <div className="space-y-1">
          {[4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="group flex cursor-pointer items-center gap-2.5 py-1"
            >
              <CustomRadio
                checked={filters.rating === star}
                onChange={() => setRating(star)}
              />
              <span className="flex items-center gap-1.5 text-[13px] text-fg transition-colors group-hover:text-accent-hover">
                <span className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < star
                          ? "fill-accent text-accent"
                          : "fill-surface-3 text-surface-3",
                      )}
                    />
                  ))}
                </span>
                <span className="tabular font-semibold">{star}+</span>
              </span>
            </label>
          ))}
          <label className="group flex cursor-pointer items-center gap-2.5 py-1">
            <CustomRadio
              checked={filters.rating === null}
              onChange={() => setRating(null)}
            />
            <span className="text-[13px] text-fg transition-colors group-hover:text-accent-hover">
              Any rating
            </span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
  last = false,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn(!last && "border-b border-line")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 py-3 text-left"
      >
        <span className="label-caps text-muted">{title}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-subtle"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
