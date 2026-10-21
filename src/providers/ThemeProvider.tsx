"use client";

import { createContext, useContext, useLayoutEffect, useCallback, useSyncExternalStore, useMemo } from "react";
import type { ReactNode } from "react";
import { applyTheme, parseTheme, readStoredTheme, saveTheme, THEME_STORAGE_KEY, type Theme } from "@/src/lib/theme";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getServerSnapshot(): Theme {
  return "light";
}

function getSnapshot(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    applyTheme(parseTheme(event.newValue));
    callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useLayoutEffect(() => {
    // Re-apply after development Strict Mode remounts. Never write an initial
    // server snapshot to storage: doing so would erase a saved dark preference.
    applyTheme(readStoredTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    saveTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, []);

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: "light" as Theme, toggleTheme: () => {} };
  return ctx;
}
