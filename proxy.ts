import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Session cookie set by the backend — its presence gates the admin section.
 */
const SESSION_COOKIE = "dw_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OAuth callback handoff: /?code=... → /auth/callback
  const code = request.nextUrl.searchParams.get("code");
  if (pathname === "/" && code) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // M5: cookie-presence gate for the admin section. The `dw_session` httpOnly
  // cookie exists only when a session is active — if it's absent, bounce to
  // /admin/login before any admin shell renders (no unauthenticated shell
  // flash). This is NOT the security boundary: the cookie is not signed and
  // the JWT is not verified here (Edge can't). Real authorization stays in
  // the backend (AuthGuard + RolesGuard on every admin endpoint) and the
  // admin layout re-verifies the live session via GET /auth/profile.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      // The login page reads `redirect` and only honours paths under /admin.
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
