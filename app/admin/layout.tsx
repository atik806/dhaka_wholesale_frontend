"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAccessContext } from "@/src/components/admin/operations/AccessContext";
import { NotificationBell } from "@/src/components/admin/operations/NotificationBell";
import {
  can,
  routePermission,
  landingFor,
  type AccessSession,
} from "@/src/lib/operations-api";
import Link from "next/link";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";

import { API_BASE } from "@/src/lib/constants";
import { refreshSession } from "@/src/lib/auth-api";

/**
 * Cookie-authenticated admin check. The middleware gates the route on cookie
 * presence; this verifies the live session server-side and enforces the admin
 * role before the shell renders (M5 — no unauthenticated shell flash).
 */
type SessionResult = AccessSession | "denied" | "unavailable";
async function checkAdminSession(): Promise<SessionResult> {
  const fetchAccess = () =>
    fetch(`${API_BASE}/admin/operations/session`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  try {
    let res = await fetchAccess();
    if (res.status === 401) {
      const refreshed = await refreshSession();
      if (refreshed !== "ok")
        return refreshed === "expired" ? "denied" : "unavailable";
      res = await fetchAccess();
    }
    if (res.status === 401 || res.status === 403) return "denied";
    if (!res.ok) return "unavailable";
    const json = await res.json().catch(() => null);
    return json?.data?.enabled && Array.isArray(json.data.permissions)
      ? json.data
      : "denied";
  } catch {
    return "unavailable";
  }
}
async function validateAdminSession(): Promise<SessionResult> {
  for (const wait of [0, 1000, 2500]) {
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    const result = await checkAdminSession();
    if (result !== "unavailable") return result;
  }
  return "unavailable";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [unavailable, setUnavailable] = useState(false);
  const [session, setSession] = useState<AccessSession | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let active = true;
    const validate = async () => {
      if (isLoginPage) {
        if (active) setAuthed(true);
        return;
      }
      const valid = await validateAdminSession();
      if (!active) return;
      if (valid === "unavailable") {
        setUnavailable(true);
        return;
      }
      setUnavailable(false);
      if (valid === "denied") {
        setSession(null);
        setAuthed(false);
        router.replace("/admin/login");
        return;
      }
      setSession(valid);
      setAuthed(true);
    };
    void validate();
    const poll = isLoginPage
      ? undefined
      : setInterval(() => void validate(), 30000);
    window.addEventListener("admin-access-changed", validate);
    return () => {
      active = false;
      if (poll) clearInterval(poll);
      window.removeEventListener("admin-access-changed", validate);
    };
  }, [isLoginPage, router]);

  if (unavailable && !session && !isLoginPage)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
        <p>Couldn&apos;t reach the server. You&apos;re still signed in.</p>
        <button
          className="rounded-xl bg-accent px-4 py-2 text-accent-fg"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
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

  const required = routePermission(pathname);
  const allowed =
    !!session && (!required || can(session.permissions, required));
  return (
    <AdminAccessContext.Provider value={session}>
      <div className="flex min-h-screen bg-canvas">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 lg:ml-64">
          <div className="flex justify-end px-4 pt-4 sm:px-6">
            <NotificationBell />
          </div>
          <main className="p-4 sm:p-6 pt-4">
            {unavailable && (
              <p
                role="status"
                className="mb-4 rounded-xl border border-line bg-surface p-3 text-sm"
              >
                Couldn&apos;t reach the server. Your session is retained;
                reconnect and retry.
              </p>
            )}
            {allowed ? (
              children
            ) : (
              <div className="rounded-2xl border border-line bg-surface p-6">
                <h1 className="text-xl font-semibold">Your workspace</h1>
                <p className="my-3 text-muted">
                  Choose a section available to your staff account.
                </p>
                <Link
                  className="text-link underline"
                  href={landingFor(session?.permissions ?? [])}
                >
                  Open my workspace
                </Link>
              </div>
            )}
          </main>
        </div>
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 lg:hidden p-2.5 rounded-xl bg-surface border border-line shadow-sm hover:bg-surface-2 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </div>
    </AdminAccessContext.Provider>
  );
}
