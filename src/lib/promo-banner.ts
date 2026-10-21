export interface PromoBannerSettings {
  badge: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  enabled: boolean;
}

export const DEFAULT_PROMO: PromoBannerSettings = {
  badge: "Limited Time Offer",
  title: "Seasonal Sale — Up to 40% Off",
  subtitle:
    "Hundreds of trending items at great prices. Cash on delivery available on all items.",
  button_text: "Shop the sale",
  button_link: "/shop",
  enabled: true,
};

/** Accept direct or API-wrapped values, preserving deliberately empty text. */
export function normalizePromoBanner(value: unknown): PromoBannerSettings {
  if (value && typeof value === "object" && "data" in value) value = value.data;
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { ...DEFAULT_PROMO };
  const raw = value as Record<string, unknown>;
  const text = (key: keyof PromoBannerSettings) =>
    typeof raw[key] === "string"
      ? (raw[key] as string)
      : (DEFAULT_PROMO[key] as string);
  return {
    badge: text("badge"),
    title: text("title"),
    subtitle: text("subtitle"),
    button_text: text("button_text"),
    button_link: text("button_link"),
    enabled:
      typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_PROMO.enabled,
  };
}

export function validPromoLink(value: string): boolean {
  if (!value || /[\s\\]/.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validatePromoBanner(promo: PromoBannerSettings): string | null {
  if (promo.enabled && !promo.title.trim())
    return "Enter a banner title before making it visible.";
  if (promo.enabled && !promo.button_text.trim())
    return "Enter the button text before making the banner visible.";
  if (!validPromoLink(promo.button_link.trim()))
    return "Use a site path such as /shop or a full HTTP/HTTPS URL for the button link.";
  const limits = {
    badge: 80,
    title: 160,
    subtitle: 500,
    button_text: 60,
    button_link: 2048,
  } as const;
  for (const [key, limit] of Object.entries(limits)) {
    if (promo[key as keyof typeof limits].length > limit)
      return `${key.replaceAll("_", " ")} must be ${limit} characters or fewer.`;
  }
  return null;
}
