"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug, X, Loader2, ExternalLink, Image as ImageIcon,
  AlertTriangle, ArrowUp, Minus, ChevronDown,
} from "lucide-react";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { formatDate } from "@/src/lib/utils";
import {
  fetchBugReports,
  updateBugReport,
  type BugReport,
} from "@/src/lib/admin-api";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
  medium: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  high: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  critical: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  reviewed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  resolved: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

const PRIORITY_ICON: Record<string, React.ReactNode> = {
  low: <Minus className="w-3 h-3" />,
  medium: <ChevronDown className="w-3 h-3" />,
  high: <ArrowUp className="w-3 h-3" />,
  critical: <AlertTriangle className="w-3 h-3" />,
};

export default function AdminBugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [replyText, setReplyText] = useState("");

  const load = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetchBugReports({ page, limit: 20 });
      setReports(res.reports);
      setMeta(res.meta);
    } catch { /* 401 redirect */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchBugReports({ page: 1, limit: 20 });
        if (active) { setReports(res.reports); setMeta(res.meta); }
      } catch { /* 401 redirect */ }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const handleStatusChange = async (report: BugReport, status: string) => {
    setUpdating(true);
    try {
      const updated = await updateBugReport(report.id, { status });
      setReports((prev) => prev.map((r) => r.id === report.id ? updated : r));
      if (selected?.id === report.id) setSelected(updated);
    } catch {
      // handled by adminFetcher
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (report: BugReport, priority: string) => {
    setUpdating(true);
    try {
      const updated = await updateBugReport(report.id, { priority });
      setReports((prev) => prev.map((r) => r.id === report.id ? updated : r));
      if (selected?.id === report.id) setSelected(updated);
    } catch {
      // handled by adminFetcher
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveReply = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const updated = await updateBugReport(selected.id, {
        admin_reply: replyText,
        status: selected.status === "pending" ? "reviewed" : selected.status,
      });
      setReports((prev) => prev.map((r) => r.id === selected.id ? updated : r));
      setSelected(updated);
    } catch {
      // handled by adminFetcher
    } finally {
      setUpdating(false);
    }
  };

  const filtered = search
    ? reports.filter(
        (r) =>
          r.message.toLowerCase().includes(search.toLowerCase()) ||
          r.page_url.toLowerCase().includes(search.toLowerCase()),
      )
    : reports;

  const statusFiltered = statusFilter
    ? filtered.filter((r) => r.status === statusFilter)
    : filtered;

  const columns: Column<BugReport>[] = [
    {
      key: "priority",
      label: "Priority",
      render: (r) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[r.priority]}`}>
          {PRIORITY_ICON[r.priority]}
          {r.priority}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: "message",
      label: "Report",
      render: (r) => {
        const truncated = r.message.length > 60 ? r.message.slice(0, 60) + "..." : r.message;
        return (
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100 max-w-xs truncate">{truncated}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{r.page_url}</span>
            </p>
          </div>
        );
      },
    },
    {
      key: "screenshot",
      label: "Screenshot",
      render: (r) =>
        r.screenshot_url ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <img src={r.screenshot_url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (r) => (
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{formatDate(r.created_at)}</span>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Bug Reports</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {meta.total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["", "pending", "reviewed", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <DataTable<BugReport>
        columns={columns}
        data={statusFiltered}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => {
          setSelected(r);
          setReplyText(r.admin_reply || "");
        }}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        pagination={{
          page: meta.page,
          totalPages: meta.totalPages,
          onPageChange: (page) => load(page),
        }}
      />

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-zinc-200 dark:border-zinc-700"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-amber-500" />
                  <h2 className="font-serif text-lg font-bold">Bug Report</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Priority</p>
                    <select
                      value={selected.priority}
                      onChange={(e) => handlePriorityChange(selected, e.target.value)}
                      disabled={updating}
                      className="text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 px-2 py-1 bg-white dark:bg-zinc-800 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                    <select
                      value={selected.status}
                      onChange={(e) => handleStatusChange(selected, e.target.value)}
                      disabled={updating}
                      className="text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 px-2 py-1 bg-white dark:bg-zinc-800 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Description</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Page URL</p>
                  <a
                    href={selected.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 flex items-center gap-1 break-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    {selected.page_url}
                  </a>
                </div>

                {selected.screenshot_url && (
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Screenshot</p>
                    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <img
                        src={selected.screenshot_url}
                        alt="Bug screenshot"
                        className="w-full max-h-60 object-contain bg-zinc-50 dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                )}

                {!selected.screenshot_url && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <ImageIcon className="w-4 h-4" />
                    No screenshot attached
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Reported</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                      {formatDate(selected.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">User</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                      {selected.user_id ? "Logged-in user" : "Anonymous"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Admin Reply</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a reply or internal note..."
                    rows={3}
                    maxLength={2000}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-zinc-400">{replyText.length}/2000</span>
                    <button
                      onClick={handleSaveReply}
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {updating ? "Saving..." : "Save Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
