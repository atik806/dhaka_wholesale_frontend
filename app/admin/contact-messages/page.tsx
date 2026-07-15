"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Eye, EyeOff, Trash2, X, Loader2 } from "lucide-react";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { formatDate } from "@/src/lib/utils";
import {
  fetchContactMessages,
  markMessageRead,
  deleteContactMessage,
  type ContactMessage,
} from "@/src/lib/admin-api";

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const load = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetchContactMessages({ page, limit: 20 });
      setMessages(res.messages);
      setMeta(res.meta);
    } catch {
      // handled by adminFetcher 401 redirect
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchContactMessages({ page: 1, limit: 20 });
        if (active) { setMessages(res.messages); setMeta(res.meta); }
      } catch { /* 401 redirect */ }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const handleMarkRead = async (msg: ContactMessage) => {
    if (msg.is_read) return;
    try {
      await markMessageRead(msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
      if (selected?.id === msg.id) setSelected((prev) => prev ? { ...prev, is_read: true } : null);
    } catch {
      // handled by adminFetcher 401 redirect
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await deleteContactMessage(selected.id);
      setMessages((prev) => prev.filter((m) => m.id !== selected.id));
      setSelected(null);
    } catch {
      // handled by adminFetcher 401 redirect
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? messages.filter(
        (m) =>
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.subject.toLowerCase().includes(search.toLowerCase()) ||
          m.message.toLowerCase().includes(search.toLowerCase()),
      )
    : messages;

  const columns: Column<ContactMessage>[] = [
    {
      key: "status",
      label: "",
      render: (msg) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleMarkRead(msg); }}
          className={`p-1.5 rounded-lg transition-colors ${
            msg.is_read
              ? "text-zinc-300 dark:text-zinc-600"
              : "text-primary hover:bg-primary/10"
          }`}
          title={msg.is_read ? "Read" : "Mark as read"}
        >
          {msg.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (msg) => (
        <div>
          <p className={`font-medium ${!msg.is_read ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}>
            {msg.first_name} {msg.last_name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{msg.email}</p>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (msg) => (
        <span className={`max-w-xs block truncate ${!msg.is_read ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"}`}>
          {msg.subject}
        </span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (msg) => {
        const truncated = msg.message.length > 80 ? msg.message.slice(0, 80) + "..." : msg.message;
        return (
          <span className="text-zinc-500 dark:text-zinc-400 max-w-sm block truncate" title={msg.message}>
            {truncated}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      render: (msg) => (
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{formatDate(msg.created_at)}</span>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Contact Messages</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {meta.total} total{", "}
            {messages.filter((m) => !m.is_read).length} unread
          </p>
        </div>
      </div>

      <DataTable<ContactMessage>
        columns={columns}
        data={filtered}
        keyExtractor={(m) => m.id}
        onRowClick={(msg) => setSelected(msg)}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        pagination={{
          page: meta.page,
          totalPages: meta.totalPages,
          onPageChange: (page) => load(page),
        }}
        mobileCard={(msg) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                <p className="text-sm font-medium truncate">{msg.first_name} {msg.last_name}</p>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{msg.subject}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{msg.message}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{formatDate(msg.created_at)}</p>
            </div>
          </div>
        )}
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
              className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto border border-zinc-200 dark:border-zinc-700"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-lg font-bold">Message Details</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">First Name</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{selected.first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Last Name</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{selected.last_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Email</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm font-medium text-primary hover:underline mt-1 block"
                  >
                    {selected.email}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Subject</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{selected.subject}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Message</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                      {formatDate(selected.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Status</p>
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium mt-1 ${
                        selected.is_read ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {selected.is_read ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {selected.is_read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-5 border-t border-zinc-200 dark:border-zinc-700">
                {!selected.is_read && (
                  <button
                    onClick={() => handleMarkRead(selected)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50 ml-auto"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
