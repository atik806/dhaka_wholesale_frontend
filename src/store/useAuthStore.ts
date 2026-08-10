"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/src/lib/auth-api";
import { refreshSession } from "@/src/lib/auth-api";
import { API_BASE } from "@/src/lib/constants";
import { useCartStore } from "@/src/store/useCartStore";

interface AuthState {
  user: AuthUser | null;
  _hydrated: boolean;
  _initialized: boolean;

  setAuth: (user: AuthUser) => void;
  logout: () => Promise<void>;
  /**
   * Session died server-side (401 after refresh). Drop the user but KEEP the
   * cart — a guest cart should survive an expired session, and this path is
   * reached on silent expiries where the user may not even be looking.
   */
  clearSession: () => void;
  updateUser: (fields: Partial<AuthUser>) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      _hydrated: false,
      _initialized: false,

      setAuth: (user) => set({ user }),

      clearSession: () => set({ user: null }),

      logout: async () => {
        // Best-effort server-side revoke + cookie clear. Failure is never
        // fatal — the local state is cleared regardless.
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (err) {
          console.warn("[auth] logout request failed:", err);
        }
        useCartStore.getState().clearCart();
        set({ user: null });
      },

      updateUser: (fields) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...fields } } : state,
        ),

      initAuth: async () => {
        if (get()._initialized) return;
        set({ _initialized: true });

        // Plain fetch (not authFetch): an unauthenticated guest must not be
        // redirected to /login just by loading a page.
        let res: Response;
        try {
          res = await fetch(`${API_BASE}/auth/profile`, {
            credentials: "include",
          });
        } catch {
          set({ user: null });
          return;
        }

        if (res.ok) {
          const json = await res.json();
          set({ user: json.data ?? null });
          return;
        }

        // 401 — try one cookie refresh, then re-check the profile once.
        if (res.status === 401) {
          const ok = await refreshSession();
          if (ok) {
            try {
              const retry = await fetch(`${API_BASE}/auth/profile`, {
                credentials: "include",
              });
              if (retry.ok) {
                const json = await retry.json();
                set({ user: json.data ?? null });
                return;
              }
            } catch {
              // fall through to the no-user state below
            }
          }
        }
        set({ user: null });
      },
    }),
    {
      name: "dhaka-wholesale-auth",
      // Only the user object persists — tokens live exclusively in the
      // httpOnly cookie set by the backend.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[auth] Failed to rehydrate persisted auth:", error);
        }
        if (state) state._hydrated = true;
        else {
          // Ensure UI can proceed even if storage is empty/corrupt
          useAuthStore.setState({ _hydrated: true });
        }
      },
    },
  ),
);

export function useAuthHydrated() {
  return useAuthStore((s) => s._hydrated);
}

export function useIsLoggedIn() {
  return useAuthStore((s) => !!s.user);
}
