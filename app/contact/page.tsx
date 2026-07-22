"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Button } from "@/src/components/ui/Button";
import { API_BASE } from "@/src/lib/constants";

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
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C] min-h-screen"
    >
      {/* Page Hero Header */}
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d] py-12 md:py-16">
        <div className="container">
          <Breadcrumbs items={[{ label: "Contact" }]} />
          <div className="max-w-2xl mt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <BookOpen className="w-3.5 h-3.5" /> GET IN TOUCH
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold mb-3">
              Contact Us
            </h1>
            <p className="text-[#E7DCC4]/90 text-sm sm:text-base leading-relaxed font-sans">
              Have questions about our products or your order? We're here to help.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif font-bold text-xl text-[#132A3A] dark:text-[#E7DCC4] mb-6 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                  Send Us a Message
                </h2>
                {success ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-[#FBF6EC] dark:bg-[#0D1F2C] border border-[#1F6F50]/30 rounded-[3px] p-6">
                    <div className="w-12 h-12 rounded-full bg-[#1F6F50] text-white flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[#132A3A] dark:text-[#E7DCC4] mb-1">Message Sent!</h3>
                    <p className="font-mono text-xs text-[#1F6F50]">We've received your message and will get back to you shortly.</p>
                  </div>
                ) : (
                <form className="space-y-4 font-mono text-xs" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4]"
                      />
                    </div>
                  </div>
                  <div>
                      <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="e.g. Order Question"
                      required
                      className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">Message</label>
                    <textarea
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      required
                      className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4] resize-none"
                    />
                  </div>
                  {error && (
                    <p className="font-mono text-xs font-bold text-[#BE3D1F] bg-[#BE3D1F]/10 rounded-[2px] border border-[#BE3D1F]/30 p-3">{error}</p>
                  )}
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto" rotate>
                    <Send className="w-4 h-4" /> {loading ? "SUBMITTING..." : "SEND MESSAGE"}
                  </Button>
                </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg text-[#132A3A] dark:text-[#E7DCC4] mb-5 pb-2 border-b border-[#E7DCC4] dark:border-[#2a3d4d]">
                  Central Office Info
                </h2>
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[2px] bg-[#132A3A] text-[#F5A300] flex items-center justify-center shrink-0 border border-[#E7DCC4] dark:border-[#2a3d4d]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#132A3A] dark:text-[#E7DCC4]">EMAIL</p>
                      <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">atikrj8@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[2px] bg-[#132A3A] text-[#F5A300] flex items-center justify-center shrink-0 border border-[#E7DCC4] dark:border-[#2a3d4d]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#132A3A] dark:text-[#E7DCC4]">PHONE</p>
                      <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">01302228993</p>
                      <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">01761931958</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[2px] bg-[#132A3A] text-[#F5A300] flex items-center justify-center shrink-0 border border-[#E7DCC4] dark:border-[#2a3d4d]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#132A3A] dark:text-[#E7DCC4]">ADDRESS</p>
                      <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">Kuril, Koylabari, Tushar Villa, Dhaka</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[2px] bg-[#132A3A] text-[#F5A300] flex items-center justify-center shrink-0 border border-[#E7DCC4] dark:border-[#2a3d4d]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#132A3A] dark:text-[#E7DCC4]">HOURS</p>
                      <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">Sun - Thu: 9:00 AM - 7:00 PM</p>
                      <p className="text-[#1C1A17]/80 dark:text-[#a0b4c4]">Fri - Sat: 10:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-[#132A3A] text-[#E7DCC4] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-5 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#F5A300] font-bold mb-2">
                  <MapPin className="w-4 h-4" /> LOCATION
                </div>
                <p className="text-[#E7DCC4]/90">Central Dhaka Hub • Kuril Koylabari Tushar Villa, Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
