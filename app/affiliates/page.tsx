"use client";

import { motion } from "framer-motion";
import { Handshake, DollarSign, Percent, BarChart3, Users, Globe } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";

const features = [
  { icon: DollarSign, title: "Competitive Commission", description: "Earn up to 15% commission on every sale you generate. Our tiered structure rewards high-performing affiliates with even better rates." },
  { icon: Percent, title: "Cookie Duration", description: "30-day cookie window means you get credit for any purchase a referred customer makes within 30 days of clicking your link." },
  { icon: BarChart3, title: "Real-Time Analytics", description: "Track your clicks, conversions, and commissions with our intuitive dashboard. See exactly how your content is performing." },
  { icon: Users, title: "Dedicated Support", description: "You'll get a personal affiliate manager who will help you optimize your strategy and maximize your earnings." },
  { icon: Globe, title: "Global Program", description: "Our affiliate program is open to creators worldwide. Promote products you love to your audience, wherever they are." },
  { icon: Handshake, title: "Early Access", description: "Get early access to new products, exclusive discounts for your audience, and invitations to special events." },
];

const tiers = [
  { level: "Starter", commission: "8%", requirement: "0 - 50 sales/month" },
  { level: "Premium", commission: "12%", requirement: "51 - 200 sales/month" },
  { level: "Elite", commission: "15%", requirement: "200+ sales/month" },
];

export default function AffiliatesPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Affiliates" }]} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Handshake className="w-7 h-7 text-primary dark:text-primary-light" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Affiliate Program</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-6">
            Turn your audience into income. Join the CholoKini affiliate program and earn commissions promoting products you love.
          </p>
          <Link href="/contact">
            <Button size="lg">Apply Now</Button>
          </Link>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Commission Tiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tiers.map(({ level, commission, requirement }, i) => (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-6 text-center ${
                  level === "Premium"
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <h3 className={`font-semibold text-lg mb-1 ${level === "Premium" ? "text-white" : ""}`}>{level}</h3>
                <p className={`text-3xl font-bold mb-2 ${level === "Premium" ? "text-white" : ""}`}>{commission}</p>
                <p className={`text-sm ${level === "Premium" ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"}`}>{requirement}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Why Partner With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary dark:text-primary-light" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8 text-center">
          <h2 className="font-serif text-xl font-bold mb-2">Ready to Get Started?</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Join hundreds of affiliates earning commissions promoting quality products.</p>
          <Link href="/contact">
            <Button>Apply as an Affiliate</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
