import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/constants";
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

export default function ShopPage() {
  return <ShopPageClient />;
}
