"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/src/lib/constants";
import { buttonClasses } from "@/src/components/ui/Button";

interface PromoBannerData {
  badge?: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  enabled?: boolean;
}

export function PromoBanner() {
  const [promo, setPromo] = useState<PromoBannerData>({
    badge: "Limited time offer",
    title: "Seasonal Sale — Up to 40% Off",
    subtitle: "Hundreds of trending items at great prices. Cash on delivery available on all items.",
    button_text: "Shop the sale",
    button_link: "/shop",
    enabled: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/site-settings/promo_banner`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.enabled !== false) {
          setPromo(data);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!promo.enabled) return null;

  return (
    <section className="bg-brand">
      <div className="container py-10 sm:py-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
          <div className="max-w-2xl">
            {promo.badge && (
              <p className="label-caps text-accent mb-2.5">{promo.badge}</p>
            )}

            <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-brand-fg leading-tight mb-3">
              {promo.title}
            </h2>

            <p className="text-sm sm:text-base text-brand-fg/80 leading-relaxed">
              {promo.subtitle}
            </p>
          </div>

          <Link
            href={promo.button_link || "/shop"}
            className={buttonClasses({
              size: "lg",
              className: "shrink-0 w-full sm:w-auto shadow-md",
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
