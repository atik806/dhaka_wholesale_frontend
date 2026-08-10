"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabase";
import { API_BASE } from "@/src/lib/constants";
import {
  mergeGuestCartOnLogin,
  snapshotGuestCart,
} from "@/src/lib/cart-sync";
import { useAuthStore } from "@/src/store/useAuthStore";
import { AuthSpinner } from "@/src/components/auth/AuthLanding";

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
        // Import the Supabase client session into the httpOnly dw_session
        // cookie. The backend verifies the access token, creates the profile
        // for a brand-new OAuth user, and responds with the user — the tokens
        // themselves never reach JavaScript.
        const res = await fetch(`${API_BASE}/auth/sync-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ access_token, refresh_token, expires_at }),
        });
        if (!res.ok) throw new Error("Could not import session into cookie");

        const json = await res.json();
        const user = json.data?.user;
        if (!user) throw new Error("Empty user from session sync");

        // The httpOnly cookie is the only session store now — purge the
        // tokens the Supabase client wrote to localStorage. scope:'local'
        // clears this browser only and never calls the server, so it cannot
        // revoke the refresh token the cookie depends on.
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          // Non-fatal: the cookie already holds the session.
        }

        setAuth(user);
        await mergeGuestCartOnLogin(guest);
        router.push(redirect);
      } catch (syncErr: unknown) {
        const syncMsg = syncErr instanceof Error ? syncErr.message : "unknown";
        console.error(
          "[OAuth Callback] Session sync failed:",
          syncMsg,
        );

        // Do NOT set phantom auth state — just redirect with error
        router.push(
          `/login?error=oauth_exchange_failed&error_description=${encodeURIComponent(
            syncMsg || "Could not complete Google sign-in. Please try again.",
          )}`,
        );
      }
    };

    handleCallback();
  }, [router, setAuth]);

  return <AuthSpinner message="Completing sign-in…" />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthSpinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
