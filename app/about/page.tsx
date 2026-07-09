"use client";

import { motion } from "framer-motion";
import { Heart, Truck, Shield, Award, Users } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const values = [
  { icon: Heart, title: "Curated with Care", description: "Every product in our collection is handpicked by our team of experts who travel the globe to find items that meet our standards of quality, design, and sustainability." },
  { icon: Truck, title: "Fast & Reliable Shipping", description: "We partner with trusted logistics providers to ensure your orders arrive quickly and in perfect condition, no matter where you are in the world." },
  { icon: Shield, title: "Quality Guaranteed", description: "We stand behind every product we sell. If you're not completely satisfied, we'll make it right with our hassle-free returns policy." },
  { icon: Award, title: "Premium Standards", description: "From packaging to customer service, every touchpoint reflects our commitment to excellence. We believe you deserve nothing less than the best." },
  { icon: Users, title: "Community First", description: "We're building more than a store — we're building a community of people who appreciate quality, craftsmanship, and thoughtful design." },
];

const team = [
  { name: "Aria Chen", role: "Founder & CEO", bio: "With 15 years in retail and e-commerce, Aria founded CholoKini to bring curated quality to everyone." },
  { name: "Marcus Johnson", role: "Head of Curation", bio: "Marcus travels to 20+ countries annually to discover unique products that meet our curation standards." },
  { name: "Priya Sharma", role: "Creative Director", bio: "Priya leads our visual identity, ensuring every interaction with CholoKini feels premium and cohesive." },
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "About Us" }]} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">About CholoKini</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We believe that the things you surround yourself with should bring joy, function, and beauty to your everyday life.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Our Story</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 sm:p-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              CholoKini was born from a simple observation: finding quality products online shouldn't be a treasure hunt. Our founders, tired of sifting through endless options of questionable quality, set out to create a curated marketplace where every item tells a story of craftsmanship and care.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              What started as a small collection of handpicked home goods has grown into a destination for discerning shoppers who value quality over quantity. We work directly with artisans, small manufacturers, and established brands who share our commitment to excellence.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every product on CholoKini has been tested, reviewed, and approved by our curation team. We don't just list items — we champion them.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, description }, i) => (
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

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {team.map(({ name, role, bio }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-xl font-bold text-primary dark:text-primary-light">{name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <h3 className="font-semibold mb-1">{name}</h3>
                <p className="text-xs text-primary font-medium mb-3">{role}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
