export type OfferStatus = "draft" | "scheduled" | "live" | "ended";

export interface FlashSale {
  title: string;
  enabled: boolean;
  starts_at: string;
  ends_at: string;
  products: { product_id: string; price: number }[];
}

export interface ComboDeal {
  id: string;
  title: string;
  enabled: boolean;
  starts_at: string;
  ends_at: string;
  price: number;
  products: { product_id: string; quantity: number }[];
  /** Version from the admin listing; absent until saved. */
  updated_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  enabled: boolean;
  starts_at: string;
  ends_at: string;
  type: "percentage" | "fixed";
  value: number;
  minimum_spend: number;
  maximum_discount: number | null;
  /** Total uses allowed across all customers; null = unlimited. */
  max_redemptions: number | null;
  /** Uses allowed per customer; null = unlimited. */
  per_customer_limit: number | null;
  /** Orders (not cancelled) that used the code, from the admin listing. */
  redemptions?: number;
  updated_at?: string;
}

export interface PromotionConfig { combos: ComboDeal[]; coupons: Coupon[] }

/**
 * Body and X-Expected-Version header for saving a promotion. The listing's
 * updated_at/redemptions are not part of the promotion; the version tells
 * the server which copy this edit started from ("new" when creating), so a
 * concurrent edit by another admin is rejected instead of overwritten.
 */
export function promotionSaveRequest<T extends ComboDeal | Coupon>(value: T) {
  const { updated_at, ...rest } = value;
  const body = { ...rest } as Record<string, unknown>;
  delete body.redemptions;
  return { body, version: updated_at ?? "new" };
}

export interface OfferWindow {
  enabled?: boolean;
  starts_at?: string;
  ends_at?: string;
}

const DHAKA_OFFSET = "+06:00";

export function getOfferStatus(
  offer: OfferWindow,
  now = Date.now(),
): OfferStatus {
  if (!offer.enabled || !offer.starts_at || !offer.ends_at) return "draft";

  const startsAt = Date.parse(offer.starts_at);
  const endsAt = Date.parse(offer.ends_at);
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || endsAt <= startsAt) {
    return "draft";
  }
  if (now < startsAt) return "scheduled";
  if (now >= endsAt) return "ended";
  return "live";
}

export function getDiscountPercent(normalPrice: number, salePrice: number): number {
  if (
    !Number.isFinite(normalPrice) ||
    !Number.isFinite(salePrice) ||
    normalPrice <= 0 ||
    salePrice <= 0 ||
    salePrice >= normalPrice
  ) {
    return 0;
  }
  return Math.round(((normalPrice - salePrice) / normalPrice) * 100);
}

/** Format an ISO timestamp for an `<input type="datetime-local">` in Dhaka. */
export function toDhakaInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

/** Convert a Dhaka datetime-local value to an absolute ISO timestamp. */
export function dhakaInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${DHAKA_OFFSET}`);
  // Date normalizes impossible dates (e.g. February 30); reject those inputs.
  return Number.isNaN(date.getTime()) || toDhakaInputValue(date.toISOString()) !== value
    ? null : date.toISOString();
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getCountdownParts(
  endsAt: string | null | undefined,
  now = Date.now(),
): CountdownParts {
  const end = endsAt ? Date.parse(endsAt) : Number.NaN;
  let seconds = Number.isFinite(end) ? Math.max(0, Math.floor((end - now) / 1000)) : 0;
  const days = Math.floor(seconds / 86_400);
  seconds -= days * 86_400;
  const hours = Math.floor(seconds / 3_600);
  seconds -= hours * 3_600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return { days, hours, minutes, seconds };
}
