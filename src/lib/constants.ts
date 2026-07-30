export const SITE_NAME = "Dhaka Wholesale";
export const SITE_DESCRIPTION = "Bangladesh's trusted online store. Quality products, cash on delivery, and fast shipping nationwide.";

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

export const DELIVERY_CHARGES = {
  inside_dhaka: 80,
  outside_dhaka: 120,
} as const;

export type DeliveryZone = keyof typeof DELIVERY_CHARGES;

export const DELIVERY_ZONE_LABELS: Record<DeliveryZone, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};

export const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-1000", label: "Under ৳1,000" },
  { value: "1000-2000", label: "৳1,000 - ৳2,000" },
  { value: "2000-5000", label: "৳2,000 - ৳5,000" },
  { value: "5000-999999", label: "Over ৳5,000" },
];
