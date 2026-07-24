"use client";

import { useState } from "react";
import { Mail, SendHorizonal, CheckCircle2 } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";

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
    <section className="py-10 sm:py-14 bg-surface-2 border-t border-line">
      <div className="container">
        <Card padded className="max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="md:w-1/2">
              <p className="label-caps text-accent-text mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" /> Stock alerts
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-fg mb-2 leading-snug">
                Get stock updates by email
              </h2>

              <p className="text-sm text-muted leading-relaxed">
                New arrivals, restocks, and price drops — sent straight to your
                inbox.
              </p>
            </div>

            <div className="w-full md:w-1/2">
              {subscribed ? (
                <div className="flex items-center gap-2.5 p-4 rounded-md bg-success-soft border border-success/30 text-success">
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">
                    You&rsquo;re subscribed. Thank you!
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-label="Email address"
                      required
                    />
                    <Button type="submit" className="shrink-0">
                      Subscribe
                      <SendHorizonal className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="text-xs text-subtle mt-2">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
