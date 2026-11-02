"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FB_PIXEL_ID, GA_ID, trackPageView } from "@/src/lib/analytics";

/**
 * Loads the Meta Pixel and GA4 (only those whose IDs are configured) and
 * reports a page view on every client-side navigation. Admin pages are not
 * tracked. See src/lib/analytics.ts for the IDs and events.
 */
export function Analytics() {
  const pathname = usePathname();
  const lastUrl = useRef<string | null>(null);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    // Read the query from the browser: useSearchParams would force a
    // Suspense boundary around the whole layout.
    const url = `${window.location.origin}${pathname}${window.location.search}`;
    if (lastUrl.current === url) return;
    // The base snippets below send the first page view themselves.
    if (lastUrl.current !== null) trackPageView();
    lastUrl.current = url;
  }, [pathname, isAdmin]);

  if (isAdmin || (!FB_PIXEL_ID && !GA_ID)) return null;

  return (
    <>
      {FB_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(FB_PIXEL_ID)});
fbq('track', 'PageView');`}
        </Script>
      )}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(GA_ID)});`}
          </Script>
        </>
      )}
    </>
  );
}
