import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://placeholder.vercel.app/api";

let apiOrigin: string;
try {
  apiOrigin = new URL(apiUrl).origin;
} catch {
  apiOrigin = apiUrl.startsWith("http") ? apiUrl : `https://${apiUrl}`;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseOrigin = "";
if (supabaseUrl) {
  try {
    supabaseOrigin = new URL(supabaseUrl).origin;
  } catch {
    supabaseOrigin = supabaseUrl.startsWith("http") ? supabaseUrl : `https://${supabaseUrl}`;
  }
}
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    // Every distinct (src, width, quality) costs a Hobby-plan transformation.
    // Next 16 keeps optimized images for only 4h by default, so the same
    // product photos were re-transformed all day. Uploads get unique file
    // names (upload.service.ts), so a long TTL can't serve a stale image.
    minimumCacheTTL: 2678400, // 31 days
    // Fewer widths = fewer variants per image (the defaults generate ~12).
    // Three widths per photo: 256 for thumbnails, swatches and cart lines,
    // 640 for product cards, 1080 for the product gallery. Phones and
    // desktops share them, so most requests hit an already-made variant.
    deviceSizes: [640, 1080],
    imageSizes: [256],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseOrigin
        ? [{ protocol: "https" as const, hostname: new URL(supabaseOrigin).hostname }]
        : []),
    ],
  },
  // Proxy the browser's same-origin `/api/*` requests to the real backend.
  // The frontend (dhakawholesale.com) and backend (*.vercel.app) are different
  // sites, so a cookie the backend sets cross-site is dropped by Safari and by
  // Chrome's third-party-cookie controls — which silently breaks admin and
  // customer login. Routing every browser API call through this same-origin
  // path makes the `dw_session` cookie first-party. Server-side code still
  // calls the backend directly (see src/lib/constants.ts).
  // Duplicate listings that were merged into another product: keep old links
  // (Facebook posts, shared carts) landing on the product that replaced them.
  async redirects() {
    return [
      {
        source: "/product/crystal-floral-hair-claw-clip-pink-and-amber",
        destination: "/product/crystal-floral-hair-claw-clip-assorted-colors",
        permanent: true,
      },
      {
        source: "/product/flower-brooch-pin-red-orchid-purple-and-multicolored",
        destination: "/product/elegant-crystal-flower-brooch-purple-pink",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/:path*`,
      },
    ];
  },
  // Keep recently-viewed dynamic pages (product/category) in the client router
  // cache briefly so back-navigation renders instantly instead of re-fetching.
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // C4: `script-src 'unsafe-inline'` is kept intentionally. The App
            // Router inlines bootstrapping scripts during streaming/hydration,
            // so a strict nonce policy would need middleware-injected nonces
            // plus a next/script transform to be reliable — deferred. The
            // residual inline-script surface is mitigated by React's
            // auto-escaping and by the URL-scheme guards (isSafeHttpUrl /
            // safePromoLink) applied to every DB-backed URL the app renders.
            // `'unsafe-eval'` is dev-only (added when NODE_ENV !== production).
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ${apiOrigin}${supabaseOrigin ? ` ${supabaseOrigin}` : ""}; frame-ancestors 'none';`,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
