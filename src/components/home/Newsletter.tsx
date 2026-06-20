"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary dark:text-primary-light" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Stay in the Loop
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
            Be the first to know about new arrivals, exclusive offers, and
            behind-the-scenes stories.
          </p>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-1.5 border border-zinc-200 dark:border-zinc-700 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              Subscribe <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
