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

  setAuth: (user: AuthUser, session: AuthSession) => void;
  logout: () => void;
  updateUser: (fields: Partial<AuthUser>) => void;
  refreshAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      _hydrated: false,

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
          set({ user: data.user, session: data.session });
          return true;
        } catch {
          set({ user: null, session: null });
          return false;
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
