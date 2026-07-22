"use client";

import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, Clock, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const policies = [
  {
    icon: Truck,
    title: "Shipping Policy",
    content: [
      "Standard shipping (5-8 business days): ৳60",
      "Express shipping (2-3 business days): ৳120",
      "Inside Dhaka delivery: ৳60",
      "Outside Dhaka delivery: ৳120",
      "Free delivery on orders over ৳1,000",
      "Orders are processed within 1-2 business days.",
      "We ship to all 64 districts in Bangladesh.",
      "Tracking information will be sent to your email once your order ships.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    content: [
      "We accept returns within 7 days of delivery for defective items.",
      "Items must be unused, unwashed, and in original packaging.",
      "Sale items are final sale and cannot be returned.",
      "To start a return, visit your order history or contact our support team.",
      "Return shipping is free for defective items.",
      "Refunds are processed within 3-5 business days after we receive your item.",
      "Original shipping charges are non-refundable for non-defective returns.",
    ],
  },
  {
    icon: Shield,
    title: "Damage & Defects",
    content: [
      "If your item arrives damaged or defective, please contact us within 48 hours.",
      "Include your order number and photos of the damage.",
      "We will provide a free replacement or full refund including shipping.",
      "Bulk orders: defective units will be replaced at no extra cost.",
    ],
  },
  {
    icon: Clock,
    title: "Processing Times",
    content: [
      "Orders are processed Monday through Friday, excluding holidays.",
      "Peak season (November-December) may experience longer processing times.",
      "Custom or personalized items may require additional processing time.",
      "COD orders are confirmed via phone call before dispatch.",
    ],
  },
];

export default function ShippingReturnsPage() {
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
          <Breadcrumbs items={[{ label: "Shipping & Returns" }]} />
          <div className="max-w-2xl mt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <Truck className="w-3.5 h-3.5" /> LOGISTICS & RETURNS
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold mb-3">
              Shipping & Returns
            </h1>
            <p className="text-[#E7DCC4]/90 text-sm sm:text-base font-sans">
              Everything you need to know about our shipping policies and return process.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {policies.map(({ icon: Icon, title, content }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[2px] bg-[#132A3A] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#F5A300]" />
                  </div>
                  <h2 className="font-serif font-bold text-lg text-[#132A3A] dark:text-[#E7DCC4]">{title}</h2>
                </div>
                <ul className="space-y-2">
                  {content.map((line, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] font-sans">
                      <span className="text-[#F5A300] mt-1.5 shrink-0 font-bold">•</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
