"use client";

import { motion } from "framer-motion";
import { Mail, SendHorizonal } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 shadow-xl p-8 md:p-12 text-center">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <div className="w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/25 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 mt-2">
              Stay in the Loop
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 max-w-md mx-auto">
              Be the first to know about new arrivals, exclusive offers, and
              behind-the-scenes stories.
            </p>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-1.5 border border-zinc-200 dark:border-zinc-700 max-w-lg mx-auto">
              <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 ml-3 shrink-0" />
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-lg shadow-primary/25"
              >
                Subscribe <SendHorizonal className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-3">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
