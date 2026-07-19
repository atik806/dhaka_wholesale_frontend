import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;
let clientInitPromise: Promise<SupabaseClient> | null = null;

function readAdminSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("admin_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.session?.access_token) {
      return {
        access_token: parsed.session.access_token,
        refresh_token: parsed.session.refresh_token || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function getOrCreateClient(): Promise<SupabaseClient> {
  if (adminClient) return adminClient;

  if (!clientInitPromise) {
    clientInitPromise = (async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error("Supabase env vars missing");

      const client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const session = readAdminSession();
      if (session) {
        await client.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }

      adminClient = client;
      clientInitPromise = null;
      return client;
    })().catch((err) => {
      clientInitPromise = null;
      throw err;
    });
  }

  return clientInitPromise;
}

export async function getAdminSupabase(): Promise<SupabaseClient> {
  const client = await getOrCreateClient();

  const session = readAdminSession();
  if (session) {
    try {
      await client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } catch {
      // token may be expired; subscription will fail gracefully
    }
  }

  return client;
}
