import { API_BASE } from "@/src/lib/constants";
import { mapProduct, mapCategory } from "@/src/lib/api";
import type { ProductListResult } from "@/src/lib/api";
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
 * Every fetch is tagged STORE_TAG. Pages are rebuilt at most every
 * PAGE_REVALIDATE seconds, and an admin edit expires the tag at once (see
 * app/admin/actions.ts), so changes still show immediately while idle pages
 * stop rebuilding every few seconds, which was most of the Vercel CPU use.
 * A failed fetch degrades gracefully (sections render their fallbacks)
 * instead of failing the whole page.
 */

/** Tag on every storefront fetch; expiring it refreshes every store page. */
export const STORE_TAG = "store";

/**
 * Home, shop and category pages. Admin edits expire STORE_TAG at once, so this
 * timer only catches changes made outside the admin panel. Short timers let
 * crawlers trigger a rebuild (and backend calls) on nearly every visit, which
 * used most of the Vercel CPU. Server-rendered prices can lag an offer start
 * or end, but SWR re-fetches them in the browser on mount, OfferPriceSync
 * refreshes them at offer boundaries, and cart and checkout always re-price on
 * the server. Route segment configs must repeat this as a literal.
 */
export const PAGE_REVALIDATE = 3600;

/** Product pages; same trade-off as PAGE_REVALIDATE. */
export const PRODUCT_REVALIDATE = 3600;

async function getJson<T>(url: string, revalidate = PAGE_REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${url}`, { next: { revalidate, tags: [STORE_TAG] } });
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

/** Fetch every home-page section in parallel, once per PAGE_REVALIDATE window. */
export async function getHomeData(): Promise<HomeData> {
  const [featured, categories, promo, reviews] = await Promise.all([
    getJson<ApiResponse<BackendProduct[]>>("/products/featured"),
    getJson<ApiResponse<BackendCategory[]>>("/categories"),
    getJson<ApiResponse<PromoBannerData>>("/site-settings/promo_banner"),
    getJson<ApiResponse<RecentReview[]>>("/reviews/recent"),
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
 * First page of a product listing (whole shop, or one category) for the
 * server render, so products arrive with the page instead of after a
 * client fetch. Cached for PAGE_REVALIDATE with the same price trade-off as
 * the home page. Null on failure, in which case the client fetches as before.
 */
export async function getProductListPage(
  category: string | undefined,
  limit: number,
): Promise<ProductListResult | null> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (category) qs.set("category", category);
  const res = await getJson<ApiResponse<BackendProduct[]>>(`/products?${qs}`);
  if (!res) return null;
  return {
    products: (res.data ?? []).map(mapProduct),
    total: res.meta?.total || 0,
    page: res.meta?.page || 1,
    limit: res.meta?.limit || limit,
    totalPages: res.meta?.totalPages || 0,
  };
}

/**
 * Best-effort fetches for ISR'd product / category pages.
 * Returns null on 404 (→ notFound()) and throws on other failures
 * (→ client-side retry path), mirroring the previous client fetchers.
 */
export async function fetchProductForPage(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
    next: { revalidate: PRODUCT_REVALIDATE, tags: [STORE_TAG] },
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
    next: { revalidate: PAGE_REVALIDATE, tags: [STORE_TAG] },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Category API error ${res.status}`);
  }
  const json = (await res.json()) as ApiResponse<BackendCategory>;
  return json?.data ? mapCategory(json.data) : null;
}
