"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const faqs = [
  {
    category: "Orders",
    questions: [
      { q: "How do I place an order?", a: "Simply browse our catalog, add items to your cart, and proceed to checkout. You'll need to create an account or sign in to complete your purchase." },
      { q: "Can I modify or cancel my order?", a: "You can cancel pending orders from your order history. Once an order is confirmed or shipped, modifications are no longer possible." },
      { q: "How will I know my order is confirmed?", a: "You'll receive a confirmation email with your order details and tracking information once your order is placed." },
    ],
  },
  {
    category: "Payment",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept bKash, Nagad, Cash on Delivery (COD), and Visa. All transactions are securely processed." },
      { q: "Is Cash on Delivery safe?", a: "Yes, COD is our primary payment method. You inspect goods at your door before paying. No advance payment required." },
      { q: "Do you offer installment payments?", a: "Currently we do not offer installment payments, but we're working on adding this option in the future." },
    ],
  },
  {
    category: "Shipping",
    questions: [
      { q: "How long does shipping take?", a: "Inside Dhaka: 24-48 hours. Outside Dhaka: 48-72 hours. We dispatch all orders within 1-2 business days." },
      { q: "Do you ship internationally?", a: "Currently we ship within Bangladesh only. We deliver to all 64 districts nationwide." },
      { q: "How can I track my order?", a: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account dashboard." },
    ],
  },
  {
    category: "Returns",
    questions: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for defective items. Contact our support team to initiate a return." },
      { q: "How long do refunds take?", a: "Refunds are processed within 3-5 business days after we receive your return. The amount will be credited to your original payment method." },
      { q: "Can I exchange an item?", a: "Yes, exchanges are free for defective items. Contact our support team to start an exchange." },
    ],
  },
  {
    category: "Account",
    questions: [
      { q: "How do I create an account?", a: "Click the Account button in the header and select 'Register'. Enter your name, email, and a secure password to get started." },
      { q: "I forgot my password, what should I do?", a: "On the login page, click 'Forgot Password' and enter your email. We'll send you a link to reset your password." },
      { q: "How do I update my profile?", a: "Sign in to your account and go to your profile settings. You can update your name, phone, and shipping address there." },
    ],
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const flatFaqs = faqs.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.category }))
  );

  const filtered = search.trim()
    ? flatFaqs.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      )
    : flatFaqs;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C]"
    >
      {/* Page Hero Header */}
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d] py-12 md:py-16">
        <div className="container">
          <Breadcrumbs items={[{ label: "FAQ" }]} />
          <div className="max-w-2xl mt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <BookOpen className="w-3.5 h-3.5" /> FAQ
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-[#E7DCC4]/90 text-sm sm:text-base font-sans">
              Find answers to common questions about ordering, shipping, returns, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 mb-8 max-w-md mx-auto focus-within:border-[#F5A300] transition-colors">
            <Search className="w-5 h-5 text-[#F5A300] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="flex-1 bg-transparent py-3 text-sm outline-none text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4] font-mono"
            />
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-center text-[#1C1A17]/60 dark:text-[#a0b4c4] py-10 font-mono text-xs">No results found for &quot;{search}&quot;</p>
            ) : (
              filtered.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[#FBF6EC] dark:bg-[#0D1F2C] transition-colors"
                  >
                    <div>
                      <p className="font-mono text-[10px] text-[#F5A300] font-bold uppercase tracking-wider mb-0.5">{item.category}</p>
                      <span className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4]">{item.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#F5A300] shrink-0 transition-transform duration-200 ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-4 text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] leading-relaxed font-sans border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
