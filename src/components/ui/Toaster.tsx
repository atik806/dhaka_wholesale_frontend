"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToast } from "@/src/providers/ToastProvider";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const accents = {
  success: "text-success",
  error: "text-danger",
  info: "text-info",
};

export const Toaster = memo(function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed top-20 md:top-24 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-lg"
            >
              <Icon className={`w-5 h-5 mt-px shrink-0 ${accents[toast.type]}`} />
              <p className="text-sm font-medium text-fg flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 p-0.5 rounded text-subtle hover:text-fg hover:bg-surface-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
