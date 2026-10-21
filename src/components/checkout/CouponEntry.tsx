"use client";

import { useState } from "react";
import { TicketPercent, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export function CouponEntry({ code, disabled, onApply, onRemove }: {
  code: string;
  disabled?: boolean;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apply = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true); setError("");
    try { await onApply(draft.trim().toUpperCase()); setDraft(""); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not apply coupon"); }
    finally { setBusy(false); }
  };
  return <div className="mb-5 rounded-xl border border-line p-3">
    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><TicketPercent className="h-4 w-4" />Coupon code</p>
    {code ? <div className="flex items-center justify-between gap-2 text-sm"><span className="font-mono font-semibold text-success">{code} applied</span><button type="button" disabled={disabled} onClick={() => { onRemove(); setError(""); }} aria-label="Remove coupon" className="rounded-lg p-1.5 text-muted hover:bg-surface-2"><X className="h-4 w-4" /></button></div>
      : <div className="flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void apply(); } }} maxLength={40} aria-label="Coupon code" placeholder="Enter code" disabled={disabled || busy} className="h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-accent/30" /><Button type="button" size="sm" disabled={disabled || !draft.trim()} loading={busy} onClick={() => void apply()}>Apply</Button></div>}
    {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
  </div>;
}
