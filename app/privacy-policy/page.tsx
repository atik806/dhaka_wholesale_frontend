"use client";

import { motion } from "framer-motion";
import { Shield, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const sections = [
  {
    title: "Information We Collect",
    content: "We collect information you provide directly to us, including your name, email address, shipping address, payment information, and phone number when you create an account, place an order, or contact our support team. We also automatically collect certain information when you visit our site, including your IP address, browser type, device information, and browsing behavior.",
  },
  {
    title: "How We Use Your Information",
    content: "We use your information to process and fulfill your orders, communicate with you about your purchases, send you promotional materials (with your consent), improve our website and services, and prevent fraudulent transactions.",
  },
  {
    title: "Information Sharing",
    content: "We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments, and delivering orders, provided they agree to keep your information confidential.",
  },
  {
    title: "Data Security",
    content: "We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits to protect your personal information. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "Cookies",
    content: "We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. You can control cookie preferences through your browser settings.",
  },
  {
    title: "Your Rights",
    content: "You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting our support team. You may also opt out of marketing communications at any time.",
  },
  {
    title: "Third-Party Links",
    content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies before providing any personal information.",
  },
  {
    title: "Children's Privacy",
    content: "Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete it.",
  },
  {
    title: "Changes to This Policy",
    content: "We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date. Your continued use of our site after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "Contact Us",
    content: "If you have any questions or concerns about this privacy policy or our data practices, please contact us at support@dhakawholesale.com or through our contact page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC]"
    >
      {/* Page Hero Header */}
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] py-12 md:py-16">
        <div className="container">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <div className="max-w-2xl mt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <Shield className="w-3.5 h-3.5" /> PRIVACY POLICY
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold mb-3">
              Privacy Policy
            </h1>
            <p className="font-mono text-xs text-[#E7DCC4]/80">
              Last updated: July 2026
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {sections.map(({ title, content }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[3px] border-2 border-[#E7DCC4] p-6 sm:p-8 shadow-sm"
              >
                <h2 className="font-serif font-bold text-lg text-[#132A3A] mb-3">{title}</h2>
                <p className="text-sm text-[#1C1A17]/70 leading-relaxed font-sans">
                  {content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
