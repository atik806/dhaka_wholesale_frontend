"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";

import { API_BASE } from "@/src/lib/constants";

async function validateToken(): Promise<boolean> {
  try {
    const sessionStr = localStorage.getItem("admin_session");
    if (!sessionStr) return false;
    const session = JSON.parse(sessionStr);
    const token = session.session?.access_token;
    if (!token || session.user?.role !== "admin") return false;
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
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
  const [isAdmin, setIsAdmin] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  const checkAuth = useCallback(async () => {
    if (isLoginPage) {
      setAuthed(true);
      return;
    }
    const sessionStr = localStorage.getItem("admin_session");
    if (!sessionStr) {
      router.replace("/admin/login");
      return;
    }
    try {
      const session = JSON.parse(sessionStr);
      if (session.user?.role !== "admin") {
        router.replace("/admin/login");
        return;
      }
      const valid = await validateToken();
      if (!valid) {
        localStorage.removeItem("admin_session");
        router.replace("/admin/login");
        return;
      }
      setIsAdmin(true);
      setAuthed(true);
    } catch {
      router.replace("/admin/login");
    }
  }, [router, isLoginPage]);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoginPage && (!authed || !isAdmin)) return null;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
