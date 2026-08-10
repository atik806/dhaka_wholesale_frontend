import { useEffect, useRef, useCallback } from "react";
import { getAdminSupabase } from "@/src/lib/admin-supabase";

/** M1 fallback: sessions moved to httpOnly cookies, so realtime can't
 *  authenticate. Pages that only invalidate (e.g. the dashboard) instead
 *  re-run `onInvalidate` on a 30s loop — they keep updating, just slower. */
const POLL_INTERVAL_MS = 30_000;

interface InvalidateOptions {
  table: string;
  onInvalidate: () => void;
  filter?: string;
  enabled?: boolean;
}

export function useRealtimeInvalidate({
  table,
  onInvalidate,
  filter,
  enabled = true,
}: InvalidateOptions) {
  const onInvalidateRef = useRef(onInvalidate);
  useEffect(() => { onInvalidateRef.current = onInvalidate; });

  const stableInvalidate = useCallback(() => onInvalidateRef.current(), []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let channel: ReturnType<Awaited<ReturnType<typeof getAdminSupabase>>["channel"]> | null = null;

    (async () => {
      try {
        const supabase = await getAdminSupabase();
        if (!active) return;

        const cfg = {
          event: "*" as const,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        };

        channel = supabase
          .channel(`admin:inv:${table}:${Date.now()}`)
          .on("postgres_changes", cfg, () => {
            if (active) stableInvalidate();
          })
          .subscribe();
      } catch {
        // getAdminSupabase failed - subscription not established
      }
    })();

    // 30s polling fallback — realtime no longer authenticates (M1).
    const poll = setInterval(() => {
      if (active) stableInvalidate();
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(poll);
      if (channel) {
        (async () => {
          try {
            const supabase = await getAdminSupabase();
            supabase.removeChannel(channel!);
          } catch {}
        })();
      }
    };
  }, [table, filter, enabled, stableInvalidate]);
}
