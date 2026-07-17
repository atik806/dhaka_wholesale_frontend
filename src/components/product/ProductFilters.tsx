"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useCategories } from "@/src/hooks/useApi";
import { priceRanges } from "@/src/lib/constants";

interface FilterState {
  categories: string[];
  priceRange: string;
  rating: number | null;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose?: () => void;
}

export function ProductFilters({ filters, onChange, onClose }: ProductFiltersProps) {
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

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange !== "all" ||
    filters.rating !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-semibold text-sm">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-100 transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <FilterSection
        title="Category"
        expanded={expandedSections.category}
        onToggle={() => toggleSection("category")}
      >
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-primary dark:text-primary-light focus:ring-primary/30"
              />
              <span className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Price Range"
        expanded={expandedSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-1.5">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="price"
                checked={filters.priceRange === range.value}
                onChange={() => setPrice(range.value)}
                className="w-4 h-4 border-zinc-300 dark:border-zinc-600 text-primary dark:text-primary-light focus:ring-primary/30"
              />
              <span className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Minimum Rating"
        expanded={expandedSections.rating}
        onToggle={() => toggleSection("rating")}
      >
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === star}
                onChange={() => setRating(star)}
                className="w-4 h-4 border-zinc-300 dark:border-zinc-600 text-primary dark:text-primary-light focus:ring-primary/30"
              />
              <span className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                {star}+ Stars
              </span>
            </label>
          ))}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              checked={filters.rating === null}
              onChange={() => setRating(null)}
              className="w-4 h-4 border-zinc-300 dark:border-zinc-600 text-primary dark:text-primary-light focus:ring-primary/30"
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              Any Rating
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
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-1 text-sm font-medium"
      >
        {title}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        </motion.div>
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
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
