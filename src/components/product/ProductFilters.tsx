"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X, Star, Filter } from "lucide-react";
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
      className={`flex-shrink-0 w-4 h-4 rounded-[2px] border transition-colors duration-150 flex items-center justify-center ${
        checked
          ? "bg-[#F5A300] border-[#D88900] text-[#132A3A] dark:text-[#E7DCC4]"
          : "bg-white dark:bg-[#132A3A] border-[#E7DCC4] dark:border-[#2a3d4d]"
      }`}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-[#132A3A] dark:text-[#E7DCC4]"
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
      className={`flex-shrink-0 w-4 h-4 rounded-full border transition-colors duration-150 flex items-center justify-center ${
        checked
          ? "border-[#F5A300] bg-[#132A3A] dark:bg-[#0A1A28]"
          : "bg-white dark:bg-[#132A3A] border-[#E7DCC4] dark:border-[#2a3d4d]"
      }`}
    >
      {checked && (
        <div className="w-2 h-2 rounded-full bg-[#F5A300]" />
      )}
    </button>
  );
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
    <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#F5A300]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] dark:text-[#E7DCC4]">
            Market Filters
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-[2px] border border-[#BE3D1F] text-[#BE3D1F] hover:bg-[#BE3D1F] hover:text-white transition-colors uppercase"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-[2px] hover:bg-[#FBF6EC] dark:hover:bg-[#0D1F2C] transition-colors md:hidden text-[#132A3A] dark:text-[#E7DCC4]"
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
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5"
            >
              <CustomCheckbox
                checked={filters.categories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
              />
              <span className="text-xs font-sans font-medium text-[#1C1A17] dark:text-[#E7DCC4] group-hover:text-[#F5A300] transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Unit Price Tier (BDT)"
        expanded={expandedSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5"
            >
              <CustomRadio
                checked={filters.priceRange === range.value}
                onChange={() => setPrice(range.value)}
              />
              <span className="font-mono text-xs text-[#1C1A17] dark:text-[#E7DCC4] group-hover:text-[#F5A300] transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Verified Merchant Rating"
        expanded={expandedSections.rating}
        onToggle={() => toggleSection("rating")}
      >
        <div className="space-y-2">
          {[4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5"
            >
              <CustomRadio
                checked={filters.rating === star}
                onChange={() => setRating(star)}
              />
              <span className="flex items-center gap-1 font-mono text-xs text-[#1C1A17] dark:text-[#E7DCC4] group-hover:text-[#F5A300] transition-colors">
                {Array.from({ length: star }, (_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-[#F5A300] text-[#F5A300]"
                  />
                ))}
                <span className="ml-1 font-bold">{star}+ Stars</span>
              </span>
            </label>
          ))}
          <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
            <CustomRadio
              checked={filters.rating === null}
              onChange={() => setRating(null)}
            />
            <span className="font-mono text-xs text-[#1C1A17] dark:text-[#E7DCC4] group-hover:text-[#F5A300] transition-colors">
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
    <div className="border-b border-[#E7DCC4] dark:border-[#2a3d4d] pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-1 font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4]"
      >
        {title}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-[#F5A300]" />
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
