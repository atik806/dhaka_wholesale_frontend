"use server";

import { after } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag, updateTag } from "next/cache";
import { API_ORIGIN_BASE } from "@/src/lib/constants";
import { STORE_TAG } from "@/src/lib/server/data";

/**
 * The backend CDN can keep serving a category response for up to 30s
 * (s-maxage 15 + stale-while-revalidate 15), so a page rebuilt the moment
 * after an edit may pick up the old counts. A second refresh after that
 * window catches it.
 */
const BACKEND_CDN_WINDOW_MS = 35_000;

/**
 * Refresh every storefront page after an admin edit. Store pages are cached
 * for minutes (src/lib/server/data.ts); this makes product, category, offer
 * and setting changes show right away. Only admins can trigger it, checked
 * against the backend with the caller's own session cookie.
 */
export async function refreshStorefront(): Promise<void> {
  const session = (await cookies()).get("dw_session");
  if (!session) return;
  const res = await fetch(`${API_ORIGIN_BASE}/admin/operations/session`, {
    headers: { cookie: `dw_session=${encodeURIComponent(session.value)}` },
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) return;
  const profile = await res.json().catch(() => null);
  const permissions: string[] = profile?.data?.permissions ?? [];
  if (!profile?.data?.enabled || !permissions.some(p => ['*','products.manage','inventory.manage','orders.manage'].includes(p))) return;

  updateTag(STORE_TAG);
  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, BACKEND_CDN_WINDOW_MS));
    revalidateTag(STORE_TAG, { expire: 0 });
  });
}
