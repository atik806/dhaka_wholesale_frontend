export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getImageUrl(seed: string, w = 600, h = 600): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export function getCategoryImage(category: string, index = 1): string {
  return `https://picsum.photos/seed/${category.toLowerCase().replace(/\s+/g, "-")}-${index}/800/600`;
}

export function getAvatarUrl(name: string): string {
  return `https://picsum.photos/seed/${name.replace(/\s+/g, "-").toLowerCase()}/100/100`;
}
