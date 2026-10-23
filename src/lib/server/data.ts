import { API_BASE } from "@/src/lib/constants";
import { mapProduct, mapCategory } from "@/src/lib/api";
import type {
  ApiResponse,
  BackendProduct,
  BackendCategory,
  PromoBannerData,
  RecentReview,
} from "@/src/lib/api";
import type { Product, Category } from "@/src/types/product";

/**
 * Server-only data fetchers for ISR'd pages.
 *
 * Every fetch here opts into the same revalidation window the backend uses
 * for its CDN cache (15s), so category product counts stay current. The first
 * request renders and caches the page; subsequent requests are served from the
 * Next data cache until it revalidates. A failed fetch degrades gracefully
 * (sections render their fallbacks) instead of failing the whole page.
 */

const REVALIDATE = 15;

/**
 * The home page is cached for a few seconds so visitors get it from the CDN
 * instead of waiting on four API calls. Its prices can lag an offer change by
 * up to this long; the product sections refetch on the client right after
 * load, and cart and checkout always re-price on the server.
 */
export const HOME_REVALIDATE = 10;

/**
 * Product and site-setting responses carry prices and offer state, so they
 * skip the cache unless the caller passes an explicit `revalidate`.
 */
async function getJson<T>(url: string, revalidate?: number): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${url}`, revalidate !== undefined
      ? { next: { revalidate } }
      : url.startsWith('/products') || url.startsWith('/site-settings')
        ? { cache: 'no-store' }
        : { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface HomeData {
  featured: Product[];
  categories: Category[];
  promo: PromoBannerData | null;
  reviews: RecentReview[];
}

/** Fetch every home-page section in parallel, once per HOME_REVALIDATE window. */
export async function getHomeData(): Promise<HomeData> {
  const [featured, categories, promo, reviews] = await Promise.all([
    getJson<ApiResponse<BackendProduct[]>>("/products/featured", HOME_REVALIDATE),
    getJson<ApiResponse<BackendCategory[]>>("/categories", HOME_REVALIDATE),
    getJson<ApiResponse<PromoBannerData>>("/site-settings/promo_banner", HOME_REVALIDATE),
    getJson<ApiResponse<RecentReview[]>>("/reviews/recent", HOME_REVALIDATE),
  ]);

  return {
    // Slice to what the sections actually render so the RSC payload stays small.
    featured: (featured?.data ?? []).map(mapProduct).slice(0, 8),
    categories: (categories?.data ?? []).map(mapCategory).slice(0, 6),
    promo: promo?.data ?? null,
    reviews: (reviews?.data ?? []).slice(0, 6),
  };
}

/**
 * Best-effort fetches for ISR'd product / category pages.
 * Returns null on 404 (→ notFound()) and throws on other failures
 * (→ client-side retry path), mirroring the previous client fetchers.
 */
export async function fetchProductForPage(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Product API error ${res.status}`);
  }
  const json = (await res.json()) as ApiResponse<BackendProduct>;
  return json?.data ? mapProduct(json.data) : null;
}

export async function fetchCategoryForPage(slug: string): Promise<Category | null> {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Category API error ${res.status}`);
  }
  const json = (await res.json()) as ApiResponse<BackendCategory>;
  return json?.data ? mapCategory(json.data) : null;
}
