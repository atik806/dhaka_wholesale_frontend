"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getSupabase } from "@/src/lib/supabase";
import { getProfile } from "@/src/lib/auth-api";
import { useAuthStore } from "@/src/store/useAuthStore";

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await getSupabase().auth.getSession();

      if (error || !data.session) {
        router.replace("/login?error=oauth_failed");
        return;
      }

      const { access_token, refresh_token, expires_at } = {
        ...data.session,
        expires_at: data.session.expires_at ?? 0,
      };

      try {
        const user = await getProfile(access_token);
        setAuth(user, { access_token, refresh_token, expires_at });

        const redirect = safeRedirect(searchParams.get("redirect"));
        router.replace(redirect);
      } catch {
        setAuth(
          {
            id: data.session.user.id,
            email: data.session.user.email ?? "",
            name:
              data.session.user.user_metadata?.full_name ??
              data.session.user.user_metadata?.name ??
              data.session.user.email ??
              "",
            role: "customer",
          },
          { access_token, refresh_token, expires_at },
        );

        const redirect = safeRedirect(searchParams.get("redirect"));
        router.replace(redirect);
      }
    };

    handleCallback();
  }, [router, searchParams, setAuth]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
