export const SITE_NAME = "Dhaka Wholesale";
export const SITE_DESCRIPTION = "Your trusted wholesale marketplace for quality products at competitive prices";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn("NEXT_PUBLIC_API_URL is not set — API calls will fail");
}

export const API_BASE = apiUrl || "http://localhost:5000/api";

export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

export const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-25", label: "Under ৳25" },
  { value: "25-50", label: "৳25 - ৳50" },
  { value: "50-100", label: "৳50 - ৳100" },
  { value: "100-200", label: "৳100 - ৳200" },
  { value: "200-99999", label: "Over ৳200" },
];
