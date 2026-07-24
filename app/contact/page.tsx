"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";
import { Card, CardHeader } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Field";
import { API_BASE } from "@/src/lib/constants";

const contactDetails = [
  { icon: Mail, label: "Email", lines: ["atikrj8@gmail.com"] },
  { icon: Phone, label: "Phone", lines: ["01302228993", "01761931958"] },
  { icon: MapPin, label: "Address", lines: ["Kuril, Koylabari, Tushar Villa, Dhaka"] },
  {
    icon: Clock,
    label: "Hours",
    lines: ["Sun – Thu: 9:00 AM – 7:00 PM", "Fri – Sat: 10:00 AM – 5:00 PM"],
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to send message");
      setSuccess(true);
      setForm({ first_name: "", last_name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas min-h-screen"
    >
      <header className="bg-surface border-b border-line">
        <div className="container py-10 md:py-14">
          <Breadcrumbs items={[{ label: "Contact" }]} />
          <p className="label-caps text-accent-text mb-2">Get in touch</p>
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-3">
            Contact Us
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-[65ch]">
            Have questions about our products or your order? We&apos;re here to help.
          </p>
        </div>
      </header>

      <div className="container py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader
                title="Send us a message"
                description="We usually reply within one business day."
              />
              <div className="p-5 sm:p-6">
                {success ? (
                  <div className="flex flex-col items-center justify-center text-center bg-success-soft border border-success/30 rounded-lg py-10 px-6">
                    <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-1.5">Message sent</h3>
                    <p className="text-sm text-muted max-w-sm leading-relaxed">
                      We&apos;ve received your message and will get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="First name"
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        autoComplete="given-name"
                      />
                      <Input
                        label="Last name"
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        autoComplete="family-name"
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                    <Input
                      label="Subject"
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="e.g. Order question"
                      required
                    />
                    <Textarea
                      label="Message"
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help…"
                      required
                    />
                    {error && (
                      <p
                        role="alert"
                        className="text-[13px] font-medium text-danger bg-danger-soft border border-danger/30 rounded-md px-4 py-3"
                      >
                        {error}
                      </p>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      loading={loading}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {!loading && <Send className="w-4 h-4" />}
                      {loading ? "Sending…" : "Send message"}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader title="Central office" />
              <ul className="p-5 sm:p-6 space-y-5">
                {contactDetails.map(({ icon: Icon, label, lines }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-md bg-accent-soft text-accent-hover flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="label-caps text-subtle mb-1">{label}</p>
                      {lines.map((line) => (
                        <p key={line} className="text-sm text-fg break-words">
                          {line}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="bg-brand text-brand-fg border border-line rounded-lg p-5">
              <p className="label-caps text-accent mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Location
              </p>
              <p className="text-sm leading-relaxed opacity-90">
                Central Dhaka Hub • Kuril Koylabari Tushar Villa, Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
