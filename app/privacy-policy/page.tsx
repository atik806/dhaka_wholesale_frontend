"use client";

import { motion } from "framer-motion";
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

const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function PrivacyPolicyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas"
    >
      <header className="bg-surface border-b border-line">
        <div className="container py-10 md:py-14">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <p className="label-caps text-accent-text mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted">Last updated: July 2026</p>
        </div>
      </header>

      <div className="container py-12">
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10 lg:items-start">
          <div className="bg-surface border border-line rounded-lg divide-y divide-line">
            {sections.map(({ title, content }) => (
              <section
                key={title}
                id={slugify(title)}
                className="p-6 sm:p-8 scroll-mt-24"
              >
                <h2 className="text-lg font-bold mb-3">{title}</h2>
                <p className="text-[15px] text-muted leading-[1.75] max-w-[68ch]">
                  {content}
                </p>
              </section>
            ))}
          </div>

          <nav
            aria-label="On this page"
            className="hidden lg:block sticky top-24"
          >
            <p className="label-caps text-subtle mb-3">On this page</p>
            <ul className="space-y-1.5 border-l border-line">
              {sections.map(({ title }) => (
                <li key={title}>
                  <a
                    href={`#${slugify(title)}`}
                    className="block -ml-px border-l-2 border-transparent pl-3 py-1 text-[13px] text-muted hover:text-fg hover:border-accent transition-colors"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </motion.div>
  );
}
