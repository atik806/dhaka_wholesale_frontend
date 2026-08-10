"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/src/components/ui/Button";
import { usePromoBanner } from "@/src/hooks/useApi";
import type { PromoBannerData } from "@/src/lib/api";
import { safePromoLink } from "@/src/lib/utils";

const DEFAULT_PROMO: PromoBannerData = {
  badge: "Limited time offer",
  title: "Seasonal Sale — Up to 40% Off",
  subtitle:
    "Hundreds of trending items at great prices. Cash on delivery available on all items.",
  button_text: "Shop the sale",
  button_link: "/shop",
  enabled: true,
};

interface PromoBannerProps {
  /** Server-rendered data so the banner paints instantly; SWR revalidates in the background. */
  fallbackData?: PromoBannerData | null;
}

export function PromoBanner({ fallbackData }: PromoBannerProps) {
  const { data: fetched } = usePromoBanner(fallbackData);

  const raw = (fetched ?? null) as PromoBannerData & { data?: PromoBannerData } | null;
  const payload = raw && typeof raw === "object" && "data" in raw && raw.data ? raw.data : raw;
  const promo =
    payload && payload.enabled !== false
      ? { ...DEFAULT_PROMO, ...payload }
      : DEFAULT_PROMO;

  if (!promo.enabled) return null;

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
