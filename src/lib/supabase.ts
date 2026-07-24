import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase env vars missing. Restart the dev server after adding NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env"
      );
    }
    client = createClient(url, key, {
      auth: {
        flowType: "pkce",
        // Browser auth uses localStorage (not HTTP cookies). Keep this
        // explicit so session restore matches Zustand's cholokini-auth key.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? localStorage : undefined,
      },
    });
  }
  return client;
}
