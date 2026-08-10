import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;
let clientInitPromise: Promise<SupabaseClient> | null = null;

/**
 * M1: sessions live in the httpOnly `dw_session` cookie, never in
 * JavaScript-accessible storage. The Supabase client can therefore no
 * longer authenticate for realtime — `getAdminSupabase()` below exists
 * only so the hooks keep their best-effort subscription attempt, which
 * now no-ops. Data freshness comes from the polling fallback instead.
 */
async function getOrCreateClient(): Promise<SupabaseClient> {
  if (adminClient) return adminClient;

  if (!clientInitPromise) {
    clientInitPromise = (async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error("Supabase env vars missing");

      adminClient = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      clientInitPromise = null;
      return adminClient;
    })().catch((err) => {
      clientInitPromise = null;
      throw err;
    });
  }

  return clientInitPromise;
}

export async function getAdminSupabase(): Promise<SupabaseClient> {
  return getOrCreateClient();
}
