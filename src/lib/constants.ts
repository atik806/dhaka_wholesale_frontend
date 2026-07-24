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
  { value: "0-25", label: "Under ৳25" },
  { value: "25-50", label: "৳25 - ৳50" },
  { value: "50-100", label: "৳50 - ৳100" },
  { value: "100-200", label: "৳100 - ৳200" },
  { value: "200-99999", label: "Over ৳200" },
];
