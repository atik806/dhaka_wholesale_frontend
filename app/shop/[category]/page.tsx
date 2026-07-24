import type { Metadata } from "next";
import { fetchCategoryBySlug } from "@/src/lib/api";
import { SITE_DESCRIPTION, SITE_NAME } from "@/src/lib/constants";
import { CategoryPageClient } from "./CategoryPageClient";

const SITE_URL = "https://dhakawholesale.com";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await fetchCategoryBySlug(categorySlug);

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

export default function CategoryPage() {
  return <CategoryPageClient />;
}
