"use client";

import { memo } from "react";
import {
  Globe,
  MessageCircle,
  Video,
  Radio,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { categories } from "@/src/lib/constants";

export const Footer = memo(function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-black text-zinc-300 dark:text-zinc-400">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold text-white">
                Dhaka<span className="text-primary-light dark:text-emerald-400"> Wholesale</span>
              </span>
            </Link>
            <p className="text-zinc-400 dark:text-zinc-500 max-w-sm text-sm leading-relaxed mb-6">
              Curating the finest products from around the world, delivered to
              your doorstep. Quality you can see, feel, and trust.
            </p>
            <div className="flex items-center gap-2 mb-6">
              {[Globe, MessageCircle, Video, Radio].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-xl bg-zinc-800 dark:bg-zinc-800 flex items-center justify-center opacity-60"
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-600">
              <Heart className="w-3 h-3 text-primary-light" />
              Made with care for quality living
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Shop</h4>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((cat) => (
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
            <ul className="space-y-3">
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
            <ul className="space-y-3">
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
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-zinc-800 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-600">
            &copy; 2026 Dhaka Wholesale. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});
