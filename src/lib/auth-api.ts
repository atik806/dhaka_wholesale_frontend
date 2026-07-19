import { API_BASE } from "./constants";

interface AuthStoreState {
  session: AuthSession | null;
  refreshAuth: () => Promise<boolean>;
}

interface AuthStore {
  getState(): AuthStoreState;
}

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

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
  message?: string;
}

function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
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

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

export async function getProfile(
  token: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

export async function syncProfile(
  token: string,
  name: string,
  email: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/sync-profile`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name, email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
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
  order_items: {
    id: string;
    product_name: string;
    product_image: string | null;
    price: number;
    quantity: number;
    selected_size: string | null;
    selected_color: string | null;
  }[];
}

export async function fetchUserOrders(): Promise<UserOrder[]> {
  const res = await authFetch(`${API_BASE}/orders`);
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data || [];
}

export async function updateProfile(
  _token: string,
  updates: { name?: string; phone?: string; shipping_address?: ShippingAddress },
): Promise<AuthUser> {
  const res = await authFetch(`${API_BASE}/auth/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(parseError(res, json));
  return json.data;
}

let refreshPromise: Promise<string | null> | null = null;

async function getValidToken(): Promise<string | null> {
  let authStore: AuthStore;
  try {
    authStore = (await import("@/src/store/useAuthStore")).useAuthStore;
  } catch {
    return null;
  }
  const { session, refreshAuth } = authStore.getState();

  if (!session?.access_token) return null;

  if (session.expires_at && session.expires_at * 1000 > Date.now() + 30_000) {
    return session.access_token;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const ok = await refreshAuth();
        if (!ok) return null;
        return authStore.getState().session?.access_token ?? null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = await getValidToken();
  if (!token) throw new Error("No active session. Please log in.");

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    let authStore: AuthStore;
    try {
      authStore = (await import("@/src/store/useAuthStore")).useAuthStore;
    } catch {
      throw new Error("Failed to load auth store for token refresh.");
    }

    const ok = await authStore.getState().refreshAuth();
    if (!ok) throw new Error("Session refresh failed. Please log in again.");

    token = authStore.getState().session?.access_token ?? null;
    if (!token) throw new Error("Session refresh returned no token. Please log in again.");

    headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(url, { ...options, headers });
  }

  return res;
}
