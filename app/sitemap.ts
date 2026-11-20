import type { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "@/src/lib/api";
import { SITE_URL } from "@/src/lib/constants";

// Rebuilt daily so new products reach the sitemap without a redeploy.
// Route segment config must be a literal.
export const revalidate = 86400;

/** The products API returns at most 100 per page. */
const PAGE_LIMIT = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/shipping-returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/size-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const categories = await fetchCategories();
    categoryRoutes = categories.map((c) => ({
      url: `${SITE_URL}/shop/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // API unavailable at build time — static routes still ship
  }

  try {
    const first = await fetchProducts({ limit: PAGE_LIMIT, page: 1 });
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) =>
        fetchProducts({ limit: PAGE_LIMIT, page: i + 2 }),
      ),
    );
    const products = [first, ...rest].flatMap((r) => r.products);
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // API unavailable at build time — static routes still ship
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
