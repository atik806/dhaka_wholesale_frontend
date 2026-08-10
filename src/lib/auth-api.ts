import { API_BASE, DELIVERY_CHARGES, type DeliveryZone } from "./constants";

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  shipping_address?: ShippingAddress;
  role: string;
}

/**
 * Mirror of the backend `dw_session` httpOnly cookie payload. Kept only for
 * the OAuth callback, which posts these tokens once to `/auth/sync-session`
 * so the backend can re-set the cookie. They are never stored in JS.
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface RegisterResult {
  user: AuthUser;
  message?: string;
  /** true when the session cookie was set (auto sign-in after registration). */
  authed: boolean;
}

function parseError(res: { status: number }, json: Record<string, unknown>): string {
  if (res.status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (Array.isArray(json.errors) && json.errors.length > 0) {
    const details = json.errors
      .map((e: { message?: string }) => e.message)
      .filter(Boolean)
      .join(". ");
    return details || (typeof json.message === "string" ? json.message : "Request failed");
  }
  return typeof json.message === "string" ? json.message : `Request failed (${res.status})`;
}

/**
 * POST /auth/login. The session arrives via the httpOnly `dw_session` cookie —
 * the response body carries the user object alone.
 */
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data.user;
}

/**
 * POST /auth/register. Returns { user, message, authed } — `authed` is false
 * only when the user row was created but the auto sign-in (and therefore the
 * session cookie) failed, in which case the caller should prompt them to sign in.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResult> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * POST /auth/refresh with an empty body — the refresh token lives in the
 * httpOnly cookie. Single-flight: any number of concurrent 401s share one
 * refresh request.
 */
export async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** GET /auth/profile — cookie-authenticated. */
export async function getProfile(): Promise<AuthUser> {
  const res = await authFetch(`${API_BASE}/auth/profile`);
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

/** POST /auth/sync-profile (OAuth callback) — cookie-authenticated. */
export async function syncProfile(name: string, email: string): Promise<AuthUser> {
  const res = await authFetch(`${API_BASE}/auth/sync-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

/** PATCH /auth/profile — cookie-authenticated. */
export async function updateProfile(updates: {
  name?: string;
  phone?: string;
  shipping_address?: ShippingAddress;
}): Promise<AuthUser> {
  const res = await authFetch(`${API_BASE}/auth/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

/** Don't bounce people who are already on an auth page. */
function shouldRedirectToLogin(): boolean {
  if (typeof window === "undefined") return false;
  return !/^\/(login|register|admin\/login)/.test(window.location.pathname);
}

async function handleExpiredSession(): Promise<void> {
  const { useAuthStore } = await import("@/src/store/useAuthStore");
  useAuthStore.getState().clearSession();
  if (shouldRedirectToLogin()) window.location.href = "/login";
}

/**
 * Fetch with credentials (the httpOnly `dw_session` cookie). On 401, try a
 * single-flight cookie refresh, then retry once. A second 401 means the
 * session is genuinely dead — clear the local user and redirect to login.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let res = await fetch(url, { ...options, credentials: "include" });
  if (res.status !== 401) return res;

  const ok = await refreshSession();
  if (!ok) {
    await handleExpiredSession();
    return res;
  }

  res = await fetch(url, { ...options, credentials: "include" });
  if (res.status === 401) await handleExpiredSession();
  return res;
}

export interface UserOrderItem {
  id: string;
  product_id?: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
}

export interface UserOrder {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: ShippingAddress;
  created_at: string;
  order_items: UserOrderItem[];
}

export interface CheckoutQuoteItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutQuoteUnavailableItem {
  product_id: string;
  name: string;
  requested: number;
  stock_quantity: number;
}

/** Server-authoritative per-line pricing from POST /checkout/quote. */
export interface CheckoutQuoteLine {
  product_id: string;
  price: number;
  quantity: number;
  line_total: number;
  available: boolean;
}

export interface CheckoutQuote {
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  delivery_zone: DeliveryZone;
  currency: string;
  can_checkout: boolean;
  unavailable_items: CheckoutQuoteUnavailableItem[];
  /** Server-authoritative per-line prices. Empty for the local estimate. */
  items: CheckoutQuoteLine[];
  /** true when response came from POST /checkout/quote */
  fromServer: boolean;
}

/**
 * Local estimate matching shipping zones (৳80 / ৳120).
 * Tax is always 0 — never invent the old 8% tax on the client.
 * Used for guests / offline fallback only; checkout prefers server quote.
 */
export function computeLocalCheckoutQuote(
  subtotal: number,
  deliveryZone: DeliveryZone,
): CheckoutQuote {
  const shipping_cost = DELIVERY_CHARGES[deliveryZone];
  const tax = 0;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping_cost,
    tax,
    total: Math.round((subtotal + shipping_cost + tax) * 100) / 100,
    delivery_zone: deliveryZone,
    currency: "BDT",
    can_checkout: true,
    unavailable_items: [],
    items: [],
    fromServer: false,
  };
}

/**
 * Authoritative totals from POST /api/checkout/quote (auth required).
 * Pass `items` for client cart; omit to quote the server cart.
 *
 * Returns null only on network/parse failure (caller falls back to
 * computeLocalCheckoutQuote). A non-OK HTTP response is a server REJECTION —
 * e.g. the cart references a deleted/invalid product — and throwing surfaces
 * that instead of silently letting the user continue to checkout with a
 * locally-computed quote that claims can_checkout: true.
 */
export async function fetchCheckoutQuote(
  deliveryZone: DeliveryZone,
  items?: CheckoutQuoteItem[],
): Promise<CheckoutQuote | null> {
  let res: Response;
  try {
    const body: {
      delivery_zone: DeliveryZone;
      items?: CheckoutQuoteItem[];
    } = { delivery_zone: deliveryZone };

    if (items && items.length > 0) {
      body.items = items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));
    }

    res = await authFetch(`${API_BASE}/checkout/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network failure / auth fetch threw — fall back to the local estimate.
    console.warn("[checkout] quote request failed:", err);
    return null;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const serverMessage = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;
    throw new Error(
      typeof serverMessage === "string" && serverMessage
        ? serverMessage
        : `Checkout quote failed (${res.status})`,
    );
  }

  const data = json.data ?? json;
  const serverLines: CheckoutQuoteLine[] = Array.isArray(data.items)
    ? data.items.map((line: Record<string, unknown>) => ({
        product_id: String(line.product_id),
        price: Number(line.price) || 0,
        quantity: Number(line.quantity) || 0,
        line_total: Number(line.line_total) || 0,
        available: line.available !== false,
      }))
    : [];

  return {
    subtotal: Number(data.subtotal) || 0,
    shipping_cost: Number(data.shipping_cost) || DELIVERY_CHARGES[deliveryZone],
    tax: data.tax == null ? 0 : Number(data.tax) || 0,
    total: Number(data.total) || 0,
    delivery_zone: (data.delivery_zone as DeliveryZone) || deliveryZone,
    currency: typeof data.currency === "string" ? data.currency : "BDT",
    can_checkout: data.can_checkout !== false,
    unavailable_items: Array.isArray(data.unavailable_items)
      ? data.unavailable_items
      : [],
    items: serverLines,
    fromServer: true,
  };
}

export async function fetchUserOrders(): Promise<UserOrder[]> {
  const res = await authFetch(`${API_BASE}/orders`);
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data || [];
}

export async function fetchUserOrder(orderId: string): Promise<UserOrder> {
  const res = await authFetch(`${API_BASE}/orders/${orderId}`);
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

export async function cancelUserOrder(orderId: string): Promise<UserOrder> {
  const res = await authFetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}
