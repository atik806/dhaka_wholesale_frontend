import { HeroSection } from "@/src/components/home/HeroSection";
import { FeaturedCategories } from "@/src/components/home/FeaturedCategories";
import { TrendingProducts } from "@/src/components/home/TrendingProducts";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { CustomerReviews } from "@/src/components/home/CustomerReviews";
import { getHomeData } from "@/src/lib/server/data";
import { ComboDeals } from "@/src/components/product/ComboDeals";

// Serve the home page from cache, rebuilt at most every 5 min (PAGE_REVALIDATE
// in src/lib/server/data.ts) and right after an admin edit. Route segment
// config must be a literal.
export const revalidate = 300;

export default async function Home() {
  const { featured, categories, promo, reviews } = await getHomeData();

  return (
    <div className="bg-canvas">
      <HeroSection />
      <FeaturedCategories fallbackData={categories} />
      <TrendingProducts fallbackData={featured} />
      <ComboDeals compact />
      <PromoBanner fallbackData={promo} />
      <CustomerReviews fallbackData={reviews} />
    </div>
  );
}
