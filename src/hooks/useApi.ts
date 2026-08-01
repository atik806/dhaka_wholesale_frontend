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
} from '@/src/lib/api';
import type { Product, Category } from '@/src/types/product';

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  errorRetryCount: 2,
  staleTime: 30000,
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

export function useFeaturedProducts() {
  return useSWR('/products/featured', () => fetchFeaturedProducts(), {
    ...SWR_CONFIG,
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

export function useCategories() {
  return useSWR('/categories', () => fetchCategories(), {
    ...SWR_CONFIG,
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

export function usePromoBanner() {
  return useSWR('/site-settings/promo_banner', () => fetchPromoBanner(), {
    ...SWR_CONFIG,
    staleTime: 300000,
  });
}

export function useRecentReviews() {
  return useSWR('/reviews/recent', () => fetchRecentReviews(), {
    ...SWR_CONFIG,
    staleTime: 120000,
  });
}
