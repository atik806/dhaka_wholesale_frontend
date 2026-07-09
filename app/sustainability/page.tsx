"use client";

import { motion } from "framer-motion";
import { Leaf, Recycle, TreePine, Package, Wind, Droplets } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const initiatives = [
  { icon: Package, title: "Eco-Friendly Packaging", description: "All orders ship in 100% recycled and biodegradable packaging. We've eliminated single-use plastics from our supply chain and are working toward zero-waste operations." },
  { icon: TreePine, title: "Carbon Neutral Shipping", description: "We partner with carbon offset programs to neutralize the environmental impact of every shipment. For every order placed, we plant a tree through our reforestation partners." },
  { icon: Recycle, title: "Product Lifecycle", description: "We prioritize products made from sustainable, recycled, or upcycled materials. Our curation team evaluates each product's environmental impact before it joins our collection." },
  { icon: Wind, title: "Renewable Energy", description: "Our warehouses and offices are powered by 100% renewable energy. We're committed to reducing our carbon footprint across all operations." },
  { icon: Droplets, title: "Water Conservation", description: "We partner with brands that implement water-saving manufacturing processes and prioritize working with suppliers who share our commitment to water conservation." },
  { icon: Leaf, title: "Community Impact", description: "1% of every purchase goes to environmental nonprofits. Our community has helped fund the preservation of over 10,000 acres of forest worldwide." },
];

const goals = [
  { year: "2025", goal: "Achieve zero single-use plastic in all operations", status: "In Progress" },
  { year: "2026", goal: "Become carbon neutral across entire supply chain", status: "In Progress" },
  { year: "2027", goal: "100% of products meet our sustainability criteria", status: "Planned" },
  { year: "2030", goal: "Achieve net-zero emissions company-wide", status: "Planned" },
];

export default function SustainabilityPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Sustainability" }]} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-primary dark:text-primary-light" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Sustainability</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We believe that great products shouldn't cost the earth. Our commitment to sustainability is woven into every decision we make.
          </p>
        </div>

        <div className="mb-16">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-8 text-center mb-8">
            <p className="text-5xl font-bold text-primary mb-2">10,000+</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Acres of forest preserved through your purchases</p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Our Initiatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initiatives.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Our Goals</h2>
          <div className="space-y-3">
            {goals.map(({ year, goal, status }, i) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="font-bold text-sm text-primary">{year}</span>
                  </div>
                  <p className="text-sm font-medium">{goal}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                  status === "In Progress"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                }`}>
                  {status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8 text-center">
          <h2 className="font-serif text-xl font-bold mb-2">Join Our Mission</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Every purchase you make on CholoKini contributes to a more sustainable future. Together, we can make shopping a force for good.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
