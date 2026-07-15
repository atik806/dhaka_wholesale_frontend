import type { Category, Testimonial } from "@/src/types/product";

export const SITE_NAME = "Dhaka Wholesale";
export const SITE_DESCRIPTION = "Your trusted wholesale marketplace for quality products at competitive prices";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be set to the production backend API URL");
}

export const API_BASE = apiUrl;

export const categories: Category[] = [
  { id: "electronics", name: "Electronics", slug: "electronics", image: "https://picsum.photos/seed/electronics/800/600", productCount: 8, description: "Cutting-edge gadgets and devices" },
  { id: "fashion", name: "Fashion", slug: "fashion", image: "https://picsum.photos/seed/fashion/800/600", productCount: 8, description: "Trendsetting apparel and accessories" },
  { id: "home-living", name: "Home & Living", slug: "home-living", image: "https://picsum.photos/seed/home-living/800/600", productCount: 6, description: "Elevate your living space" },
  { id: "beauty", name: "Beauty", slug: "beauty", image: "https://picsum.photos/seed/beauty/800/600", productCount: 5, description: "Premium skincare and cosmetics" },
  { id: "sports", name: "Sports", slug: "sports", image: "https://picsum.photos/seed/sports/800/600", productCount: 5, description: "Gear for an active lifestyle" },
  { id: "groceries", name: "Groceries", slug: "groceries", image: "https://picsum.photos/seed/groceries/800/600", productCount: 4, description: "Fresh and organic essentials" },
  { id: "toys", name: "Toys & Games", slug: "toys", image: "https://picsum.photos/seed/toys/800/600", productCount: 4, description: "Fun for all ages" },
];

export const testimonials: Testimonial[] = [
  { id: "1", name: "Sarah Chen", role: "Fashion Blogger", avatar: "https://placehold.co/seed/sarah-chen/100/100", text: "The quality exceeded my expectations. Every piece feels premium and the packaging was beautiful. This is my new go-to shop.", rating: 5 },
  { id: "2", name: "Marcus Rivera", role: "Tech Enthusiast", avatar: "https://placehold.co/seed/marcus-rivera/100/100", text: "Incredible selection of electronics at competitive prices. Fast shipping and the customer service team was very helpful.", rating: 5 },
  { id: "3", name: "Emily Watson", role: "Interior Designer", avatar: "https://placehold.co/seed/emily-watson/100/100", text: "Curated with such care. The home decor pieces transformed my apartment. Will definitely be ordering more.", rating: 4 },
  { id: "4", name: "James Park", role: "Fitness Coach", avatar: "https://placehold.co/seed/james-park/100/100", text: "Top-notch sports gear that actually performs. The quality matches premium brands at a fraction of the price.", rating: 5 },
];

export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

export const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-25", label: "Under $25" },
  { value: "25-50", label: "৳25 - ৳50" },
  { value: "50-100", label: "৳50 - ৳100" },
  { value: "100-200", label: "৳100 - ৳200" },
  { value: "200-99999", label: "Over ৳200" },
];
