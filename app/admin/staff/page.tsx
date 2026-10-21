"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/providers/ToastProvider";
import { formatDate } from "@/src/lib/utils";
import {
  createStaff,
  deleteStaff,
  fetchAllStaff,
  updateStaff,
  type StaffMember,
  type StaffPayload,
  type StaffStatus,
} from "@/src/lib/admin-api";

const DEFAULT_DEPARTMENTS = [
  "Management",
  "Sales",
  "Operations",
  "Inventory",
  "Customer Support",
  "Finance",
];

const INPUT_CLASS =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none transition-shadow placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20";

type StaffForm = {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  status: StaffStatus;
  avatar_url: string;
  joined_at: string;
};

function emptyForm(): StaffForm {
  return {
    name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "Sales",
    status: "active",
    avatar_url: "",
    joined_at: new Date().toISOString().slice(0, 10),
  };
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  );
}

function StaffAvatar({
  member,
  large = false,
}: {
  member: StaffMember;
  large?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const size = large ? "h-14 w-14 text-base" : "h-10 w-10 text-sm";
  if (member.avatar_url && member.avatar_url !== failedUrl) {
    return (
      <img
        src={member.avatar_url}
        alt={`${member.name} profile`}
        className={`${size} rounded-xl object-cover bg-surface-2 shrink-0`}
        onError={() => setFailedUrl(member.avatar_url)}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-xl bg-brand text-brand-fg flex items-center justify-center font-semibold shrink-0`}
    >
      {initials(member.name)}
    </div>
  );
}

export default function AdminStaffPage() {
  const { addToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState<"all" | StaffStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(saving);
  savingRef.current = saving;

  const loadStaff = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      setError("");
      const result = await fetchAllStaff();
      setStaff(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
        ) || [],
      );
    modalRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!savingRef.current) setModalOpen(false);
      }
      if (event.key === "Tab") {
        const controls = focusable();
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [modalOpen]);

  useEffect(() => {
    void loadStaff(true);
    const poll = window.setInterval(() => void loadStaff(), 30_000);
    return () => window.clearInterval(poll);
  }, [loadStaff]);

  useEffect(() => {
    const closeMenu = () => setMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const departments = useMemo(
    () =>
      Array.from(
        new Set([
          ...DEFAULT_DEPARTMENTS,
          ...staff.map((member) => member.department),
        ]),
      ).sort(),
    [staff],
  );

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staff.filter((member) => {
      const matchesSearch =
        !query ||
        [
          member.name,
          member.email,
          member.job_title,
          member.department,
          member.phone || "",
        ].some((value) => value.toLowerCase().includes(query));
      return (
        matchesSearch &&
        (department === "all" || member.department === department) &&
        (status === "all" || member.status === status)
      );
    });
  }, [department, search, staff, status]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visibleStaff = filteredStaff.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );

  const summary = useMemo(
    () => ({
      total: staff.length,
      active: staff.filter((member) => member.status === "active").length,
      onLeave: staff.filter((member) => member.status === "on_leave").length,
      departments: new Set(staff.map((member) => member.department)).size,
    }),
    [staff],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      job_title: member.job_title,
      department: member.department,
      status: member.status,
      avatar_url: member.avatar_url || "",
      joined_at: member.joined_at,
    });
    setFormError("");
    setMenuId(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setFormError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const payload: StaffPayload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      job_title: form.job_title.trim(),
      department: form.department.trim(),
      status: form.status,
      avatar_url: form.avatar_url.trim() || null,
      joined_at: form.joined_at,
    };

    try {
      if (editing) {
        await updateStaff(editing.id, payload);
        addToast("Staff member updated", "success");
      } else {
        await createStaff(payload);
        addToast("Staff member added", "success");
      }
      setModalOpen(false);
      setEditing(null);
      await loadStaff();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save staff member",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: StaffMember) => {
    setMenuId(null);
    const accepted = await confirm(
      "Remove staff member",
      `Remove ${member.name} from the staff directory? This cannot be undone.`,
      { confirmLabel: "Remove", danger: true },
    );
    if (!accepted) return;
    setActionId(member.id);
    try {
      await deleteStaff(member.id);
      setStaff((current) => current.filter((item) => item.id !== member.id));
      addToast("Staff member removed", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to remove staff member",
        "error",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleStatusToggle = async (member: StaffMember) => {
    const nextStatus: StaffStatus =
      member.status === "active" ? "inactive" : "active";
    setMenuId(null);
    setActionId(member.id);
    try {
      const updated = await updateStaff(member.id, { status: nextStatus });
      setStaff((current) =>
        current.map((item) => (item.id === member.id ? updated : item)),
      );
      addToast(`${member.name} marked ${nextStatus}`, "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to update status",
        "error",
      );
    } finally {
      setActionId(null);
    }
  };

  const summaryCards = [
    {
      label: "Total staff",
      value: summary.total,
      icon: UsersRound,
      style: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    },
    {
      label: "Active",
      value: summary.active,
      icon: CheckCircle2,
      style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    },
    {
      label: "On leave",
      value: summary.onLeave,
      icon: CalendarDays,
      style: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    },
    {
      label: "Departments",
      value: summary.departments,
      icon: Building2,
      style: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {dialog}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-link mb-2">
            <BriefcaseBusiness className="w-4 h-4" /> Team directory
          </div>
          <h1 className="font-serif text-3xl font-bold text-fg">Staff</h1>
          <p className="text-sm text-muted mt-1">
            Keep your team details, roles, and availability in one place.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-accent-fg rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add staff member
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {summaryCards.map(({ label, value, icon: Icon, style }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${style}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-fg">{value}</p>
              <p className="text-xs sm:text-sm text-muted truncate">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-surface border border-line rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-line flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 border border-line flex-1 min-w-0">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              aria-label="Search staff"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, role, email, or phone..."
              className="w-full bg-transparent py-2.5 text-sm outline-none text-fg placeholder:text-muted"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setPage(1);
              }}
              className="min-w-0 bg-surface border border-line rounded-xl px-3 py-2.5 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
              aria-label="Filter by department"
            >
              <option value="all">All departments</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "all" | StaffStatus);
                setPage(1);
              }}
              className="min-w-0 bg-surface border border-line rounded-xl px-3 py-2.5 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="m-4 bg-danger-soft border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 text-sm text-danger flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              onClick={() => void loadStaff(true)}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading team...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-2 flex items-center justify-center text-muted mb-4">
              <UserRound className="w-7 h-7" />
            </div>
            <h2 className="font-semibold text-fg">
              {staff.length === 0
                ? "No staff members yet"
                : "No matching staff"}
            </h2>
            <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
              {staff.length === 0
                ? "Add your first team member to start building the directory."
                : "Try changing the search or filters."}
            </p>
            {staff.length === 0 && (
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-link hover:text-link-hover"
              >
                <Plus className="w-4 h-4" /> Add staff member
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2/60 border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-3.5 font-semibold">Staff member</th>
                    <th className="px-5 py-3.5 font-semibold">Role</th>
                    <th className="px-5 py-3.5 font-semibold">Contact</th>
                    <th className="px-5 py-3.5 font-semibold">Joined</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {visibleStaff.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-2/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-[210px]">
                          <StaffAvatar member={member} />
                          <div className="min-w-0">
                            <p className="font-semibold text-fg truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-muted truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-fg">
                          {member.job_title}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {member.department}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {member.phone ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {member.phone}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {formatDate(member.joined_at)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={member.status} />
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setMenuId((current) =>
                              current === member.id ? null : member.id,
                            );
                          }}
                          disabled={actionId === member.id}
                          className="p-2 rounded-lg text-muted hover:text-fg hover:bg-surface-2 disabled:opacity-50 transition-colors"
                          aria-label={`Actions for ${member.name}`}
                        >
                          {actionId === member.id ? (
                            <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <MoreHorizontal className="w-5 h-5" />
                          )}
                        </button>
                        {menuId === member.id && (
                          <div
                            onClick={(event) => event.stopPropagation()}
                            className="absolute right-14 bottom-0 z-20 w-44 bg-surface border border-line rounded-xl shadow-xl p-1.5 text-left"
                          >
                            <button
                              onClick={() => openEdit(member)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 text-sm"
                            >
                              <Edit3 className="w-4 h-4" /> Edit details
                            </button>
                            <button
                              onClick={() => void handleStatusToggle(member)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 text-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Mark{" "}
                              {member.status === "active"
                                ? "inactive"
                                : "active"}
                            </button>
                            <button
                              onClick={() => void handleDelete(member)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-danger-soft text-sm text-danger"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-line">
              {visibleStaff.map((member) => (
                <article key={member.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <StaffAvatar member={member} large />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="font-semibold text-fg truncate">
                            {member.name}
                          </h2>
                          <p className="text-sm text-muted truncate">
                            {member.job_title}
                          </p>
                        </div>
                        <StatusBadge status={member.status} />
                      </div>
                      <p className="text-xs text-link mt-1.5">
                        {member.department}
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 mt-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {member.phone || "No phone added"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      Joined {formatDate(member.joined_at)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEdit(member)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-line hover:bg-surface-2 text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => void handleStatusToggle(member)}
                      disabled={actionId === member.id}
                      className="px-3 py-2 rounded-xl border border-line hover:bg-surface-2 text-sm font-medium disabled:opacity-50"
                    >
                      {member.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => void handleDelete(member)}
                      disabled={actionId === member.id}
                      className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-danger hover:bg-danger-soft disabled:opacity-50"
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!loading && !error && staff.length > 0 && (
          <div className="px-4 py-3 border-t border-line bg-surface-2/30 text-xs text-muted flex flex-wrap items-center justify-between gap-3">
            <span>
              {filteredStaff.length} matching staff · {staff.length} total
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-2 disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeModal}
                  className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                />
                <div className="fixed inset-0 z-[70] overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
                  <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="staff-form-title"
                    className="w-full max-w-2xl my-auto bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 py-5 border-b border-line flex items-start justify-between gap-4">
                      <div>
                        <h2
                          id="staff-form-title"
                          className="text-xl font-bold text-fg"
                        >
                          {editing ? "Edit staff member" : "Add staff member"}
                        </h2>
                        <p className="text-sm text-muted mt-1">
                          {editing
                            ? "Update this team member’s directory information."
                            : "Create a directory record for a new team member."}
                        </p>
                      </div>
                      <button
                        onClick={closeModal}
                        disabled={saving}
                        className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-fg disabled:opacity-50"
                        aria-label="Close dialog"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 sm:p-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="sm:col-span-2">
                          <span className="block text-sm font-medium mb-1.5">
                            Full name <span className="text-danger">*</span>
                          </span>
                          <input
                            required
                            maxLength={100}
                            value={form.name}
                            onChange={(event) =>
                              setForm({ ...form, name: event.target.value })
                            }
                            placeholder="e.g. Nusrat Jahan"
                            className={INPUT_CLASS}
                          />
                        </label>
                        <label>
                          <span className="block text-sm font-medium mb-1.5">
                            Email <span className="text-danger">*</span>
                          </span>
                          <input
                            required
                            type="email"
                            maxLength={254}
                            value={form.email}
                            onChange={(event) =>
                              setForm({ ...form, email: event.target.value })
                            }
                            placeholder="name@company.com"
                            className={INPUT_CLASS}
                          />
                        </label>
                        <label>
                          <span className="block text-sm font-medium mb-1.5">
                            Phone
                          </span>
                          <input
                            type="tel"
                            maxLength={30}
                            value={form.phone}
                            onChange={(event) =>
                              setForm({ ...form, phone: event.target.value })
                            }
                            placeholder="+880 1XXX-XXXXXX"
                            className={INPUT_CLASS}
                          />
                        </label>
                        <label>
                          <span className="block text-sm font-medium mb-1.5">
                            Job title <span className="text-danger">*</span>
                          </span>
                          <input
                            required
                            maxLength={100}
                            value={form.job_title}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                job_title: event.target.value,
                              })
                            }
                            placeholder="e.g. Sales Manager"
                            className={INPUT_CLASS}
                          />
                        </label>
                        <label>
                          <span className="block text-sm font-medium mb-1.5">
                            Department <span className="text-danger">*</span>
                          </span>
                          <input
                            required
                            list="staff-departments"
                            maxLength={100}
                            value={form.department}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                department: event.target.value,
                              })
                            }
                            placeholder="Select or enter a department"
                            className={INPUT_CLASS}
                          />
                          <datalist id="staff-departments">
                            {departments.map((item) => (
                              <option key={item} value={item} />
                            ))}
                          </datalist>
                        </label>
                        <label>
                          <span className="block text-sm font-medium mb-1.5">
                            Status
                          </span>
                          <select
                            value={form.status}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                status: event.target.value as StaffStatus,
                              })
                            }
                            className={INPUT_CLASS}
                          >
                            <option value="active">Active</option>
                            <option value="on_leave">On leave</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </label>
                        <label>
                          <span className="block text-sm font-medium mb-1.5">
                            Start date <span className="text-danger">*</span>
                          </span>
                          <input
                            required
                            type="date"
                            value={form.joined_at}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                joined_at: event.target.value,
                              })
                            }
                            className={INPUT_CLASS}
                          />
                        </label>
                        <label className="sm:col-span-2">
                          <span className="block text-sm font-medium mb-1.5">
                            Profile image URL
                          </span>
                          <input
                            type="url"
                            maxLength={2048}
                            value={form.avatar_url}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                avatar_url: event.target.value,
                              })
                            }
                            placeholder="https://example.com/profile.jpg"
                            className={INPUT_CLASS}
                          />
                        </label>
                      </div>

                      {formError && (
                        <p className="mt-4 text-sm text-danger bg-danger-soft border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
                          {formError}
                        </p>
                      )}
                      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 mt-6 pt-5 border-t border-line">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={saving}
                          className="px-4 py-2.5 rounded-xl border border-line text-sm font-semibold hover:bg-surface-2 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-fg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50"
                        >
                          {saving && (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          )}
                          {saving
                            ? "Saving..."
                            : editing
                              ? "Save changes"
                              : "Add staff member"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </motion.div>
  );
}
