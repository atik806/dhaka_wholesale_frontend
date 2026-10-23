"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";

import { API_BASE } from "@/src/lib/constants";
import { refreshSession } from "@/src/lib/auth-api";

/**
 * Cookie-authenticated admin check. The middleware gates the route on cookie
 * presence; this verifies the live session server-side and enforces the admin
 * role before the shell renders (M5 — no unauthenticated shell flash).
 */
async function checkAdminSession(): Promise<"admin" | "denied" | "unavailable"> {
  const profile = () =>
    fetch(`${API_BASE}/auth/profile`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  let res: Response;
  try {
    res = await profile();
    if (res.status === 401) {
      const refreshed = await refreshSession();
      if (refreshed !== "ok") return refreshed === "expired" ? "denied" : "unavailable";
      res = await profile();
    }
  } catch {
    return "unavailable";
  }
  if (res.status === 401 || res.status === 403) return "denied";
  if (!res.ok) return "unavailable";
  const profileData = await res.json().catch(() => null);
  const role = profileData?.data?.role ?? profileData?.data?.user?.role ?? null;
  return role === "admin" ? "admin" : "denied";
}

/**
 * A server hiccup (rate limit, cold start after a deploy) used to bounce a
 * signed-in admin back to the login page, which looked like a failed login.
 * Retry a few times before giving up, and only send them to login when the
 * backend actually says the session is not an admin's.
 */
async function validateAdminSession(): Promise<"admin" | "denied" | "unavailable"> {
  for (const wait of [0, 1000, 2500]) {
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    const result = await checkAdminSession();
    if (result !== "unavailable") return result;
  }
  return "unavailable";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let active = true;
    (async () => {
      if (isLoginPage) {
        if (active) setAuthed(true);
        return;
      }
      // Render nothing (spinner) until the cookie session is validated — the
      // shell must never appear for an unauthenticated user (M5).
      const result = await validateAdminSession();
      if (!active) return;
      if (result === "unavailable") {
        setUnavailable(true);
        return;
      }
      if (result === "denied") {
        setAuthed(false);
        router.replace("/admin/login");
        return;
      }
      setAuthed(true);
    })();
    return () => { active = false; };
    // Validate once on mount / login-page toggle — not on every admin route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPage]);

  if (unavailable) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
        <p className="text-sm text-fg">Couldn&apos;t reach the server. You&apos;re still signed in.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          Try again
        </button>
      </div>
    );
  }

  if (authed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoginPage && !authed) return null;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64">
        <main className="p-4 sm:p-6 pt-14 lg:pt-6">{children}</main>
      </div>
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 lg:hidden p-2.5 rounded-xl bg-surface border border-line shadow-sm hover:bg-surface-2 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
