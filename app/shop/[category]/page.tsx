import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchCategoryForPage } from "@/src/lib/server/data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/constants";
import { CategoryPageClient } from "./CategoryPageClient";
import type { Category } from "@/src/types/product";

// Category pages cache and revalidate every 5 minutes (same window as the home page).
export const revalidate = 300;

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

  let category: Category | null = null;
  let fetchFailed = false;
  try {
    category = await getCategory(categorySlug);
  } catch {
    fetchFailed = true;
  }

  if (fetchFailed) {
    return <CategoryPageClient initialCategory={null} />;
  }

  if (!category) {
    notFound();
  }

  return <CategoryPageClient initialCategory={category} />;
}
