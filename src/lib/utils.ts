import type { Category, Product, ProductColor } from '@/src/types/product';

type ClassValue = string | number | bigint | false | null | undefined;

export function cn(...inputs: ClassValue[]) {
  return inputs.filter((v): v is string => typeof v === "string" && v.length > 0).join(" ");
}

/**
 * Fill for a colour swatch. Admin stores one hex per colour, so a colour
 * named "Multicolor" is drawn as a colour wheel instead.
 */
export function swatchStyle(color: ProductColor): { background: string } {
  return /multi/i.test(color.name)
    ? { background: "conic-gradient(#e5484d, #f5a623, #f6e27a, #46a758, #3e8ed0, #9b6ad6, #e5484d)" }
    : { background: color.hex };
}

// Intl renders BDT as the "BDT" code rather than the taka sign, so group the
// digits with Intl and prefix the symbol ourselves.
export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price)) return "৳0";
  return `৳${new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
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

/**
 * Sanitize a DB-backed promo `button_link` before it becomes an `<a href>`.
 * Unlike `isSafeHttpUrl`, same-site paths beginning with "/" are valid promo
 * targets (e.g. "/shop", "/collections/sale"). Anything else — `javascript:`,
 * `data:`, `ftp:`, protocol-relative `//host` — is not a clickable vector here,
 * so it drops back to "/shop".
 */
export function safePromoLink(link: string | null | undefined): string {
  if (typeof link !== "string" || link.length === 0) return "/shop";
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  try {
    const parsed = new URL(link);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return link;
    }
  } catch {
    /* not parseable as a URL — fall through to default */
  }
  return "/shop";
}

/**
 * Serialize an object for embedding inside a `<script type="application/ld+json">`
 * tag. `JSON.stringify` leaves `<`, `>` and `&` intact, so a value containing
 * `</script>` (e.g. a product name/description authored in the admin) would
 * otherwise break out of the tag and become an XSS sink. Escaping these three
 * to their `\uXXXX` forms keeps the payload valid JSON while making tag/comment
 * breakout impossible.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/** Index of the photo linked to a colour, or -1 when it has none. */
export function colorImageIndex(product: Pick<Product, 'images' | 'variants'>, color?: string): number {
  const image = product.variants?.colors?.find((c) => c.name === color)?.image;
  return image ? product.images.indexOf(image) : -1;
}

/** Thumbnail for a cart line: the chosen colour's photo, else the first photo. */
export function variantImage(product: Pick<Product, 'images' | 'variants'>, color?: string): string {
  const index = colorImageIndex(product, color);
  return index >= 0 ? product.images[index] : safeImage(product.images);
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


