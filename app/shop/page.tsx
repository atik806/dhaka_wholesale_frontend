import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/constants";
import { getProductListPage } from "@/src/lib/server/data";
import { ShopPageClient } from "./ShopPageClient";

// Rebuilt at most every 5 min (PAGE_REVALIDATE) and right after an admin edit:
// the page carries the first page of products, which have prices. Route
// segment config must be a literal.
export const revalidate = 300;

/** Products per page; must match ITEMS_PER_PAGE in ShopPageClient so the server page is reused. */
const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Shop",
  description: `Browse products at ${SITE_NAME}. ${SITE_DESCRIPTION}`,
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: `Shop | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/shop`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default async function ShopPage() {
  const initialProducts = (await getProductListPage(undefined, PAGE_SIZE)) ?? undefined;
  return <ShopPageClient initialProducts={initialProducts} />;
}
