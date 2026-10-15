import { API_BASE } from "@/src/lib/constants";
import { mapProduct, mapCategory } from "@/src/lib/api";
import type {
  ApiResponse,
  BackendProduct,
  BackendCategory,
  PromoBannerData,
  RecentReview,
  ProductListResult,
  ReviewsResult,
} from "@/src/lib/api";
import type { Product, Category } from "@/src/types/product";
import {
  parseShopFilters,
  buildShopSwrKey,
  categorySlugMapByName,
  type ShopUrlParams,
} from "@/src/lib/shop-query";

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
// Matches the backend's `@CacheTTL(60)` on `GET /products` (products.controller.ts).
const PRODUCTS_REVALIDATE = 60;

async function getJson<T>(url: string, revalidateSeconds: number = REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${url}`, { next: { revalidate: revalidateSeconds } });
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

/** Flat category list, shared by Home/Shop/Product SSR fetches so they all
 * hit the same Next data-cache entry instead of near-duplicate fetches. */
export async function getCategoriesList(): Promise<Category[]> {
  const res = await getJson<ApiResponse<BackendCategory[]>>("/categories");
  return (res?.data ?? []).map(mapCategory);
}

export async function getCategoriesTree(): Promise<Category[]> {
  const res = await getJson<ApiResponse<BackendCategory[]>>("/categories?tree=true");
  return (res?.data ?? []).map(mapCategory);
}

function emptyProductList(page: number): ProductListResult {
  return { products: [], total: 0, page, limit: 12, totalPages: 0 };
}

export interface ShopData {
  categories: Category[];
  products: ProductListResult;
  swrKey: string | null;
}

const SHOP_ITEMS_PER_PAGE = 12;

/** Server-side counterpart of ShopPageClient's client fetch, using the same
 * shared src/lib/shop-query.ts logic so the SWR key matches exactly and
 * fallbackData actually hydrates instead of silently refetching. */
export async function getShopData(searchParams: ShopUrlParams): Promise<ShopData> {
  const categories = await getCategoriesList();
  const categorySlugByName = categorySlugMapByName(categories);
  const filters = parseShopFilters(searchParams);
  const swrKey = buildShopSwrKey(filters, categorySlugByName);

  if (!swrKey) {
    return { categories, products: emptyProductList(filters.page), swrKey: null };
  }

  const { selectedCategoryNames, priceRange, ratingParam, sort, page } = filters;
  const qs = new URLSearchParams();
  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number);
    if (!Number.isNaN(min)) qs.set("priceMin", String(min));
    if (!Number.isNaN(max)) qs.set("priceMax", String(max));
  }
  if (ratingParam) qs.set("minRating", String(parseInt(ratingParam, 10)));
  if (sort !== "popular") qs.set("sort", sort);
  if (page > 1) qs.set("page", String(page));
  qs.set("limit", String(SHOP_ITEMS_PER_PAGE));
  if (selectedCategoryNames.length > 1) {
    selectedCategoryNames
      .map((name) => categorySlugByName[name])
      .filter(Boolean)
      .forEach((slug) => qs.append("categories", slug));
  } else if (selectedCategoryNames.length === 1) {
    qs.set("category", categorySlugByName[selectedCategoryNames[0]]);
  }

  const res = await getJson<ApiResponse<BackendProduct[]>>(
    `/products?${qs.toString()}`,
    PRODUCTS_REVALIDATE
  );

  const products: ProductListResult = {
    products: (res?.data ?? []).map(mapProduct),
    total: res?.meta?.total ?? 0,
    page: res?.meta?.page ?? page,
    limit: res?.meta?.limit ?? SHOP_ITEMS_PER_PAGE,
    totalPages: res?.meta?.totalPages ?? 0,
  };

  return { categories, products, swrKey };
}

export async function fetchRelatedProductsForPage(slug: string): Promise<Product[]> {
  const res = await getJson<ApiResponse<BackendProduct[]>>(
    `/products/${encodeURIComponent(slug)}/related`,
    REVALIDATE
  );
  return (res?.data ?? []).map(mapProduct);
}

export async function fetchProductReviewsForPage(
  productId: string,
  page = 1
): Promise<ReviewsResult | null> {
  // Matches the backend's `@CacheTTL(60)` on `GET /products/:productId/reviews`.
  return getJson<ReviewsResult>(
    `/products/${encodeURIComponent(productId)}/reviews?page=${page}`,
    60
  );
}
