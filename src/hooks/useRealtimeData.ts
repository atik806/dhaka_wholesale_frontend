import { useEffect, useState, useRef } from "react";
import { getAdminSupabase } from "@/src/lib/admin-supabase";
import type { SupabaseClient, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/** M1 fallback: sessions moved to httpOnly cookies, so realtime can't
 *  authenticate. Admin pages keep fresh via a 30s polling loop instead. */
const POLL_INTERVAL_MS = 30_000;

interface RealtimeOptions<T> {
  table: string;
  initialFetch: () => Promise<T[]>;
  primaryKey?: string;
  filter?: string;
  onInsert?: (current: T[], item: T) => T[];
  onUpdate?: (current: T[], item: T) => T[];
  onDelete?: (current: T[], item: T) => T[];
  enabled?: boolean;
}

function defaultOnUpdate<T>(current: T[], newRow: Record<string, unknown>, primaryKey: string): T[] {
  return current.map((item) => {
    const record = item as unknown as Record<string, unknown>;
    return record[primaryKey] === newRow[primaryKey]
      ? ({ ...record, ...newRow } as T)
      : item;
  });
}

function defaultOnDelete<T>(current: T[], deleted: Record<string, unknown>, primaryKey: string): T[] {
  const pk = deleted[primaryKey];
  return current.filter((item) => {
    const record = item as unknown as Record<string, unknown>;
    return record[primaryKey] !== pk;
  });
}

export function useRealtimeData<T>({
  table,
  initialFetch,
  primaryKey = "id",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: RealtimeOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialFetchRef = useRef(initialFetch);
  useEffect(() => { initialFetchRef.current = initialFetch; });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let channel: ReturnType<SupabaseClient["channel"]> | null = null;

    // Reloads the table. Loading is only toggled on the first run so the
    // 30s polls don't flash spinners; transient poll failures just surface
    // in `error` and are cleared on the next successful poll.
    const refreshData = async () => {
      if (!active) return;
      try {
        setError(null);
        const result = await initialFetchRef.current();
        if (active) setData(result);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        if (active) setLoading(false);
      }
    };

    // Initial load — data appears immediately, then the polling loop keeps
    // it fresh (M1 removed the JWT realtime relied on).
    refreshData();

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
          .channel(`admin:${table}:${Date.now()}`)
          .on("postgres_changes", cfg, (payload) => {
            if (!active) return;
            const { eventType, new: newRow, old: oldRow } = payload as unknown as RealtimePostgresChangesPayload<Record<string, unknown>>;

            setData((current) => {
              if (eventType === "INSERT") {
                const item = newRow as T;
                return onInsert
                  ? onInsert(current, item)
                  : [item, ...current];
              }
              if (eventType === "UPDATE") {
                return onUpdate
                  ? onUpdate(current, newRow as T)
                  : defaultOnUpdate(current, newRow, primaryKey);
              }
              if (eventType === "DELETE") {
                const deleted = oldRow ?? newRow;
                return onDelete
                  ? onDelete(current, deleted as T)
                  : defaultOnDelete(current, deleted, primaryKey);
              }
              return current;
            });
          })
          .subscribe();
      } catch {
        // getAdminSupabase failed - realtime not available
      }
    })();

    const poll = setInterval(() => { refreshData(); }, POLL_INTERVAL_MS);

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
  }, [table, filter, enabled, primaryKey, onInsert, onUpdate, onDelete]);

  return { data, loading, error };
}
