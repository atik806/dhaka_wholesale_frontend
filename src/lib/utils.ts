import type { Category } from '@/src/types/product';

type ClassValue = string | number | bigint | false | null | undefined;

export function cn(...inputs: ClassValue[]) {
  return inputs.filter((v): v is string => typeof v === "string" && v.length > 0).join(" ");
}

// Intl renders BDT as the "BDT" code rather than the taka sign, so group the
// digits with Intl and prefix the symbol ourselves.
export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price)) return "৳0";
  return `৳${new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)}`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * H1 defense-in-depth: only render a URL as a clickable link when the scheme
 * is exactly http/https. Anything else (javascript:, data:, ...) must be shown
 * as plain text — React does not sanitize `javascript:` hrefs, so a malicious
 * page_url stored before this guard would otherwise become an anchor sink.
 */
export function isSafeHttpUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function safeImage(images: string[] | undefined | null, fallback = '/placeholder.svg'): string {
  return images?.[0] || fallback;
}

/** Neutral shimmer placeholder used for `next/image` blur-up while remote images load. */
export const IMAGE_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlMmUyZTIiLz48L3N2Zz4=";

export function groupCategoriesByParent(
  categories: Category[]
): { parents: Category[]; childrenByParentId: Record<string, Category[]>; ungrouped: Category[] } {
  const parents: Category[] = [];
  const childrenByParentId: Record<string, Category[]> = {};
  const ungrouped: Category[] = [];

  const parentMap = new Map<string, Category>();

  for (const cat of categories) {
    if (!cat.parentId) {
      parents.push(cat);
      parentMap.set(cat.id, cat);
    }
  }

  for (const cat of categories) {
    if (cat.parentId) {
      if (parentMap.has(cat.parentId)) {
        if (!childrenByParentId[cat.parentId]) {
          childrenByParentId[cat.parentId] = [];
        }
        childrenByParentId[cat.parentId].push(cat);
      } else {
        ungrouped.push(cat);
      }
    }
  }

  return { parents, childrenByParentId, ungrouped };
}


