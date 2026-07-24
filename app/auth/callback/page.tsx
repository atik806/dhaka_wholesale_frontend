"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabase";
import { getProfile, syncProfile } from "@/src/lib/auth-api";
import {
  mergeGuestCartOnLogin,
  snapshotGuestCart,
} from "@/src/lib/cart-sync";
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
      // Capture guest cart before auth state flips (RootClient may load server cart).
      const guest = snapshotGuestCart();

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

      // Supabase auto-init already detected the PKCE callback via _initialize()
      // and exchanged the code for a session. We just need to retrieve it.
      // getSession() internally awaits initializePromise.
      const TIMEOUT_MS = 15_000;
      const sessionPromise = supabase.auth.getSession();
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("getSession timed out after 15s")),
          TIMEOUT_MS,
        ),
      );

      let sessionResult: Awaited<typeof sessionPromise>;
      try {
        sessionResult = await Promise.race([sessionPromise, timeout]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error("[OAuth Callback] getSession threw:", message);
        router.push(
          `/login?error=oauth_exchange_failed&error_description=${encodeURIComponent(
            message,
          )}`,
        );
        return;
      }

      const { data, error: sessionError } = sessionResult;

      if (sessionError) {
        console.error("[OAuth Callback] Session error:", sessionError.message);
      }

      if (sessionError || !data?.session) {
        const desc = sessionError?.message ?? "no_session";
        console.error(
          "[OAuth Callback] No session. Error:",
          desc,
          "| Code present:",
          !!code,
        );
        router.push(
          `/login?error=oauth_failed&error_description=${encodeURIComponent(
            desc,
          )}`,
        );
        return;
      }

      const session = data.session;
      const { access_token, refresh_token, expires_at } = {
        ...session,
        expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      };

      try {
        const user = await getProfile(access_token);
        setAuth(user, { access_token, refresh_token, expires_at });
        await mergeGuestCartOnLogin(guest);
        router.push(redirect);
      } catch (profileErr: unknown) {
        console.warn(
          "[OAuth Callback] getProfile failed, trying sync-profile:",
          profileErr instanceof Error ? profileErr.message : profileErr,
        );
        const oauthName =
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          session.user.email ??
          "";
        const oauthEmail = session.user.email ?? "";

        try {
          // Add a timeout so the user never gets stuck on a spinner
          const SYNC_TIMEOUT_MS = 20_000;
          const syncPromise = syncProfile(access_token, oauthName, oauthEmail);
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Profile sync timed out")),
              SYNC_TIMEOUT_MS,
            ),
          );
          const user = await Promise.race([syncPromise, timeout]);
          setAuth(user, { access_token, refresh_token, expires_at });
          await mergeGuestCartOnLogin(guest);
          router.push(redirect);
        } catch (syncErr: unknown) {
          const syncMsg = syncErr instanceof Error ? syncErr.message : "unknown";
          console.error(
            "[OAuth Callback] Profile sync failed:",
            syncMsg,
          );

          // Do NOT set phantom auth state — just redirect with error
          router.push(
            `/login?error=oauth_profile_failed&error_description=${encodeURIComponent(
              syncMsg || "Could not create backend profile. Please try again.",
            )}`,
          );
        }
      }
    };

    handleCallback();
  }, [router, setAuth]);

  return (
    <div className="min-h-dvh bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#71767b]">Completing sign-in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
