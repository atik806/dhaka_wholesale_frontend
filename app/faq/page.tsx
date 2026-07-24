"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const faqs = [
  {
    category: "Orders",
    questions: [
      { q: "How do I place an order?", a: "Browse the shop, add items to your cart, and checkout. Sign in or create an account so you can track the order from My Account." },
      { q: "Can I modify or cancel my order?", a: "Pending orders can be cancelled from your account order history. Once an order is confirmed or shipped, changes are no longer possible — contact support if you need help." },
      { q: "How will I know my order is confirmed?", a: "After you place a COD order, you'll see it in My Account → Order History. We may also call to confirm delivery details before dispatch." },
    ],
  },
  {
    category: "Payment",
    questions: [
      { q: "What payment methods do you accept?", a: "Right now we accept Cash on Delivery (COD) only. You pay when your order arrives. Online payments (cards, bKash, Nagad, PayPal) are not available yet." },
      { q: "Is Cash on Delivery safe?", a: "Yes. COD is our only payment method today — inspect goods at your door before paying. No advance payment is required." },
      { q: "Do you offer installment payments?", a: "No. We do not offer installments at this time." },
    ],
  },
  {
    category: "Shipping",
    questions: [
      { q: "How much is delivery?", a: "Inside Dhaka: ৳80. Outside Dhaka: ৳120. Rates are calculated at checkout based on your delivery zone." },
      { q: "How long does shipping take?", a: "Inside Dhaka: usually 24–48 hours. Outside Dhaka: usually 48–72 hours. Orders are typically dispatched within 1–2 business days." },
      { q: "How can I track my order?", a: "Sign in and open My Account to see live order status (pending, confirmed, shipped, delivered). You can also contact support with your order details." },
    ],
  },
  {
    category: "Returns",
    questions: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for defective or incorrect items. Contact support with your order number to start a return." },
      { q: "How do refunds work for COD?", a: "For approved returns on COD orders, we arrange a refund or replacement after we receive and verify the item — usually within 3–5 business days." },
      { q: "Can I exchange an item?", a: "Yes — exchanges are available for defective or wrong items. Contact support to arrange a free exchange." },
    ],
  },
  {
    category: "Account",
    questions: [
      { q: "How do I create an account?", a: "Tap Account (or go to Register), then continue with Google or email. Your account lets you save an address and track every COD order." },
      { q: "I forgot my password, what should I do?", a: "On the login screen, open the email form and tap Forgot password. We'll email a secure reset link." },
      { q: "How do I update my profile?", a: "Sign in → My Account to update your name, phone, shipping address, and view order history." },
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
                    className="flex items-start sm:items-center justify-between gap-3 w-full px-4 sm:px-6 py-4 text-left hover:bg-[#FBF6EC] dark:hover:bg-[#0D1F2C] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] text-[#F5A300] font-bold uppercase tracking-wider mb-0.5">{item.category}</p>
                      <span className="font-serif font-bold text-sm text-[#132A3A] dark:text-[#E7DCC4] break-words">{item.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#F5A300] shrink-0 mt-1 sm:mt-0 transition-transform duration-200 ${
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
                        <p className="px-4 sm:px-6 pb-4 text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] leading-relaxed font-sans border-t border-[#E7DCC4] dark:border-[#2a3d4d] pt-3">
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
