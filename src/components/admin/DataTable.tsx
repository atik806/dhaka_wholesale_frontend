"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  mobileCard?: (item: T) => React.ReactNode;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export function DataTable<T>({
  columns, data, keyExtractor, onRowClick, searchable, searchValue, onSearchChange,
  pagination, loading, mobileCard,
}: DataTableProps<T>) {
  const pageNumbers = pagination ? getPageNumbers(pagination.page, pagination.totalPages) : [];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {searchable && (
        <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 w-full max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent py-2.5 text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
      )}

      {/* Mobile card view */}
      {mobileCard && (
        <div className="md:hidden">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">Loading...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">No data found</div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
              {data.map((item) => (
                <div
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`p-4 ${onRowClick ? "cursor-pointer active:bg-zinc-50 dark:active:bg-zinc-800/50" : ""}`}
                >
                  {mobileCard(item)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop table view */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fallback for no mobileCard prop on mobile */}
      {!mobileCard && (
        <div className="md:hidden">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">Loading...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">No data found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                    {columns.map((col) => (
                      <th key={col.key} className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr
                      key={keyExtractor(item)}
                      onClick={() => onRowClick?.(item)}
                      className={`border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-zinc-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => pagination.onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    pagination.page === p
                      ? "bg-primary text-white"
                      : "border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
