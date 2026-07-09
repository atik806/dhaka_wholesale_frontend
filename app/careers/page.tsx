"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";

const positions = [
  {
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build and scale our e-commerce platform, working with Next.js, NestJS, and Supabase to deliver a world-class shopping experience.",
  },
  {
    title: "Product Curator",
    department: "Curation",
    location: "New York, NY",
    type: "Full-time",
    description: "Source and evaluate products from around the world. You'll travel to trade shows, meet artisans, and build relationships with brands.",
  },
  {
    title: "Customer Experience Lead",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description: "Lead our customer support team to deliver exceptional service. You'll shape our support strategy and ensure every customer feels valued.",
  },
  {
    title: "Marketing Designer",
    department: "Marketing",
    location: "San Francisco, CA",
    type: "Full-time",
    description: "Create compelling visual content for our campaigns, social media, and website. You'll own the creative direction of our marketing efforts.",
  },
  {
    title: "Supply Chain Coordinator",
    department: "Operations",
    location: "Chicago, IL",
    type: "Full-time",
    description: "Manage our logistics network, coordinate with shipping partners, and ensure timely delivery to customers worldwide.",
  },
];

const benefits = [
  "Competitive salary and equity packages",
  "Health, dental, and vision insurance",
  "Flexible remote work policy",
  "Annual learning & development budget",
  "Home office setup stipend",
  "Quarterly team retreats",
  "Generous PTO and paid holidays",
  "Parental leave",
];

export default function CareersPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Careers" }]} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-primary dark:text-primary-light" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Join Our Team</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Help us redefine the way people discover and shop for quality products.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Why Work at CholoKini</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 sm:p-8 mb-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
              We're a team of passionate people building the future of curated e-commerce. We believe in quality — not just in the products we sell, but in the way we work, the culture we build, and the impact we make.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-4">
            {positions.map(({ title, department, location, type, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-xs text-primary font-medium mb-3">{department}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {type}</span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">{description}</p>
                  </div>
                  <Link href="/contact">
                    <Button variant="outline" size="sm">Apply Now</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8">
          <h2 className="font-serif text-xl font-bold mb-2">Don't See a Fit?</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">We're always looking for talented people. Send us your resume.</p>
          <Link href="/contact">
            <Button>Get in Touch</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
