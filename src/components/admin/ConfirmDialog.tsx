"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      focusable?.focus();
    }
  }, [open]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }, [onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <div ref={dialogRef} className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl w-full max-w-md p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                  <AlertTriangle className={`w-5 h-5 ${danger ? "text-red-500" : "text-amber-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id="confirm-title" className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                  <p id="confirm-message" className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 break-words">{message}</p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" aria-label="Close dialog">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={onCancel} disabled={loading}>
                  {cancelLabel}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={loading}
                  className={danger ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  {loading ? "Working..." : confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    resolve?: (value: boolean) => void;
  }>({ open: false, title: "", message: "" });

  const confirm = useCallback(
    (title: string, message: string, options?: { confirmLabel?: string; danger?: boolean }) =>
      new Promise<boolean>((resolve) => {
        setState({
          open: true,
          title,
          message,
          confirmLabel: options?.confirmLabel,
          danger: options?.danger,
          resolve,
        });
      }),
    []
  );

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false }));
  }, [state]);

  return {
    confirm,
    dialog: (
      <ConfirmDialog
        open={state.open}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        danger={state.danger}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
  };
}
