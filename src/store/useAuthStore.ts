"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, AuthSession } from "@/src/lib/auth-api";
import { refreshSession } from "@/src/lib/auth-api";
import { getSupabase } from "@/src/lib/supabase";

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  _hydrated: boolean;
  _initialized: boolean;

  setAuth: (user: AuthUser, session: AuthSession) => void;
  logout: () => void;
  updateUser: (fields: Partial<AuthUser>) => void;
  refreshAuth: () => Promise<boolean>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      _hydrated: false,
      _initialized: false,

      setAuth: (user, session) => set({ user, session }),

      logout: async () => {
        try {
          await getSupabase().auth.signOut({ scope: "local" });
        } catch (err) {
          console.warn("[auth] Supabase signOut failed during logout:", err);
        }
        set({ user: null, session: null });
      },

      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),

      refreshAuth: async () => {
        const { session } = get();
        if (!session?.refresh_token) return false;
        try {
          const data = await refreshSession(session.refresh_token);
          if (!data?.session?.access_token) {
            throw new Error("Refresh returned no access token");
          }
          const existing = get().user;
          set({
            user: existing ? { ...existing, ...data.user } : data.user,
            session: data.session,
          });
          return true;
        } catch (err) {
          console.warn("[auth] Session refresh failed; clearing local session:", err);
          try {
            await getSupabase().auth.signOut({ scope: "local" });
          } catch {
            // ignore secondary cleanup errors
          }
          set({ user: null, session: null });
          return false;
        }
      },

      initAuth: async () => {
        const { session, _initialized } = get();
        if (_initialized) return;
        set({ _initialized: true });

        if (!session?.refresh_token) {
          // Stale user without a refresh token cannot restore a session
          if (session || get().user) {
            set({ user: null, session: null });
          }
          return;
        }

        const isExpired =
          !session.expires_at || session.expires_at * 1000 <= Date.now() + 60_000;

        if (isExpired) {
          const ok = await get().refreshAuth();
          if (!ok) {
            set({ user: null, session: null });
          }
        }
      },
    }),
    {
      name: "cholokini-auth",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[auth] Failed to rehydrate persisted session:", error);
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
  return useAuthStore((s) => !!s.user && !!s.session);
}
