"use client";

import { motion } from "framer-motion";
import { Heart, Truck, Shield, Award, Users, Coffee, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Card } from "@/src/components/ui/Card";
import { buttonClasses } from "@/src/components/ui/Button";

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
      className="bg-canvas"
    >
      <header className="bg-surface border-b border-line">
        <div className="container py-10 md:py-14">
          <Breadcrumbs items={[{ label: "About Us" }]} />
          <p className="label-caps text-accent-text mb-2">Our Story</p>
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-3">
            About Dhaka Wholesale
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-[65ch]">
            Two friends, a lot of tea, and one questionable business decision that
            somehow worked out.
          </p>
        </div>
      </header>

      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-14">
          <section>
            <h2 className="text-2xl font-bold mb-5">Our Story</h2>
            <Card padded className="space-y-4">
              <div className="space-y-4 max-w-[68ch] text-[15px] text-muted leading-[1.75]">
                <p>
                  It all started on a random afternoon at a tea stall. Two friends were sitting there, sipping chai, eating biscuits, and doing what every Bangladeshi does in their free time — complaining about how expensive everything has gotten online.
                </p>
                <p>
                  &ldquo;Bro, this thing costs like ৳500 online but you can get it for ৳200 wholesale,&rdquo; one of them said. The other one replied, &ldquo;What if we just... sold it ourselves?&rdquo; There was a long pause. Another sip of tea. A biscuit crumb fell on the table.
                </p>
                <p>&ldquo;Yeah, let&apos;s do it.&rdquo;</p>
                <p>
                  And just like that — with zero business plan, zero funding, and one very strong cup of tea — Dhaka Wholesale was born. We started from our rooms, source products we actually believe in, and now we&apos;re here. Still drinking tea. Still figuring things out. But now we&apos;re doing it with a website and everything.
                </p>
              </div>
              <p className="flex items-start gap-2.5 text-[13px] font-medium text-fg bg-accent-soft border border-accent/30 rounded-md px-4 py-3">
                <Coffee className="w-4 h-4 text-accent-hover shrink-0 mt-0.5" />
                Fun fact: The tea stall still doesn&apos;t know they inspired a business.
              </p>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card padded className="h-full transition-colors hover:border-line-strong">
                    <div className="w-10 h-10 rounded-md bg-accent-soft flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-accent-hover" />
                    </div>
                    <h3 className="text-base font-bold mb-2">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5">The Founders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {founders.map(({ name, role, bio }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card padded className="h-full text-center">
                    <div
                      aria-hidden
                      className="w-16 h-16 rounded-full bg-surface-3 text-fg flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-lg font-bold tracking-wide">
                        {i === 0 ? "TG" : "OW"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-1">{name}</h3>
                    <p className="label-caps text-accent-text mb-3">{role}</p>
                    <p className="text-sm text-muted leading-relaxed">{bio}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="bg-surface border border-line rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to shop?</h2>
            <p className="text-sm text-muted mb-6">
              Browse our collection and find something you love.
            </p>
            <Link href="/shop" className={buttonClasses({ size: "lg" })}>
              Browse products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
