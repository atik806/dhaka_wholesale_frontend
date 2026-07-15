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
          await getSupabase().auth.signOut();
        } catch {
          // sign out even if server call fails
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
          const existing = get().user;
          set({
            user: existing ? { ...existing, ...data.user } : data.user,
            session: data.session,
          });
          return true;
        } catch {
          set({ user: null, session: null });
          return false;
        }
      },

      initAuth: async () => {
        const { session, _initialized } = get();
        if (_initialized) return;
        set({ _initialized: true });

        if (!session?.refresh_token) return;

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
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
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
