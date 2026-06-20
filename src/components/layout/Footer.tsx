"use client";

import { motion } from "framer-motion";
import {
  Globe,
  MessageCircle,
  Video,
  Radio,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { categories } from "@/src/lib/constants";

export function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-black text-zinc-300 dark:text-zinc-400">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold text-white">
                Cholo<span className="text-primary-light dark:text-emerald-400">Kini</span>
              </span>
            </Link>
            <p className="text-zinc-400 dark:text-zinc-500 max-w-md text-sm leading-relaxed mb-6">
              Curating the finest products from around the world, delivered to
              your doorstep. Quality you can see, feel, and trust.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, MessageCircle, Video, Radio].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-zinc-800 dark:bg-zinc-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5">
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
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5">
              {["Contact Us", "Shipping & Returns", "FAQ", "Size Guide", "Privacy Policy"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            &copy; 2025 CholoKini. All rights reserved.
          </p>

          <div className="flex items-center gap-2 bg-zinc-800 dark:bg-zinc-800 rounded-xl px-3 py-1.5 w-full sm:w-auto">
            <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <input
              type="email"
              placeholder="Your email for updates"
              className="flex-1 bg-transparent text-sm py-1.5 outline-none text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-w-0"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
