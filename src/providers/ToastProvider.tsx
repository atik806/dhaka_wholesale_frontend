"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ReactNode } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// Module-level emitter so non-React code (cart-sync, lib helpers) can surface a
// toast without a hook. No-op until the provider registers itself.
let emitToast: ((message: string, type?: Toast["type"]) => void) | null = null;

function registerToastEmitter(fn: ((message: string, type?: Toast["type"]) => void) | null) {
  emitToast = fn;
}

/** Fire-and-forget toast callable from outside the React tree (async libs). */
export function toast(message: string, type?: Toast["type"]): void {
  emitToast?.(message, type);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Monotonic id counter — stable, ordered and collision-free. Math.random
  // produced unpredictable keys that could duplicate under rapid successive
  // adds, confusing AnimatePresence's keyed exit animations.
  const idCounter = useRef(0);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      idCounter.current += 1;
      const id = `toast-${idCounter.current}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    registerToastEmitter(addToast);
    return () => registerToastEmitter(null);
  }, [addToast]);

  const contextValue = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}
