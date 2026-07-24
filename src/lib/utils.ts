type ClassValue = string | number | bigint | false | null | undefined;

export function cn(...inputs: ClassValue[]) {
  return inputs.filter((v): v is string => typeof v === "string" && v.length > 0).join(" ");
}

// Intl renders BDT as the "BDT" code rather than the taka sign, so group the
// digits with Intl and prefix the symbol ourselves.
export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price)) return "৳0";
  return `৳${new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)}`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function safeImage(images: string[] | undefined | null, fallback = '/placeholder.svg'): string {
  return images?.[0] || fallback;
}


