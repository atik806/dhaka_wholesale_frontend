import { API_BASE } from "./constants";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
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
): Promise<{ id: string; name: string; email: string; avatar_url?: string; role: string }> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load profile");
  return json.data;
}

export async function updateProfile(
  token: string,
  updates: { name?: string; phone?: string; avatar_url?: string },
): Promise<{ id: string; name: string; email: string; avatar_url?: string; role: string }> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update profile");
  return json.data;
}
