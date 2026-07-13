import { API_BASE } from "./constants";

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
  if (!res.ok) throw new Error(json.message || `Registration failed (${res.status})`);
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
  if (!res.ok) throw new Error(json.message || `Login failed (${res.status})`);
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
  if (!res.ok) throw new Error(json.message || "Session expired");
  return json.data;
}

export async function getProfile(
  token: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load profile");
  return json.data;
}

export async function updateProfile(
  _token: string,
  updates: { name?: string; phone?: string; avatar_url?: string; shipping_address?: ShippingAddress },
): Promise<AuthUser> {
  const res = await authFetch(`${API_BASE}/auth/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update profile");
  return json.data;
}

let refreshPromise: Promise<string | null> | null = null;

async function getValidToken(): Promise<string | null> {
  const { useAuthStore } = await import("@/src/store/useAuthStore");
  const { session, refreshAuth } = useAuthStore.getState();

  if (!session?.access_token) return null;

  if (session.expires_at && session.expires_at * 1000 > Date.now() + 30_000) {
    return session.access_token;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const ok = await refreshAuth();
        if (!ok) return null;
        return useAuthStore.getState().session?.access_token ?? null;
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
  if (!token) throw new Error("Session expired. Please log in again.");

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const { useAuthStore } = await import("@/src/store/useAuthStore");
    const ok = await useAuthStore.getState().refreshAuth();
    if (!ok) throw new Error("Session expired. Please log in again.");

    token = useAuthStore.getState().session?.access_token ?? null;
    if (!token) throw new Error("Session expired. Please log in again.");

    headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(url, { ...options, headers });
  }

  return res;
}
