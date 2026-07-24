"use client";

import { memo } from "react";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  Banknote,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/src/hooks/useApi";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { SITE_NAME } from "@/src/lib/constants";

const reassurance = [
  {
    icon: Truck,
    title: "Nationwide delivery",
    detail: "All 64 districts of Bangladesh",
  },
  {
    icon: Banknote,
    title: "Cash on delivery",
    detail: "Pay when your parcel arrives",
  },
  {
    icon: ShieldCheck,
    title: "Genuine products",
    detail: "Sourced direct from suppliers",
  },
  {
    icon: Headphones,
    title: "Customer support",
    detail: "Every day, 10am – 8pm",
  },
];

const supportLinks = [
  { label: "Contact Market Help", href: "/contact" },
  { label: "Shipping & Returns Policy", href: "/shipping-returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const companyLinks = [
  { label: "About Dhaka Wholesale", href: "/about" },
  { label: "Track Your Order", href: "/track-order" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms of Service", href: "/privacy-policy" },
];

const linkClass =
  "text-[13px] text-brand-fg/70 hover:text-accent transition-colors";
const headingClass = "text-[15px] font-bold text-brand-fg mb-4";

export const Footer = memo(function Footer() {
  const { data: categories = [] } = useCategories();

  return (
    <footer className="bg-brand text-brand-fg">
      {/* Reassurance strip */}
      <div className="border-y border-brand-fg/10">
        <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 py-6">
          {reassurance.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-brand-fg leading-tight">
                  {title}
                </p>
                <p className="text-xs text-brand-fg/60 mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer content */}
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Brand, blurb and contact details */}
          <div className="lg:col-span-2 sm:col-span-2">
            <SiteLogo variant="footer" showWordmark />

            <p className="text-[13px] text-brand-fg/70 max-w-sm leading-relaxed mt-4">
              Dhaka Wholesale is Bangladesh&apos;s trusted online store. Quality
              products, cash on delivery, and fast shipping nationwide.
            </p>

            <div className="space-y-2.5 mt-5 text-[13px]">
              <a
                href="tel:01302228993"
                className="flex items-center gap-2.5 text-brand-fg/80 hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span className="tabular">+880 1302 228993</span>
              </a>
              <a
                href="mailto:atikrj8@gmail.com"
                className="flex items-center gap-2.5 text-brand-fg/80 hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>atikrj8@gmail.com</span>
              </a>
              <p className="flex items-start gap-2.5 text-brand-fg/70">
                <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>Kuril, Koylabari, Tushar Villa, Dhaka, Bangladesh</span>
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <a
                href="https://www.facebook.com/profile.php?id=61588527085764"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md bg-brand-fg/10 ring-1 ring-brand-fg/15 text-brand-fg hover:bg-accent hover:text-accent-fg hover:ring-accent flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md bg-brand-fg/10 ring-1 ring-brand-fg/15 text-brand-fg hover:bg-accent hover:text-accent-fg hover:ring-accent flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="mailto:atikrj8@gmail.com"
                className="w-10 h-10 rounded-md bg-brand-fg/10 ring-1 ring-brand-fg/15 text-brand-fg hover:bg-accent hover:text-accent-fg hover:ring-accent flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="tel:01302228993"
                className="w-10 h-10 rounded-md bg-brand-fg/10 ring-1 ring-brand-fg/15 text-brand-fg hover:bg-accent hover:text-accent-fg hover:ring-accent flex items-center justify-center transition-colors"
                aria-label="Phone Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <nav aria-labelledby="footer-shop">
            <h4 id="footer-shop" className={headingClass}>
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shop" className={linkClass}>
                  Shop All Products
                </Link>
              </li>
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/shop/${cat.slug}`} className={linkClass}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer care */}
          <nav aria-labelledby="footer-support">
            <h4 id="footer-support" className={headingClass}>
              Customer Care
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company + accepted payments */}
          <nav aria-labelledby="footer-company">
            <h4 id="footer-company" className={headingClass}>
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="label-caps text-brand-fg/50 mt-8 mb-2.5">
              Accepted Payments
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-brand-fg/10 ring-1 ring-brand-fg/15 text-[11px] font-bold tracking-wide text-brand-fg">
                <Banknote className="w-3.5 h-3.5 text-accent" />
                CASH ON DELIVERY
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-brand-deep border-t border-brand-fg/10 py-5">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-brand-fg/60">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-brand-fg/60">
            Trusted online store in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
});
