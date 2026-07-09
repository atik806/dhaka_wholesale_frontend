import { API_BASE } from "./constants";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const session = JSON.parse(localStorage.getItem("admin_session") || "{}");
    return session.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function adminFetcher<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_session");
      if (typeof window !== "undefined") window.location.href = "/admin/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Dashboard
export interface DashboardStats {
  stats: { totalProducts: number; totalOrders: number; totalUsers: number; totalRevenue: number };
  recentOrders: unknown[];
  lowStockProducts: unknown[];
}
export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await adminFetcher<DashboardStats>("/admin/dashboard");
  return res.data;
}

// Orders
export interface OrderItem {
  id: string; product_id: string; product_name: string; product_image: string; price: number; quantity: number; selected_size?: string; selected_color?: string;
}
export interface Order {
  id: string; user_id: string; status: string; subtotal: number; shipping_cost: number; tax: number; total: number; shipping_address: Record<string,string>; payment_method: string; payment_status: string; created_at: string; order_items?: OrderItem[]; profiles?: { name: string; email: string };
}
export async function fetchOrders(params?: { page?: number; limit?: number; status?: string }): Promise<{ orders: Order[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  const res = await adminFetcher<Order[]>(`/admin/orders${q ? `?${q}` : ""}`);
  return { orders: res.data || [], meta: res.meta! };
}
export async function fetchOrder(id: string): Promise<Order> {
  const res = await adminFetcher<Order>(`/admin/orders/${id}`);
  return res.data;
}
export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const res = await adminFetcher<Order>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
}
export async function updatePaymentStatus(id: string, payment_status: string): Promise<Order> {
  const res = await adminFetcher<Order>(`/admin/orders/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status }),
  });
  return res.data;
}

// Users
export interface UserProfile {
  id: string; name: string; email: string; phone?: string; avatar_url?: string; role: string; created_at: string;
}
export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await adminFetcher<UserProfile[]>("/admin/users");
  return res.data || [];
}
export async function updateUserRole(id: string, role: string): Promise<UserProfile> {
  const res = await adminFetcher<UserProfile>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return res.data;
}
export async function createUser(data: { name: string; email: string; password: string; role?: string }): Promise<UserProfile> {
  const res = await adminFetcher<UserProfile>("/admin/users", {
    method: "POST",
    body: JSON.stringify({ ...data, role: data.role || "admin" }),
  });
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await adminFetcher(`/admin/users/${id}`, { method: "DELETE" });
}

// Reviews
export interface AdminReview {
  id: string; product_id: string; user_id: string; rating: number; text: string; created_at: string; profiles?: { name: string; avatar_url: string }; products?: { name: string; slug: string };
}
export async function fetchAdminReviews(params?: { page?: number; limit?: number }): Promise<{ reviews: AdminReview[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  const res = await adminFetcher<AdminReview[]>(`/admin/reviews${q ? `?${q}` : ""}`);
  return { reviews: res.data || [], meta: res.meta! };
}
export async function deleteAdminReview(id: string): Promise<void> {
  await adminFetcher(`/admin/reviews/${id}`, { method: "DELETE" });
}

// Contact Messages
export interface ContactMessage {
  id: string; first_name: string; last_name: string; email: string; subject: string; message: string; is_read: boolean; created_at: string;
}
export async function fetchContactMessages(params?: { page?: number; limit?: number }): Promise<{ messages: ContactMessage[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  const res = await adminFetcher<ContactMessage[]>(`/admin/contact-messages${q ? `?${q}` : ""}`);
  return { messages: res.data || [], meta: res.meta! };
}
export async function markMessageRead(id: string): Promise<void> {
  await adminFetcher(`/admin/contact-messages/${id}/read`, { method: "PATCH" });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await adminFetcher(`/admin/contact-messages/${id}`, { method: "DELETE" });
}
