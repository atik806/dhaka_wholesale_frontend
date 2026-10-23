"use client";

import { useId, useState } from "react";
import Image from "@/src/components/ui/Image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { countCategoryProducts } from "@/src/lib/category-tree";
import { cn, IMAGE_BLUR_PLACEHOLDER } from "@/src/lib/utils";
import type { Category } from "@/src/types/product";

interface CategoryNavigationProps {
  categories: Category[];
  onNavigate: () => void;
  showImages?: boolean;
}

export function CategoryNavigation({ categories, onNavigate, showImages = true }: CategoryNavigationProps) {
  return (
    <ul className="divide-y divide-line">
      {categories.map((category) => (
        <CategoryBranch key={category.id} category={category} onNavigate={onNavigate} showImages={showImages} ancestors={[]} />
      ))}
    </ul>
  );
}

function CategoryBranch({ category, onNavigate, showImages, ancestors }: {
  category: Category;
  onNavigate: () => void;
  showImages: boolean;
  ancestors: string[];
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const listId = useId();
  const children = (category.children ?? []).filter((child) => !ancestors.includes(child.id) && child.id !== category.id);
  const hasChildren = children.length > 0;
  const active = pathname === `/shop/${category.slug}`;
  const total = countCategoryProducts(category);
  const depth = ancestors.length;

  return (
    <li>
      <div className={cn("flex items-stretch", active ? "bg-accent-soft" : "hover:bg-surface-2")}>
        <Link
          href={`/shop/${category.slug}`}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn("flex min-w-0 flex-1 items-center gap-3 py-2.5 pr-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent", active && "border-l-[3px] border-accent")}
          style={{ paddingLeft: `${(showImages ? 16 : 12) + depth * 20 - (active ? 3 : 0)}px` }}
        >
          {showImages && depth === 0 && (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-line bg-surface-2">
              <Image src={category.image || "/placeholder.svg"} alt="" fill placeholder="blur" blurDataURL={IMAGE_BLUR_PLACEHOLDER} className="object-cover" sizes="36px" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className={cn("block text-[13px] leading-tight text-fg", depth === 0 || active ? "font-bold" : "font-medium")}>{category.name}</span>
            <span className="mt-0.5 block text-[11px] text-subtle tabular">{total} {total === 1 ? "item" : "items"}</span>
          </span>
          {!hasChildren && <ChevronRight className="h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={listId}
            aria-label={`${expanded ? "Hide" : "Show"} subcategories of ${category.name}`}
            className="flex min-h-11 w-11 shrink-0 items-center justify-center text-subtle hover:bg-surface-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", !expanded && "-rotate-90")} aria-hidden="true" />
          </button>
        )}
      </div>
      {hasChildren && (
        <ul id={listId} hidden={!expanded} className="border-t border-line">
          {children.map((child) => (
            <CategoryBranch key={child.id} category={child} onNavigate={onNavigate} showImages={showImages} ancestors={[...ancestors, category.id]} />
          ))}
        </ul>
      )}
    </li>
  );
}
