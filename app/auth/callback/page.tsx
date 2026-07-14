"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/src/lib/supabase";
import { getProfile, syncProfile } from "@/src/lib/auth-api";
import { useAuthStore } from "@/src/store/useAuthStore";

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function CallbackHandler() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const getParam = (key: string) =>
        new URLSearchParams(window.location.search).get(key);

      const code = getParam("code");
      const redirect = safeRedirect(getParam("redirect"));

      if (!code) {
        console.error("[OAuth Callback] No code parameter in URL");
        router.push(
          `/login?error=oauth_failed&error_description=${encodeURIComponent(
            "No authorization code received",
          )}`,
        );
        return;
      }

      const supabase = getSupabase();

      const TIMEOUT_MS = 15_000;
      const exchange = supabase.auth.exchangeCodeForSession(code);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Code exchange timed out after 15s")),
          TIMEOUT_MS,
        ),
      );

      let sessionData: { session: Session } | null = null;
      let sessionError: { message: string } | null = null;

      try {
        const result = (await Promise.race([exchange, timeout])) as Awaited<
          typeof exchange
        >;
        sessionData = result.data;
        sessionError = result.error;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error("[OAuth Callback] Code exchange threw:", message);
        router.push(
          `/login?error=oauth_exchange_failed&error_description=${encodeURIComponent(
            message,
          )}`,
        );
        return;
      }

      if (sessionError) {
        console.error(
          "[OAuth Callback] Session error:",
          sessionError.message,
          sessionError,
        );
      }

      if (sessionError || !sessionData?.session) {
        const desc = sessionError?.message ?? "no_session";
        console.error(
          "[OAuth Callback] No session. Error:",
          desc,
          "| Code present:",
          !!code,
          "| Has verifier in localStorage:",
          !!(
            typeof window !== "undefined" &&
            Object.keys(localStorage).some((k) => k.includes("code-verifier"))
          ),
        );
        router.push(
          `/login?error=oauth_failed&error_description=${encodeURIComponent(
            desc,
          )}`,
        );
        return;
      }

      const session = sessionData.session;
      const { access_token, refresh_token, expires_at } = {
        ...session,
        expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      };

      try {
        const user = await getProfile(access_token);
        setAuth(user, { access_token, refresh_token, expires_at });
        router.push(redirect);
      } catch {
        const oauthName =
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          session.user.email ??
          "";
        const oauthEmail = session.user.email ?? "";

        try {
          const user = await syncProfile(access_token, oauthName, oauthEmail);
          setAuth(user, { access_token, refresh_token, expires_at });
          router.push(redirect);
        } catch (syncErr: unknown) {
          const syncMsg = syncErr instanceof Error ? syncErr.message : "unknown";
          console.error(
            "[OAuth Callback] Profile sync failed:",
            syncMsg,
          );
          setAuth(
            {
              id: session.user.id,
              email: oauthEmail,
              name: oauthName,
              role: "customer",
            },
            { access_token, refresh_token, expires_at },
          );

          router.push(
            `/login?error=oauth_profile_failed&error_description=${encodeURIComponent(
              "Could not create backend profile",
            )}`,
          );
        }
      }
    };

    handleCallback();
  }, [router, setAuth]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Completing sign-in...</p>
      </div>
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
