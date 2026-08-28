"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabase";
import { API_BASE } from "@/src/lib/constants";
import { takePostAuthRedirect } from "@/src/lib/oauth-redirect";
import {
  mergeGuestCartOnLogin,
  snapshotGuestCart,
} from "@/src/lib/cart-sync";
import { useAuthStore } from "@/src/store/useAuthStore";
import { AuthSpinner } from "@/src/components/auth/AuthLanding";

function CallbackHandler() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      // Capture guest cart before auth state flips (RootClient may load server cart).
      const guest = snapshotGuestCart();

      const getParam = (key: string) =>
        new URLSearchParams(window.location.search).get(key);

      const redirect = takePostAuthRedirect(getParam("redirect"));

      // Supabase/Google append `?error=...&error_description=...` when the
      // provider itself rejects the sign-in or the redirect URL is not on the
      // project's allow-list. Surface that instead of a generic failure.
      const providerError = getParam("error") || getParam("error_code");
      if (providerError) {
        const desc = getParam("error_description") || providerError;
        console.error("[OAuth Callback] Provider error:", providerError, desc);
        router.push(
          `/login?error=oauth_failed&error_description=${encodeURIComponent(desc)}`,
        );
        return;
      }

      const code = getParam("code");
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

      let session = sessionResult.data?.session ?? null;
      let sessionError: { message: string } | null = sessionResult.error;

      if (sessionError) {
        console.error("[OAuth Callback] Session error:", sessionError.message);
      }

      // `detectSessionInUrl` normally exchanges the code during client init.
      // If it didn't (race, or it silently failed), try once explicitly so the
      // real reason surfaces — a missing PKCE verifier ("code verifier ...")
      // points at a cross-origin / redirect-URL mismatch rather than a
      // transient error.
      if (!sessionError && !session) {
        try {
          const exchanged = await supabase.auth.exchangeCodeForSession(code);
          session = exchanged.data?.session ?? null;
          sessionError = exchanged.error;
          if (exchanged.error) {
            console.error(
              "[OAuth Callback] exchangeCodeForSession failed:",
              exchanged.error.message,
            );
          }
        } catch (err) {
          console.error("[OAuth Callback] exchangeCodeForSession threw:", err);
        }
      }

      if (sessionError || !session) {
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
        // Supabase client's localStorage copy so the app never reads tokens
        // from JS storage again. We must NOT use signOut() for this:
        // supabase-js always posts to /auth/v1/logout regardless of scope,
        // which revokes the Supabase session — including the rotated tokens
        // the cookie just imported — and invalidates it immediately.
        // Removing the storage keys directly forgets the tokens locally
        // without revoking the server-side session the cookie depends on.
        //
        // Exception: the password-recovery flow hands off to
        // /reset-password, which re-uses the Supabase localStorage session to
        // verify the link and update the password — keep it in that case.
        const isRecoveryRedirect =
          redirect === "/reset-password" ||
          redirect.startsWith("/reset-password");
        if (!isRecoveryRedirect) {
          try {
            Object.keys(window.localStorage)
              .filter((k) => k.startsWith("sb-"))
              .forEach((k) => window.localStorage.removeItem(k));
          } catch {
            // Non-fatal: the cookie already holds the session.
          }
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
