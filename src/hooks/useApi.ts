import useSWR from 'swr';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchCategories,
  fetchCategoryBySlug,
  fetchCategoryTree,
  fetchReviewsByProduct,
  fetchPromoBanner,
  fetchRecentReviews,
  type ProductQueryParams,
  type PromoBannerData,
  type RecentReview,
} from '@/src/lib/api';
import type { Product, Category } from '@/src/types/product';

// SWR has no `staleTime` option (that's TanStack Query) — a staleTime key was
// previously passed here and silently ignored. Freshness is governed by
// `dedupingInterval` (dedupes in-flight refetches) plus the revalidate flags.
const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  errorRetryCount: 2,
};

export function useProducts(params: ProductQueryParams = {}) {
  const key = `/products?${new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== 'popular')
      .map(([k, v]) => [k, String(v)])
  ).toString()}`;

  return useSWR(key, () => fetchProducts(params), {
    ...SWR_CONFIG,
    keepPreviousData: true,
  });
}

export function useFeaturedProducts(fallbackData?: Product[]) {
  return useSWR('/products/featured', () => fetchFeaturedProducts(), {
    ...SWR_CONFIG,
    fallbackData,
  });
}

export function useProduct(slug: string | null, fallbackData?: Product | null) {
  return useSWR(slug ? `/products/${slug}` : null, () => fetchProductBySlug(slug!), {
    ...SWR_CONFIG,
    keepPreviousData: true,
    fallbackData: fallbackData ?? undefined,
  });
}

export function useRelatedProducts(slug: string | null) {
  return useSWR(
    slug ? `/products/${slug}/related` : null,
    () => fetchRelatedProducts(slug!),
    { ...SWR_CONFIG, keepPreviousData: true }
  );
}

export function useCategories(fallbackData?: Category[]) {
  return useSWR('/categories', () => fetchCategories(), {
    ...SWR_CONFIG,
    fallbackData,
  });
}

export function useCategory(slug: string | null, fallbackData?: Category | null) {
  return useSWR(slug ? `/categories/${slug}` : null, () => fetchCategoryBySlug(slug!), {
    ...SWR_CONFIG,
    keepPreviousData: true,
    fallbackData: fallbackData ?? undefined,
  });
}

export function useCategoryTree() {
  return useSWR('/categories?tree=true', () => fetchCategoryTree(), {
    ...SWR_CONFIG,
  });
}

export function useProductReviews(productId: string | null, page = 1) {
  return useSWR(
    productId ? `/products/${productId}/reviews?page=${page}` : null,
    () => fetchReviewsByProduct(productId!, page),
    { ...SWR_CONFIG },
  );
}

export function usePromoBanner(fallbackData?: PromoBannerData | null) {
  return useSWR('/site-settings/promo_banner', () => fetchPromoBanner(), {
    ...SWR_CONFIG,
    fallbackData,
  });
}

export function useRecentReviews(fallbackData?: RecentReview[]) {
  return useSWR('/reviews/recent', () => fetchRecentReviews(), {
    ...SWR_CONFIG,
    fallbackData,
  });
}
