"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Megaphone,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useSWRConfig } from "swr";
import { adminFetcher } from "@/src/lib/admin-api";
import { useToast } from "@/src/providers/ToastProvider";
import { useRealtimeInvalidate } from "@/src/hooks/useRealtimeInvalidate";
import {
  DEFAULT_PROMO,
  normalizePromoBanner,
  validatePromoBanner,
  type PromoBannerSettings,
} from "@/src/lib/promo-banner";

export default function SiteSettingsPage() {
  const { addToast } = useToast();
  const { mutate } = useSWRConfig();
  const [promo, setPromo] = useState<PromoBannerSettings>({ ...DEFAULT_PROMO });
  const [baseline, setBaseline] = useState<PromoBannerSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const editVersionRef = useRef(0);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const dirty =
    baseline !== null && JSON.stringify(promo) !== JSON.stringify(baseline);

  const updatePromo = (updates: Partial<PromoBannerSettings>) => {
    editVersionRef.current += 1;
    dirtyRef.current = true;
    setPromo((current) => {
      const next = { ...current, ...updates };
      dirtyRef.current =
        baseline === null || JSON.stringify(next) !== JSON.stringify(baseline);
      return next;
    });
    setSaved(false);
    setSaveError("");
  };

  const loadSettings = useCallback(async () => {
    if (dirtyRef.current || savingRef.current) return;
    const version = editVersionRef.current;
    try {
      const res = await adminFetcher<{ promo_banner: PromoBannerSettings }>(
        "/site-settings",
      );
      if (
        version !== editVersionRef.current ||
        dirtyRef.current ||
        savingRef.current
      )
        return;
      const settings = normalizePromoBanner(res.data?.promo_banner);
      setPromo(settings);
      setBaseline(settings);
      setLoadError("");
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load settings",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadSettings();
    })();
  }, [loadSettings]);

  useRealtimeInvalidate({
    table: "site_settings",
    onInvalidate: loadSettings,
    enabled: baseline !== null && !dirty && !saving,
  });

  useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current || baseline === null) return;
    const submitted = {
      ...promo,
      badge: promo.badge.trim(),
      title: promo.title.trim(),
      subtitle: promo.subtitle.trim(),
      button_text: promo.button_text.trim(),
      button_link: promo.button_link.trim(),
    };
    const error = validatePromoBanner(submitted);
    if (error) {
      setSaveError(error);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    try {
      await adminFetcher("/site-settings", {
        method: "PUT",
        body: JSON.stringify({ promo_banner: submitted }),
      });
      setPromo(submitted);
      setBaseline(submitted);
      dirtyRef.current = false;
      setLoadError("");
      // Publish to the current SWR cache and notify other tabs after persistence.
      void mutate("/site-settings/promo_banner", submitted, {
        revalidate: false,
      });
      try {
        localStorage.setItem("dw:promo-banner-updated", String(Date.now()));
      } catch {
        /* Polling still refreshes other tabs. */
      }
      setSaved(true);
      savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
      addToast("Settings saved successfully", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      setSaveError(message);
      addToast(message, "error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-link" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-serif">Site Settings</h1>
        <p className="text-muted text-sm mt-1">
          Manage homepage content and banners
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
        >
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => void loadSettings()}
            className="mt-2 font-semibold underline"
          >
            Retry loading settings
          </button>
        </div>
      )}

      {/* Promo Banner Section */}
      <fieldset
        disabled={saving || baseline === null}
        className="min-w-0 bg-surface rounded-2xl border border-line p-4 sm:p-6 space-y-5 disabled:opacity-60"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-link" />
          </div>
          <div>
            <h2 className="font-semibold">Promo Banner</h2>
            <p className="text-xs text-muted">
              The banner shown on the homepage
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label id="promo-visible-label" className="text-sm font-medium">
            Visible on site
          </label>
          <button
            type="button"
            role="switch"
            aria-labelledby="promo-visible-label"
            aria-checked={promo.enabled}
            onClick={() => updatePromo({ enabled: !promo.enabled })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              promo.enabled ? "bg-accent" : "bg-surface-3"
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
          <label
            htmlFor="promo-badge"
            className="block text-sm font-medium mb-1.5"
          >
            Badge Text
          </label>
          <input
            id="promo-badge"
            maxLength={80}
            type="text"
            value={promo.badge}
            onChange={(e) => updatePromo({ badge: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            placeholder="e.g. Limited Time Offer"
          />
        </div>

        <div>
          <label
            htmlFor="promo-title"
            className="block text-sm font-medium mb-1.5"
          >
            Title
          </label>
          <input
            id="promo-title"
            required={promo.enabled}
            maxLength={160}
            type="text"
            value={promo.title}
            onChange={(e) => updatePromo({ title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            placeholder="e.g. Summer Sale — Up to 40% Off"
          />
        </div>

        <div>
          <label
            htmlFor="promo-subtitle"
            className="block text-sm font-medium mb-1.5"
          >
            Subtitle
          </label>
          <textarea
            id="promo-subtitle"
            maxLength={500}
            value={promo.subtitle}
            onChange={(e) => updatePromo({ subtitle: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
            placeholder="e.g. Exclusive discounts on our most-loved products."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="promo-button-text"
              className="block text-sm font-medium mb-1.5"
            >
              Button Text
            </label>
            <input
              id="promo-button-text"
              required={promo.enabled}
              maxLength={60}
              type="text"
              value={promo.button_text}
              onChange={(e) => updatePromo({ button_text: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              placeholder="e.g. Shop Sale"
            />
          </div>
          <div>
            <label
              htmlFor="promo-button-link"
              className="block text-sm font-medium mb-1.5"
            >
              Button Link
            </label>
            <input
              id="promo-button-link"
              required
              maxLength={2048}
              type="text"
              value={promo.button_link}
              onChange={(e) => updatePromo({ button_link: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              placeholder="e.g. /shop"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4">
          <p className="text-xs font-medium text-muted mb-2 flex items-center gap-1">
            {promo.enabled ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
            Preview
          </p>
          {!promo.enabled && (
            <p className="mb-2 text-xs text-muted">
              Hidden on the homepage after saving. Preview only.
            </p>
          )}
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-brand via-brand-hover to-brand-deep p-5">
            {promo.badge && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full mb-3 border border-white/10">
                {promo.badge}
              </span>
            )}
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              {promo.title || "Your title here"}
            </h3>
            <p className="text-white/75 text-xs">{promo.subtitle}</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-accent text-accent-fg px-5 py-2 rounded-lg text-sm font-medium">
              {promo.button_text || "Button"} <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </fieldset>

      {/* Save Button */}
      {saveError && (
        <p
          role="alert"
          className="rounded-xl bg-danger-soft p-4 text-sm text-danger"
        >
          {saveError}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || baseline === null || !dirty}
          className="inline-flex items-center gap-2 bg-accent text-accent-fg px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span role="status" className="text-sm text-success font-medium">
            Saved!
          </span>
        )}
        {dirty && !saving && (
          <span className="text-sm text-muted">Unsaved changes</span>
        )}
        {dirty && !saving && (
          <button
            type="button"
            onClick={() => {
              if (!baseline) return;
              editVersionRef.current += 1;
              dirtyRef.current = false;
              setPromo({ ...baseline });
              setSaveError("");
              setSaved(false);
            }}
            className="text-sm text-muted underline underline-offset-4"
          >
            Discard changes
          </button>
        )}
      </div>
    </form>
  );
}
