"use client";

import { memo } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/src/hooks/useApi";
import { SiteLogo } from "@/src/components/brand/SiteLogo";

export const Footer = memo(function Footer() {
  const { data: categories = [] } = useCategories();

  return (
    <footer className="bg-[#132A3A] dark:bg-[#0A1A28] text-[#E7DCC4] border-t-2 border-[#E7DCC4]/30">
      {/* Main Footer Content */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Column 1: Logo + About Text + Social Icons + Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <SiteLogo variant="footer" showWordmark />
            </div>

            <p className="text-xs sm:text-sm text-[#E7DCC4]/80 max-w-sm leading-relaxed font-sans">
              Dhaka Wholesale is Bangladesh&apos;s trusted online store. Quality products, cash on delivery, and fast shipping nationwide.
            </p>

            {/* Contact Details */}
            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#E7DCC4]/90">
                <Phone className="w-3.5 h-3.5 text-[#F5A300]" />
                <span>+880 1302 228993</span>
              </div>
              <div className="flex items-center gap-2 text-[#E7DCC4]/90">
                <Mail className="w-3.5 h-3.5 text-[#F5A300]" />
                <span>atikrj8@gmail.com</span>
              </div>
              <div className="flex items-start gap-2 text-[#E7DCC4]/90">
                <MapPin className="w-3.5 h-3.5 text-[#F5A300] mt-0.5 shrink-0" />
                <span>Kuril, Koylabari, Tushar Villa, Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-[2px] bg-[#0D1F2C] dark:bg-[#071520] border border-[#E7DCC4]/30 dark:border-[#2a3d4d] hover:bg-[#F5A300] hover:text-[#132A3A] hover:border-[#D88900] flex items-center justify-center transition-colors text-white"
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
                className="w-9 h-9 rounded-[2px] bg-[#0D1F2C] dark:bg-[#071520] border border-[#E7DCC4]/30 dark:border-[#2a3d4d] hover:bg-[#BE3D1F] hover:text-white hover:border-red-900 flex items-center justify-center transition-colors text-white"
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
                className="w-9 h-9 rounded-[2px] bg-[#0D1F2C] dark:bg-[#071520] border border-[#E7DCC4]/30 dark:border-[#2a3d4d] hover:bg-[#F5A300] hover:text-[#132A3A] flex items-center justify-center transition-colors text-white"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="tel:01302228993"
                className="w-9 h-9 rounded-[2px] bg-[#0D1F2C] dark:bg-[#071520] border border-[#E7DCC4]/30 dark:border-[#2a3d4d] hover:bg-[#1F6F50] hover:text-white flex items-center justify-center transition-colors text-white"
                aria-label="Phone Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div>
            <h4 className="font-serif font-bold text-white text-base mb-4 pb-2 border-b border-[#E7DCC4]/20 dark:border-[#2a3d4d] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#F5A300] inline-block" /> Shop
            </h4>
            <ul className="space-y-2.5 font-sans text-xs">
              <li>
                <Link href="/shop" className="text-[#E7DCC4]/80 hover:text-[#F5A300] transition-colors">
                  Shop All Products
                </Link>
              </li>
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="text-[#E7DCC4]/80 hover:text-[#F5A300] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div>
            <h4 className="font-serif font-bold text-white text-base mb-4 pb-2 border-b border-[#E7DCC4]/20 dark:border-[#2a3d4d] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#BE3D1F] inline-block" /> Customer Care
            </h4>
            <ul className="space-y-2.5 font-sans text-xs">
              {[
                { label: "Contact Market Help", href: "/contact" },
                { label: "Shipping & Returns Policy", href: "/shipping-returns" },
                { label: "FAQ", href: "/faq" },
                { label: "Size Guide", href: "/size-guide" },
                { label: "Privacy Policy", href: "/privacy-policy" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[#E7DCC4]/80 hover:text-[#F5A300] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company Links & Payment Method Tags */}
          <div>
            <h4 className="font-serif font-bold text-white text-base mb-4 pb-2 border-b border-[#E7DCC4]/20 dark:border-[#2a3d4d] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#1F6F50] inline-block" /> Company
            </h4>
            <ul className="space-y-2.5 font-sans text-xs mb-6">
              {[
                { label: "About Dhaka Wholesale", href: "/about" },
                { label: "Track Your Order", href: "/track-order" },
                { label: "Contact Us", href: "/contact" },
                { label: "Terms of Service", href: "/privacy-policy" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[#E7DCC4]/80 hover:text-[#F5A300] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <h5 className="font-mono text-xs font-bold text-[#F5A300] uppercase tracking-wider mb-2.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Accepted Payments
            </h5>
            {/* Small bordered mono labels for payment methods */}
            <div className="flex flex-wrap items-center gap-2">
              {["bKash", "Nagad", "COD", "Visa"].map((method) => (
                <span
                  key={method}
                  className="font-mono text-[11px] font-bold px-2.5 py-1 bg-[#0D1F2C] dark:bg-[#071520] text-[#E7DCC4] border border-[#E7DCC4]/40 dark:border-[#2a3d4d] rounded-[2px] shadow-sm uppercase tracking-wider"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Darker Navy base with Copyright & Payment Method tags note */}
      <div className="bg-[#0D1F2C] dark:bg-[#071520] border-t border-[#E7DCC4]/20 dark:border-[#2a3d4d] py-5 text-xs font-mono text-[#E7DCC4]/70">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} DHAKADROP. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-1.5 text-[#E7DCC4]">
            TRUSTED ONLINE STORE <Heart className="w-3 h-3 text-[#BE3D1F]" /> IN BANGLADESH
          </div>
        </div>
      </div>
    </footer>
  );
});
