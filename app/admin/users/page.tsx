"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Shield, User, Plus, X } from "lucide-react";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { formatDate } from "@/src/lib/utils";
import { fetchUsers, updateUserRole, deleteUser, createUser, type UserProfile } from "@/src/lib/admin-api";

export default function AdminUsersPage() {
  const { confirm, dialog } = useConfirm();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchUsers();
        if (active) setUsers(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleRoleToggle = async (user: UserProfile) => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    const ok = await confirm(
      "Change Role",
      `Change role of "${user.name}" from "${user.role}" to "${newRole}"?`,
      { confirmLabel: "Change" }
    );
    if (!ok) return;
    setActionLoading(user.id);
    try {
      const updated = await updateUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    const ok = await confirm(
      "Delete User",
      `Are you sure you want to delete user "${user.name}"? This cannot be undone.`,
      { confirmLabel: "Delete", danger: true }
    );
    if (!ok) return;
    setActionLoading(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "name",
      label: "Name",
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="w-8 h-8 rounded-full object-cover bg-zinc-100 dark:bg-zinc-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary dark:text-primary-light" />
            </div>
          )}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (user) => <StatusBadge status={user.role} />,
    },
    {
      key: "created_at",
      label: "Joined",
      render: (user) => (
        <span className="text-zinc-500 dark:text-zinc-400">{formatDate(user.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleRoleToggle(user); }}
            disabled={actionLoading === user.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            title={`Change role to ${user.role === "admin" ? "customer" : "admin"}`}
          >
            {actionLoading === user.id ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shield className="w-3.5 h-3.5" />
            )}
            {user.role === "admin" ? "Demote" : "Promote"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
            disabled={actionLoading === user.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl px-6 py-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {dialog}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Users</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage customer and admin accounts
            </p>
          </div>
          <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Add New Admin</h2>
                  <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setFormError("");
                  setFormLoading(true);
                  try {
                    const newUser = await createUser(form);
                    setUsers((prev) => [newUser, ...prev]);
                    setShowModal(false);
                    setForm({ name: "", email: "", password: "" });
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : "Failed to create user";
                    setFormError(msg.includes("Internal server error") ? "Server error — check backend logs for details" : msg);
                  } finally {
                    setFormLoading(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      required
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="admin@example.com"
                      required
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">{formError}</p>
                  )}
                  <div className="flex items-center gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                    >
                      {formLoading ? "Creating..." : "Create Admin"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DataTable<UserProfile>
        columns={columns}
        data={filtered}
        keyExtractor={(u) => u.id}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        mobileCard={(user) => (
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={user.role} />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleRoleToggle(user); }}
                disabled={actionLoading === user.id}
                className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                disabled={actionLoading === user.id}
                className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      />
    </motion.div>
  );
}
