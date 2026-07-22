"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, AlertTriangle, ArrowUp, Minus, ChevronDown } from "lucide-react";
import { submitReport, uploadReportScreenshot } from "@/src/lib/api";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

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
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[70] bg-white dark:bg-[#132A3A] rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-[#2a3d4d] shadow-2xl w-full sm:max-w-md p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Report a bug"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-bold text-[#132A3A] dark:text-[#E7DCC4]">Report a Bug</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-[#0D1F2C] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="font-medium text-[#132A3A] dark:text-[#E7DCC4]">Thank you for your report!</p>
                <p className="text-sm text-zinc-500 dark:text-[#a0b4c4] mt-1">
                  We&apos;ll look into it.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5 text-[#132A3A] dark:text-[#E7DCC4]">
                    Describe the bug
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What happened? What did you expect?"
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-xl border border-zinc-200 dark:border-[#2a3d4d] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-[#0D1F2C] text-zinc-900 dark:text-[#E7DCC4] placeholder:text-zinc-400 dark:placeholder:text-[#a0b4c4] resize-none"
                  />
                  <p className="text-xs text-zinc-400 dark:text-[#a0b4c4] mt-1 text-right">
                    {message.length}/2000
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5 text-[#132A3A] dark:text-[#E7DCC4]">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "low", label: "Low", icon: Minus, color: "text-zinc-500" },
                      { value: "medium", label: "Medium", icon: ChevronDown, color: "text-blue-500" },
                      { value: "high", label: "High", icon: ArrowUp, color: "text-orange-500" },
                      { value: "critical", label: "Critical", icon: AlertTriangle, color: "text-red-500" },
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value as typeof priority)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        priority === p.value
                          ? "border-[#F5A300] bg-[#F5A300]/10 text-[#132A3A] dark:text-white"
                          : "border-zinc-200 dark:border-[#2a3d4d] hover:border-zinc-300 dark:hover:border-[#2a3d4d] text-zinc-600 dark:text-[#a0b4c4]"
                        }`}
                      >
                        <p.icon className={`w-3 h-3 ${priority === p.value ? "" : p.color}`} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium mb-1.5 text-[#132A3A] dark:text-[#E7DCC4]">
                    Screenshot (optional)
                  </label>
                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-[#2a3d4d]">
                      <img
                        src={preview}
                        alt="Screenshot preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={() => {
                          if (preview) URL.revokeObjectURL(preview);
                          setFile(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                        dragOver
                          ? "border-primary bg-primary/5"
                          : "border-zinc-200 dark:border-[#2a3d4d] hover:border-zinc-300 dark:hover:border-[#2a3d4d]"
                      }`}
                    >
                      <ImageIcon className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Drop an image or{" "}
                        <span className="text-primary dark:text-primary-light font-medium">
                          browse
                        </span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        PNG, JPG, WebP — max 2MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
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
                  <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-[#2a3d4d] text-sm font-medium text-[#132A3A] dark:text-[#E7DCC4] hover:bg-zinc-100 dark:hover:bg-[#0D1F2C] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !message.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5A300] text-[#132A3A] text-sm font-bold hover:bg-[#D88900] transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
