"use client";

import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Calendar, Download } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";

const pressReleases = [
  { date: "March 15, 2025", title: "CholoKini Launches Sustainable Packaging Initiative", summary: "Our commitment to the planet: all CholoKini orders will now ship in 100% recycled, biodegradable packaging as part of our ongoing sustainability efforts." },
  { date: "January 10, 2025", title: "CholoKini Raises $12M Series A to Expand Curated Marketplace", summary: "The funding round, led by Venture Partners, will fuel expansion into new categories, including home goods and artisan crafts from emerging markets." },
  { date: "November 5, 2024", title: "CholoKini Named Best New E-Commerce Platform by Retail Today", summary: "Recognized for our innovative approach to product curation and exceptional customer experience in the competitive e-commerce landscape." },
  { date: "September 20, 2024", title: "Introducing CholoKini Premium: A Curated Collection of Luxury Essentials", summary: "Our new premium tier features hand-selected luxury items from renowned artisans and designers around the world." },
];

const mentions = [
  { publication: "TechCrunch", title: "How CholoKini Is Changing The Way We Shop Online", date: "February 2025" },
  { publication: "Forbes", title: "The Rise of Curated E-Commerce: CholoKini Leading the Charge", date: "January 2025" },
  { publication: "Vogue", title: "Our Editors' Favorite Online Shopping Destinations", date: "December 2024" },
  { publication: "Business Insider", title: "This Startup Is Making Online Shopping Feel Personal Again", date: "November 2024" },
];

export default function PressPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Press" }]} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-7 h-7 text-primary dark:text-primary-light" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Press</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-6">
            Latest news, press releases, and media coverage about CholoKini.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/contact">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Press Kit
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="sm">Media Inquiries</Button>
            </Link>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Press Releases</h2>
          <div className="space-y-4">
            {pressReleases.map(({ date, title, summary }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6"
              >
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  <Calendar className="w-3 h-3" />
                  {date}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{summary}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">In the Media</h2>
          <div className="space-y-3">
            {mentions.map(({ publication, title, date }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-primary font-medium mb-1">{publication}</p>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{date}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8">
          <h2 className="font-serif text-xl font-bold mb-2">Media Contact</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">For press inquiries, please contact:</p>
          <p className="text-sm font-medium">press@cholokini.com</p>
        </div>
      </div>
    </motion.div>
  );
}
