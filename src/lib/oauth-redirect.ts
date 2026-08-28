/**
 * Post-OAuth redirect handling.
 *
 * The "where to go after sign-in" target is stashed in sessionStorage instead
 * of being appended to the Supabase `redirectTo` URL. Supabase validates
 * `redirect_to` against the project's "Redirect URLs" allow-list with glob
 * matching, and an exact entry such as
 *   https://dhakawholesale.com/auth/callback
 * does NOT match a URL that carries a query string like `?redirect=%2F`. When
 * the match fails Supabase silently falls back to the Site URL, the PKCE code
 * lands on the wrong path, and the sign-in dies with "No session found".
 *
 * Keeping `redirectTo` a bare `<origin>/auth/callback` means the exact
 * allow-list entry is enough.
 */
const STORAGE_KEY = "dw:postAuthRedirect";

function isSafePath(path: string | null | undefined): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

/** Call right before `signInWithOAuth` / `resetPasswordForEmail`. */
export function rememberPostAuthRedirect(path: string | null): void {
  if (!isSafePath(path) || path === "/") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    // Private mode / storage disabled — the callback just defaults to "/".
  }
}

/** Call once in the OAuth callback. Consumes and clears the stored value. */
export function takePostAuthRedirect(fallback?: string | null): string {
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  if (isSafePath(stored)) return stored;
  if (isSafePath(fallback)) return fallback;
  return "/";
}

/** The bare callback URL to hand to Supabase — no query string (see above). */
export function oauthCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}
