"use client";

import { motion } from "framer-motion";
import { HeroSection } from "@/src/components/home/HeroSection";
import { FeaturedCategories } from "@/src/components/home/FeaturedCategories";
import { TrendingProducts } from "@/src/components/home/TrendingProducts";
import { BrandStrip } from "@/src/components/home/BrandStrip";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { CustomerReviews } from "@/src/components/home/CustomerReviews";
import { Newsletter } from "@/src/components/home/Newsletter";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-canvas"
    >
      <HeroSection />
      <FeaturedCategories />
      <TrendingProducts />
      <BrandStrip />
      <PromoBanner />
      <CustomerReviews />
      <Newsletter />
    </motion.div>
  );
}
