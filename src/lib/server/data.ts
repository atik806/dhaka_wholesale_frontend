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
 * Catalog data changes slowly, so every fetch here opts into the same
 * revalidation window the backend uses for its HTTP cache (300s). The first
 * request renders and caches the page; subsequent requests are served from the
 * Next data cache until it revalidates. A failed fetch degrades gracefully
 * (sections render their fallbacks) instead of failing the whole page.
 */

const REVALIDATE = 300;

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${url}`, { next: { revalidate: REVALIDATE } });
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

/** Fetch every home-page section in parallel, once per ISR revalidation. */
export async function getHomeData(): Promise<HomeData> {
  const [featured, categories, promo, reviews] = await Promise.all([
    getJson<ApiResponse<BackendProduct[]>>("/products/featured"),
    getJson<ApiResponse<BackendCategory[]>>("/categories"),
    getJson<PromoBannerData>("/site-settings/promo_banner"),
    getJson<ApiResponse<RecentReview[]>>("/reviews/recent"),
  ]);

  return {
    // Slice to what the sections actually render so the RSC payload stays small.
    featured: (featured?.data ?? []).map(mapProduct).slice(0, 8),
    categories: (categories?.data ?? []).map(mapCategory).slice(0, 6),
    // The banner endpoint returns its payload directly (not wrapped in `data`);
    // keep the raw shape so the client component's own normalization still applies.
    promo,
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
    next: { revalidate: REVALIDATE },
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
