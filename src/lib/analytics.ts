/**
 * Shopper analytics: Meta (Facebook) Pixel and Google Analytics 4.
 *
 * Both are off unless their IDs are set at build time:
 *   NEXT_PUBLIC_FB_PIXEL_ID   e.g. 1234567890123456
 *   NEXT_PUBLIC_GA_ID         e.g. G-XXXXXXXXXX
 *
 * Every helper is a safe no-op when a tracker is missing or blocked, so
 * analytics can never break browsing or checkout.
 */

export const FB_PIXEL_ID = (process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "").trim();
export const GA_ID = (process.env.NEXT_PUBLIC_GA_ID ?? "").trim();

const CURRENCY = "BDT";

type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;

function fbq(...args: unknown[]) {
  if (!FB_PIXEL_ID || typeof window === "undefined") return;
  try {
    (window as unknown as { fbq?: Fbq }).fbq?.(...args);
  } catch {
    /* tracking must never break the store */
  }
}

function gtag(...args: unknown[]) {
  if (!GA_ID || typeof window === "undefined") return;
  try {
    (window as unknown as { gtag?: Gtag }).gtag?.(...args);
  } catch {
    /* tracking must never break the store */
  }
}

export interface TrackedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function gaItems(items: TrackedItem[]) {
  return items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));
}

function value(items: TrackedItem[]) {
  return Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
}

/**
 * Pixel only: GA4's enhanced measurement already records client-side
 * navigations, so sending page_view here would count them twice.
 */
export function trackPageView() {
  fbq("track", "PageView");
}

export function trackViewContent(item: TrackedItem) {
  fbq("track", "ViewContent", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value: item.price,
    currency: CURRENCY,
  });
  gtag("event", "view_item", { currency: CURRENCY, value: item.price, items: gaItems([item]) });
}

export function trackAddToCart(item: TrackedItem) {
  fbq("track", "AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value: value([item]),
    currency: CURRENCY,
  });
  gtag("event", "add_to_cart", { currency: CURRENCY, value: value([item]), items: gaItems([item]) });
}

export function trackInitiateCheckout(items: TrackedItem[]) {
  fbq("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    content_type: "product",
    num_items: items.reduce((n, i) => n + i.quantity, 0),
    value: value(items),
    currency: CURRENCY,
  });
  gtag("event", "begin_checkout", { currency: CURRENCY, value: value(items), items: gaItems(items) });
}

export function trackPurchase(orderId: string, total: number, items: TrackedItem[]) {
  fbq(
    "track",
    "Purchase",
    {
      content_ids: items.map((i) => i.id),
      content_type: "product",
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: total,
      currency: CURRENCY,
    },
    // Lets Meta de-duplicate a retried order.
    { eventID: orderId },
  );
  gtag("event", "purchase", {
    transaction_id: orderId,
    currency: CURRENCY,
    value: total,
    items: gaItems(items),
  });
}
