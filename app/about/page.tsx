"use client";

import { motion } from "framer-motion";
import { Heart, Truck, Shield, Award, Users, Coffee, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const values = [
  { icon: Heart, title: "Curated with Care", description: "Every product in our collection is handpicked. No filler, no junk — just stuff we'd actually want to buy ourselves." },
  { icon: Truck, title: "Fast & Reliable Shipping", description: "We ship across Bangladesh quickly and carefully. Your order won't get lost in the void." },
  { icon: Shield, title: "Quality Guaranteed", description: "Not happy? We'll make it right. No drama, no 47-step return forms. Just send it back." },
  { icon: Award, title: "Fair Prices", description: "We believe good products shouldn't cost a fortune. Great products at fair prices." },
  { icon: Users, title: "Built for Real People", description: "We're not a faceless corporation. We're two friends who got tired of overpriced everything." },
];

const founders = [
  { name: "The Idea Guy", role: "Co-Founder & Chief Tea Drinker", bio: "Had the brilliant idea of starting a business while on his third cup of chai. Still not sure if it was the tea or the genius talking." },
  { name: "The One Who Said Yes", role: "Co-Founder & Head of Everything Else", bio: "Said 'why not?' over a plate of biscuits and hasn't escaped since. Handles operations, logistics, and keeping the other founder grounded." },
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Page Hero */}
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d]">
        <div className="container py-14 md:py-20">
          <Breadcrumbs items={[{ label: "About Us" }]} />
          <div className="max-w-2xl mt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <BookOpen className="w-3.5 h-3.5" /> OUR STORY
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
              About Dhaka Wholesale
            </h1>
            <p className="text-[#E7DCC4]/90 text-sm sm:text-base leading-relaxed font-sans">
              Two friends, a lot of tea, and one questionable business decision that somehow worked out.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12 md:py-16 bg-[#FBF6EC] dark:bg-[#0D1F2C]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <h2 className="font-serif text-2xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4] mb-6">Our Story</h2>
            <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 sm:p-8 space-y-4 shadow-sm">
              <p className="text-sm text-[#1C1A17]/80 dark:text-[#a0b4c4] leading-relaxed font-sans">
                It all started on a random afternoon at a tea stall. Two friends were sitting there, sipping chai, eating biscuits, and doing what every Bangladeshi does in their free time — complaining about how expensive everything has gotten online.
              </p>
              <p className="text-sm text-[#1C1A17]/80 dark:text-[#a0b4c4] leading-relaxed font-sans">
                &ldquo;Bro, this thing costs like ৳500 online but you can get it for ৳200 wholesale,&rdquo; one of them said. The other one replied, &ldquo;What if we just... sold it ourselves?&rdquo; There was a long pause. Another sip of tea. A biscuit crumb fell on the table.
              </p>
              <p className="text-sm text-[#1C1A17]/80 dark:text-[#a0b4c4] leading-relaxed font-sans">
                &ldquo;Yeah, let&apos;s do it.&rdquo;
              </p>
              <p className="text-sm text-[#1C1A17]/80 dark:text-[#a0b4c4] leading-relaxed font-sans">
                And just like that — with zero business plan, zero funding, and one very strong cup of tea — Dhaka Wholesale was born. We started from our rooms, source products we actually believe in, and now we&apos;re here. Still drinking tea. Still figuring things out. But now we&apos;re doing it with a website and everything.
              </p>
              <div className="flex items-center gap-2 text-[#F5A300] pt-2 font-mono text-xs font-bold">
                <Coffee className="w-4 h-4" />
                <p>Fun fact: The tea stall still doesn&apos;t know they inspired a business.</p>
              </div>
            </div>
          </div>

          <div className="mb-14">
            <h2 className="font-serif text-2xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4] mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 shadow-sm hover:border-[#F5A300] transition-colors"
                >
                  <div className="w-10 h-10 rounded-[2px] bg-[#132A3A] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#F5A300]" />
                  </div>
                  <h3 className="font-serif font-bold text-[#132A3A] dark:text-[#E7DCC4] mb-2">{title}</h3>
                  <p className="text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] leading-relaxed font-sans">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-14">
            <h2 className="font-serif text-2xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4] mb-6">The Founders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {founders.map(({ name, role, bio }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 text-center shadow-sm"
                >
                  <div className="w-16 h-16 rounded-[2px] bg-[#132A3A] flex items-center justify-center mx-auto mb-4 border border-[#E7DCC4] dark:border-[#2a3d4d]">
                    <span className="font-serif text-xl font-bold text-[#F5A300]">
                      {i === 0 ? "TG" : "OW"}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-[#132A3A] dark:text-[#E7DCC4] mb-1">{name}</h3>
                  <p className="font-mono text-xs text-[#F5A300] font-bold mb-3">{role}</p>
                  <p className="text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] leading-relaxed font-sans">{bio}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-8 md:p-12">
            <h3 className="font-serif text-xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4] mb-2">Ready to shop?</h3>
            <p className="text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] mb-6 font-sans">Browse our collection and find something you love.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] dark:text-[#E7DCC4] px-6 py-3 rounded-[3px] font-extrabold text-sm border border-[#D88900] transition-colors font-mono uppercase tracking-wider -rotate-1 hover:rotate-0"
            >
              BROWSE PRODUCTS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
