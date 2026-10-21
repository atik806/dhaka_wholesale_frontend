"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/src/components/ui/Button";
import { usePromoBanner } from "@/src/hooks/useApi";
import { fetchFlashSale, type PromoBannerData } from "@/src/lib/api";
import { OFFER_POLL_MS } from "@/src/lib/constants";
import { getCountdownParts, getOfferStatus } from "@/src/lib/offers";
import { safePromoLink } from "@/src/lib/utils";
import { normalizePromoBanner } from "@/src/lib/promo-banner";

interface PromoBannerProps {
  /** Server-rendered data so the banner paints instantly; SWR revalidates in the background. */
  fallbackData?: PromoBannerData | null;
}

export function PromoBanner({ fallbackData }: PromoBannerProps) {
  const { data: fetched } = usePromoBanner(fallbackData);
  const { data: flashSale } = useSWR("/offers", () => fetchFlashSale(), {
    refreshInterval: OFFER_POLL_MS,
    revalidateOnFocus: true,
  });
  const [now, setNow] = useState<number | null>(null);

  const raw = (fetched ?? null) as
    (PromoBannerData & { data?: PromoBannerData }) | null;
  const payload =
    raw && typeof raw === "object" && "data" in raw && raw.data
      ? raw.data
      : raw;
  const promo = normalizePromoBanner(payload);
  // Offers may supply a countdown for an offers link. Saved banner content and
  // visibility always belong to Site Settings, even when a sale is configured.
  const sale = promo.button_link === "/offers" ? flashSale : null;
  const hasSaleWindow = Boolean(
    sale?.enabled && sale.starts_at && sale.ends_at,
  );

  useEffect(() => {
    if (!hasSaleWindow) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1_000);
    return () => window.clearInterval(timer);
  }, [hasSaleWindow]);

  if (!promo.enabled) return null;

  const countdown =
    hasSaleWindow &&
    sale &&
    now !== null &&
    getOfferStatus(sale, now) === "live"
      ? getCountdownParts(sale.ends_at, now)
      : null;
  const countdownUnits = countdown
    ? ([
        [countdown.days, "days"],
        [countdown.hours, "hrs"],
        [countdown.minutes, "min"],
        [countdown.seconds, "sec"],
      ] as const)
    : [];

  return (
    <section className="relative overflow-hidden bg-brand">
      {/* Subtle radial gradient overlay for visual depth */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(245, 163, 0, 0.15) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 163, 0, 0.3) 0%, transparent 70%)",
        }}
      />

      <div className="container relative py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-16">
          <div className="max-w-2xl">
            {promo.badge && (
              <p className="label-caps text-accent mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {promo.badge}
              </p>
            )}

            <h2 className="text-[28px] sm:text-3xl lg:text-[2.25rem] font-bold text-brand-fg leading-tight mb-3 font-serif">
              {promo.title}
            </h2>

            <p className="text-sm sm:text-base text-brand-fg/75 leading-relaxed max-w-xl">
              {promo.subtitle}
            </p>

            {countdown && (
              <div
                className="mt-5 flex gap-2"
                aria-label="Time remaining in sale"
              >
                {countdownUnits.map(([value, label]) => (
                  <div
                    key={label}
                    className="min-w-12 rounded-lg border border-white/10 bg-white/10 px-2.5 py-2 text-center backdrop-blur-sm"
                  >
                    <strong className="block font-mono text-base leading-none text-brand-fg tabular-nums">
                      {String(value).padStart(2, "0")}
                    </strong>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-brand-fg/60">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href={safePromoLink(promo.button_link)}
            className={buttonClasses({
              size: "lg",
              className:
                "shrink-0 w-full sm:w-auto shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200",
            })}
          >
            {promo.button_text || "Shop now"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
