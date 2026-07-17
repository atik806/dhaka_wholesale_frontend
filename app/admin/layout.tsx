"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";

import { API_BASE } from "@/src/lib/constants";

function getSessionFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const sessionStr = localStorage.getItem("admin_session");
    if (!sessionStr) return null;
    const session = JSON.parse(sessionStr);
    if (session.session?.access_token && session.user?.role === "admin") {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

async function validateToken(): Promise<boolean> {
  try {
    const session = getSessionFromStorage();
    if (!session) return false;
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${session.session.access_token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let active = true;
    (async () => {
      if (isLoginPage) {
        if (active) setAuthed(true);
        return;
      }
      const session = getSessionFromStorage();
      if (!session) {
        if (active) setAuthed(false);
        router.replace("/admin/login");
        return;
      }
      // Show admin shell immediately; validate token in background once per mount
      if (active) setAuthed(true);
      const valid = await validateToken();
      if (!valid && active) {
        localStorage.removeItem("admin_session");
        setAuthed(false);
        router.replace("/admin/login");
      }
    })();
    return () => { active = false; };
    // Validate once on mount / login-page toggle — not on every admin route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPage]);

  if (authed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoginPage && !authed) return null;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64">
        <main className="p-4 sm:p-6 pt-14 lg:pt-6">{children}</main>
      </div>
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 lg:hidden p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
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
