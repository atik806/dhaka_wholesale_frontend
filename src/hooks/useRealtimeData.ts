import { useEffect, useState, useRef, useCallback } from "react";
import { getAdminSupabase } from "@/src/lib/admin-supabase";
import type { SupabaseClient, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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
  return current.map((item) =>
    (item as Record<string, unknown>)[primaryKey] === newRow[primaryKey]
      ? { ...item, ...newRow } as unknown as T
      : item
  );
}

function defaultOnDelete<T>(current: T[], deleted: Record<string, unknown>, primaryKey: string): T[] {
  const pk = deleted[primaryKey];
  return current.filter((item) => (item as Record<string, unknown>)[primaryKey] !== pk);
}

export function useRealtimeData<T extends { [key: string]: any }>({
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
  initialFetchRef.current = initialFetch;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let channel: ReturnType<SupabaseClient["channel"]> | null = null;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await initialFetchRef.current();
        if (!active) return;
        setData(result);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to fetch");
        setLoading(false);
        return;
      }

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
  }, [table, filter, enabled, primaryKey, onInsert, onUpdate, onDelete]);

  return { data, loading, error };
}
