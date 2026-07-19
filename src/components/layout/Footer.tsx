"use client";

import { memo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/src/hooks/useApi";
import { SiteLogo } from "@/src/components/brand/SiteLogo";

export const Footer = memo(function Footer() {
  const { data: categories = [] } = useCategories();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-zinc-900 dark:bg-black text-zinc-300 dark:text-zinc-400">
      {/* Newsletter Bar */}
      <div className="border-b border-zinc-800">
        <div className="container py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-serif text-xl font-bold mb-1">Stay Updated</h3>
              <p className="text-zinc-400 text-sm">Get the latest deals, new arrivals, and exclusive offers.</p>
            </div>
            {subscribed ? (
              <p className="text-sm text-emerald-400 font-medium">Thanks for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 md:w-72 bg-zinc-800 border border-zinc-700 rounded-l-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-600 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#0b2c5f] hover:bg-[#1a4a8a] text-white px-5 py-2.5 rounded-r-lg text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
                >
                  Subscribe <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          <div className="lg:col-span-2">
            <div className="mb-5">
              <SiteLogo variant="footer" />
            </div>
            <p className="text-zinc-400 dark:text-zinc-500 max-w-sm text-sm leading-relaxed mb-5">
              Curating the finest products from around the world, delivered to
              your doorstep. Quality you can see, feel, and trust.
            </p>
            <div className="flex items-center gap-2 mb-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-[#0b2c5f] flex items-center justify-center transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-[#e31c23] flex items-center justify-center transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="mailto:atikrj8@gmail.com" className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:01302228993" className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-600">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Kuril, Koylabari, Tushar Villa, Dhaka</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Shop</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Shipping & Returns", href: "/shipping-returns" },
                { label: "FAQ", href: "/faq" },
                { label: "Size Guide", href: "/size-guide" },
                { label: "Privacy Policy", href: "/privacy-policy" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-semibold text-sm mb-3 mt-6">Payment Methods</h4>
            <div className="flex flex-wrap items-center gap-2">
              {["bKash", "Nagad", "COD", "Visa"].map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 rounded-md bg-zinc-800 text-[11px] font-medium text-zinc-400 border border-zinc-700/50"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Dhaka Wholesale. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-600">
            Made with <Heart className="w-3 h-3 text-[#e31c23]" /> in Bangladesh
          </div>
        </div>
      </div>
    </footer>
  );
});
