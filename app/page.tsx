"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HeroSection } from "@/src/components/home/HeroSection";
import { FeaturedCategories } from "@/src/components/home/FeaturedCategories";
import { TrendingProducts } from "@/src/components/home/TrendingProducts";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { Newsletter } from "@/src/components/home/Newsletter";
import { Testimonials } from "@/src/components/home/Testimonials";

export default function Home() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="homepage"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HeroSection />
        <FeaturedCategories />
        <TrendingProducts />
        <PromoBanner />
        <Testimonials />
        <Newsletter />
      </motion.div>
    </AnimatePresence>
  );
}
