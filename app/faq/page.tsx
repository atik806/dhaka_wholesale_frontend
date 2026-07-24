"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Input } from "@/src/components/ui/Input";
import { EmptyState } from "@/src/components/ui/EmptyState";

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
      className="bg-canvas"
    >
      <header className="bg-surface border-b border-line">
        <div className="container py-10 md:py-14">
          <Breadcrumbs items={[{ label: "FAQ" }]} />
          <p className="label-caps text-accent-text mb-2">Help centre</p>
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-[65ch]">
            Find answers to common questions about ordering, shipping, returns, and more.
          </p>
        </div>
      </header>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="max-w-md mx-auto mb-8">
            <Input
              type="search"
              label="Search FAQs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword…"
              leadingIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="w-7 h-7 text-subtle" />}
              title="No matching questions"
              description={`We couldn't find anything for "${search}". Try a different keyword, or contact us and we'll help directly.`}
              actionLabel="Contact support"
              actionHref="/contact"
            />
          ) : (
            <div className="bg-surface border border-line rounded-lg overflow-hidden divide-y divide-line">
              {filtered.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={`${item.category}-${item.q}`}>
                    <h2>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        id={`faq-trigger-${i}`}
                        className="flex items-start justify-between gap-4 w-full px-4 sm:px-6 py-4 text-left hover:bg-surface-2 transition-colors"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="label-caps text-accent-text block mb-1">
                            {item.category}
                          </span>
                          <span className="block text-[15px] font-semibold text-fg break-words">
                            {item.q}
                          </span>
                        </span>
                        <ChevronDown
                          aria-hidden
                          className={`w-5 h-5 text-subtle shrink-0 mt-1 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </h2>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="panel"
                          id={`faq-panel-${i}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 sm:px-6 pb-5 text-[15px] text-muted leading-[1.7] max-w-[68ch]">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
