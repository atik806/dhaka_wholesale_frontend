import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/src/lib/constants";
import { ShopPageClient } from "./ShopPageClient";

const SITE_URL = "https://dhakawholesale.com";

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

export default function ShopPage() {
  return <ShopPageClient />;
}
