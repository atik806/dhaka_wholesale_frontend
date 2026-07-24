import type { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "@/src/lib/api";

const SITE_URL = "https://dhakawholesale.com";

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
    const { products } = await fetchProducts({ limit: 500, page: 1 });
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
