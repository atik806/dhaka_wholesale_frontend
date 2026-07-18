"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/src/lib/constants";
import { Save, Eye, EyeOff, Megaphone, Loader2 } from "lucide-react";

interface PromoBannerSettings {
  badge: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  enabled: boolean;
}

function getSessionToken() {
  try {
    const s = localStorage.getItem("admin_session");
    if (!s) return null;
    const session = JSON.parse(s);
    return session.session?.access_token || null;
  } catch {
    return null;
  }
}

export default function SiteSettingsPage() {
  const [promo, setPromo] = useState<PromoBannerSettings>({
    badge: "Limited Time Offer",
    title: "",
    subtitle: "",
    button_text: "Shop Sale",
    button_link: "/shop",
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchSettings() {
      try {
        const res = await fetch(`${API_BASE}/site-settings`);
        const data = await res.json();
        if (active && data.promo_banner) {
          setPromo(data.promo_banner);
        }
      } catch {
        // silently fail
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchSettings();
    return () => { active = false; };
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const token = getSessionToken();
      await fetch(`${API_BASE}/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promo_banner: promo }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Manage homepage content and banners
        </p>
      </div>

      {/* Promo Banner Section */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Promo Banner</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The banner shown on the homepage
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Visible on site</label>
          <button
            onClick={() => setPromo({ ...promo, enabled: !promo.enabled })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              promo.enabled
                ? "bg-primary"
                : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                promo.enabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Badge Text</label>
          <input
            type="text"
            value={promo.badge}
            onChange={(e) => setPromo({ ...promo, badge: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="e.g. Limited Time Offer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            type="text"
            value={promo.title}
            onChange={(e) => setPromo({ ...promo, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="e.g. Summer Sale — Up to 40% Off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Subtitle</label>
          <textarea
            value={promo.subtitle}
            onChange={(e) => setPromo({ ...promo, subtitle: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="e.g. Exclusive discounts on our most-loved products."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Button Text</label>
            <input
              type="text"
              value={promo.button_text}
              onChange={(e) => setPromo({ ...promo, button_text: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. Shop Sale"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Button Link</label>
            <input
              type="text"
              value={promo.button_link}
              onChange={(e) => setPromo({ ...promo, button_link: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. /shop"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
            {promo.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Preview
          </p>
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#5a0f14] p-5">
            {promo.badge && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full mb-3 border border-white/10">
                {promo.badge}
              </span>
            )}
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              {promo.title || "Your title here"}
            </h3>
            <p className="text-white/75 text-xs">{promo.subtitle}</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-white text-primary px-5 py-2 rounded-lg text-sm font-medium">
              {promo.button_text || "Button"} →
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium">Saved!</span>
        )}
      </div>
    </div>
  );
}
