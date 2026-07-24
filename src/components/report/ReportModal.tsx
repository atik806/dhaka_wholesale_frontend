"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  AlertTriangle,
  ArrowUp,
  Minus,
  ChevronDown,
  Check,
} from "lucide-react";
import { submitReport, uploadReportScreenshot } from "@/src/lib/api";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Textarea } from "@/src/components/ui/Field";
import { fieldLabel } from "@/src/components/ui/Input";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

const priorities = [
  { value: "low", label: "Low", icon: Minus, color: "text-subtle" },
  { value: "medium", label: "Medium", icon: ChevronDown, color: "text-info" },
  { value: "high", label: "High", icon: ArrowUp, color: "text-accent" },
  { value: "critical", label: "Critical", icon: AlertTriangle, color: "text-danger" },
] as const;

export function ReportModal({ open, onClose }: ReportModalProps) {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback((f: File) => {
    if (f.size > 2 * 1024 * 1024) {
      setError("Screenshot must be under 2MB");
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Please describe the bug");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let screenshotUrl: string | null = null;
      if (file) {
        screenshotUrl = await uploadReportScreenshot(file);
      }
      await submitReport({
        message: message.trim(),
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        priority,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Report a Bug"
      description={
        success ? undefined : "Tell us what went wrong so we can fix it quickly."
      }
      footer={
        success ? undefined : (
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
              loading={loading}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        )
      }
    >
      {success ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-success-soft flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-success" strokeWidth={2.5} />
          </div>
          <p className="text-base font-bold text-fg">Thank you for your report!</p>
          <p className="text-[13px] text-muted mt-1">We&apos;ll look into it.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <Textarea
              label="Describe the bug"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What happened? What did you expect?"
              rows={4}
              maxLength={2000}
            />
            <p className="text-[12px] text-subtle mt-1.5 text-right tabular">
              {message.length}/2000
            </p>
          </div>

          <fieldset>
            <legend className={fieldLabel}>Priority</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorities.map((p) => {
                const selected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPriority(p.value)}
                    className={`flex items-center justify-center gap-1.5 h-9 px-2 rounded-md text-[13px] border transition-colors ${
                      selected
                        ? "border-accent bg-accent-soft text-fg font-semibold"
                        : "border-line-strong bg-surface text-muted font-medium hover:bg-surface-2 hover:text-fg"
                    }`}
                  >
                    <p.icon className={`w-3.5 h-3.5 shrink-0 ${p.color}`} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="report-screenshot" className={fieldLabel}>
              Screenshot (optional)
            </label>
            {preview ? (
              <div className="relative rounded-lg overflow-hidden border border-line">
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove screenshot"
                  onClick={() => {
                    if (preview) URL.revokeObjectURL(preview);
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver
                    ? "border-accent bg-accent-soft"
                    : "border-line-strong bg-surface-2 hover:border-brand hover:bg-surface-3"
                }`}
              >
                <ImageIcon className="w-7 h-7 mx-auto text-subtle mb-2" strokeWidth={1.75} />
                <p className="text-[13px] text-muted">
                  Drop an image or{" "}
                  <span className="font-semibold text-brand">browse</span>
                </p>
                <p className="text-[12px] text-subtle mt-1">
                  PNG, JPG, WebP — max 2MB
                </p>
              </button>
            )}
            <input
              ref={fileInputRef}
              id="report-screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-[13px] font-medium text-danger bg-danger-soft border border-danger/25 rounded-md px-3.5 py-2.5"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
