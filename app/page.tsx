import { HeroSection } from "@/src/components/home/HeroSection";
import { FeaturedCategories } from "@/src/components/home/FeaturedCategories";
import { TrendingProducts } from "@/src/components/home/TrendingProducts";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { CustomerReviews } from "@/src/components/home/CustomerReviews";
import { getHomeData } from "@/src/lib/server/data";
import { ComboDeals } from "@/src/components/product/ComboDeals";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/constants";
import { safeJsonLd } from "@/src/lib/utils";

/**
 * Product photo used as the home page's thumbnail in search results and link
 * previews. Without it Google picked the warehouse hero photo.
 */
const HOME_IMAGE = { url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 1200, alt: "Rhinestone oval hair claw clips" };

export const metadata: Metadata = {
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [HOME_IMAGE],
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: [HOME_IMAGE.url] },
};

/** Store name and logo (shown beside results) plus the page's preferred thumbnail. */
const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: ["https://www.facebook.com/profile.php?id=61588527085764"],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      primaryImageOfPage: { "@type": "ImageObject", url: HOME_IMAGE.url, width: 1200, height: 1200 },
      image: HOME_IMAGE.url,
    },
  ],
};

// Serve the home page from cache, rebuilt at most every hour (PAGE_REVALIDATE
// in src/lib/server/data.ts) and right after an admin edit. Route segment
// config must be a literal.
export const revalidate = 3600;

export default async function Home() {
  const { featured, categories, promo, reviews } = await getHomeData();

  return (
    <div className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(homeJsonLd) }} />
      <HeroSection />
      <FeaturedCategories fallbackData={categories} />
      <TrendingProducts fallbackData={featured} />
      <ComboDeals compact />
      <PromoBanner fallbackData={promo} />
      <CustomerReviews fallbackData={reviews} />
    </div>
  );
}
