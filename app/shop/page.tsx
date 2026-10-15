import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/constants";
import { getShopData } from "@/src/lib/server/data";
import type { ShopUrlParams } from "@/src/lib/shop-query";
import { ShopPageClient } from "./ShopPageClient";

// Revalidate the route shell (metadata/HTML) so prices & stock stay fresh
// rather than serving a build-time snapshot indefinitely.
export const revalidate = 60;

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

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toShopUrlParams(raw: Record<string, string | string[] | undefined>): ShopUrlParams {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return {
    categories: first(raw.categories),
    price: first(raw.price),
    rating: first(raw.rating),
    sort: first(raw.sort),
    page: first(raw.page),
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const params = toShopUrlParams(await searchParams);

  let shopData: Awaited<ReturnType<typeof getShopData>> | null = null;
  try {
    shopData = await getShopData(params);
  } catch {
    shopData = null;
  }

  return (
    <ShopPageClient
      initialCategories={shopData?.categories}
      initialProducts={shopData?.products}
      initialSwrKey={shopData?.swrKey ?? null}
    />
  );
}
