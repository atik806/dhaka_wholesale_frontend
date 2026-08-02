import { HeroSection } from "@/src/components/home/HeroSection";
import { FeaturedCategories } from "@/src/components/home/FeaturedCategories";
import { TrendingProducts } from "@/src/components/home/TrendingProducts";
import { BrandStrip } from "@/src/components/home/BrandStrip";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { CustomerReviews } from "@/src/components/home/CustomerReviews";
import { Newsletter } from "@/src/components/home/Newsletter";
import { getHomeData } from "@/src/lib/server/data";

// The home page's catalog data changes slowly; cache it and revalidate every 5 minutes.
export const revalidate = 300;

export default async function Home() {
  const { featured, categories, promo, reviews } = await getHomeData();

  return (
    <div className="bg-canvas">
      <HeroSection />
      <FeaturedCategories fallbackData={categories} />
      <TrendingProducts fallbackData={featured} />
      <BrandStrip />
      <PromoBanner fallbackData={promo} />
      <CustomerReviews fallbackData={reviews} />
      <Newsletter />
    </div>
  );
}
