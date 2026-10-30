import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchCategoryForPage, getProductListPage } from "@/src/lib/server/data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/constants";
import { CategoryPageClient } from "./CategoryPageClient";
import type { Category } from "@/src/types/product";

// Rebuilt at most every hour (PAGE_REVALIDATE) and right after an admin edit:
// the page carries its first page of products, which have prices. Route
// segment config must be a literal.
export const revalidate = 3600;

// No paths at build time; each category page is cached on its first visit
// instead of rendering on every request.
export async function generateStaticParams() {
  return [];
}

/** Products per page; must match CategoryPageClient so the server page is reused. */
const PAGE_SIZE = 12;

type Props = {
  params: Promise<{ category: string }>;
};

const getCategory = cache((slug: string) => fetchCategoryForPage(slug));

/** Best-effort category fetch: returns null on both 404 and transient API errors. */
async function safeGetCategory(slug: string): Promise<Category | null> {
  try {
    return await getCategory(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await safeGetCategory(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: SITE_DESCRIPTION,
    };
  }

  const description =
    category.description?.slice(0, 160) ||
    `Shop ${category.name} at ${SITE_NAME}. Cash on delivery across Bangladesh.`;
  const url = `${SITE_URL}/shop/${category.slug}`;

  return {
    title: category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: category.image
        ? [{ url: category.image, alt: category.name }]
        : undefined,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;

  // Fetch the category and its first page of products together, not one after the other.
  const productsPromise = getProductListPage(categorySlug, PAGE_SIZE);
  let category: Category | null = null;
  let fetchFailed = false;
  try {
    category = await getCategory(categorySlug);
  } catch {
    fetchFailed = true;
  }
  const initialProducts = (await productsPromise) ?? undefined;

  if (fetchFailed) {
    return <CategoryPageClient initialCategory={null} initialProducts={initialProducts} />;
  }

  if (!category) {
    notFound();
  }

  return <CategoryPageClient initialCategory={category} initialProducts={initialProducts} />;
}
