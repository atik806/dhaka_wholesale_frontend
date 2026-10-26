"use client";
import {
  useCallback,
  useId,
  Children,
  isValidElement,
  cloneElement,
  type ReactElement,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { opsGet, type PageMeta } from "@/src/lib/operations-api";
export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60";
export const buttonClass =
  "rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed";
export const secondaryClass =
  "rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-50";
export const labelFor = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (s) => s.toUpperCase());
export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="block space-y-1.5 text-sm">
      <label htmlFor={id} className="block font-medium text-muted">
        {label}
      </label>
      {Children.map(children, (child) =>
        isValidElement(child) &&
        typeof child.type === "string" &&
        ["input", "select", "textarea"].includes(child.type)
          ? cloneElement(child as ReactElement<{ id?: string }>, { id })
          : child,
      )}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p
      role="alert"
      className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger"
    >
      {message}
    </p>
  ) : null;
}
export function PageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
export function Pager({
  meta,
  onPage,
}: {
  meta: PageMeta;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
      <span className="text-muted">
        {meta.total} records · Page {meta.page} of{" "}
        {Math.max(1, meta.totalPages)}
      </span>
      <div className="flex gap-2">
        <button
          className={secondaryClass}
          disabled={meta.page <= 1}
          onClick={() => onPage(meta.page - 1)}
        >
          Previous
        </button>
        <button
          className={secondaryClass}
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPage(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function useOpsList<T>(
  resource: string,
  query: Record<string, string | number | undefined> = {},
) {
  const key = JSON.stringify(query);
  const { data, error, isLoading, mutate } = useSWR(
    resource === "movements" && !query.product_id
      ? null
      : ["ops-list:" + resource, key],
    () => opsGet<T[]>(resource, JSON.parse(key)),
    { revalidateOnFocus: true },
  );
  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);
  return {
    data: data?.data ?? [],
    meta: (data?.meta ?? {
      total: 0,
      page: Number(query.page ?? 1),
      limit: 25,
      totalPages: 0,
    }) as PageMeta,
    loading: isLoading,
    error: (error as Error)?.message ?? "",
    refresh,
  };
}
export function ListState({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
}) {
  return (
    <>
      <ErrorMessage message={error} />
      {loading ? (
        <p className="py-8 text-center text-muted" role="status">
          Loading…
        </p>
      ) : empty && !error ? (
        <p className="py-8 text-center text-muted">No matching records.</p>
      ) : null}
    </>
  );
}
