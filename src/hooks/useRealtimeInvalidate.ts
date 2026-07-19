import { useEffect, useRef, useCallback } from "react";
import { getAdminSupabase } from "@/src/lib/admin-supabase";

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

    return () => {
      active = false;
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
