import { HeroSection } from "@/src/components/home/HeroSection";
import { FeaturedCategories } from "@/src/components/home/FeaturedCategories";
import { TrendingProducts } from "@/src/components/home/TrendingProducts";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { CustomerReviews } from "@/src/components/home/CustomerReviews";
import { getHomeData } from "@/src/lib/server/data";
import { ComboDeals } from "@/src/components/product/ComboDeals";
import { SITE_NAME, SITE_URL } from "@/src/lib/constants";
import { safeJsonLd } from "@/src/lib/utils";

/** Tells search engines the store's name and logo (shown beside results). */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: ["https://www.facebook.com/profile.php?id=61588527085764"],
};

// Serve the home page from cache, rebuilt at most every hour (PAGE_REVALIDATE
// in src/lib/server/data.ts) and right after an admin edit. Route segment
// config must be a literal.
export const revalidate = 3600;

export default async function Home() {
  const { featured, categories, promo, reviews } = await getHomeData();

  return (
    <div className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }} />
      <HeroSection />
      <FeaturedCategories fallbackData={categories} />
      <TrendingProducts fallbackData={featured} />
      <ComboDeals compact />
      <PromoBanner fallbackData={promo} />
      <CustomerReviews fallbackData={reviews} />
    </div>
  );
}
