"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, SendHorizonal, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-14 md:py-20 bg-[#FBF6EC]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* White 'ledger' card with a vertical divider line */}
          <div className="bg-white rounded-[3px] border-2 border-[#E7DCC4] shadow-lg p-6 sm:p-10 md:p-12 relative overflow-hidden">
            {/* Top ledger stamp mark */}
            <div className="absolute top-0 right-0 bg-[#132A3A] text-[#F5A300] font-mono text-[9px] font-bold px-3 py-1 uppercase tracking-widest border-b border-l border-[#E7DCC4]">
              NEWSLETTER
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
              {/* Left Column: Heading + Description */}
              <div className="md:w-1/2 text-left">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#1F6F50] bg-[#1F6F50]/10 px-2.5 py-0.5 border border-[#1F6F50]/20 rounded-[2px] mb-3">
                  <Mail className="w-3.5 h-3.5" /> STOCK ALERTS
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#132A3A] mb-2 leading-tight">
                  Join the DhakaDrop Newsletter
                </h2>

                <p className="text-xs sm:text-sm text-[#1C1A17]/70 font-sans leading-relaxed">
                  Receive stock alerts, new product announcements, and exclusive deals directly to your inbox.
                </p>
              </div>

              {/* Vertical Divider Line */}
              <div className="hidden md:block w-px bg-[#E7DCC4] self-stretch" />

              {/* Right Column: Input + button combined as ONE block */}
              <div className="w-full md:w-1/2">
                {subscribed ? (
                  <div className="flex items-center gap-2 p-4 bg-[#1F6F50]/10 border border-[#1F6F50]/30 rounded-[3px] text-[#1F6F50]">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="font-mono text-xs font-bold">
                      SUCCESS! You're subscribed.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full">
                    {/* Combined block: Input + Button joined together */}
                    <div className="flex items-stretch border-2 border-[#E7DCC4] rounded-[3px] overflow-hidden focus-within:border-[#F5A300] bg-[#FBF6EC] shadow-sm">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ENTER YOUR EMAIL..."
                        required
                        className="flex-1 bg-transparent px-4 py-3 text-xs font-mono outline-none text-[#132A3A] placeholder:text-[#1C1A17]/50 min-w-0"
                      />
                      <button
                        type="submit"
                        className="bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] font-mono text-xs font-extrabold px-5 py-3 flex items-center gap-1.5 transition-colors shrink-0 uppercase tracking-wider border-l-2 border-[#D88900]"
                      >
                        SUBSCRIBE <SendHorizonal className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-[#1C1A17]/50 mt-2">
                      *NO SPAM. UNSUBSCRIBE ANYTIME.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
