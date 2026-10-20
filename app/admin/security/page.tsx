"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { changeAdminPassword } from "@/src/lib/admin-api";
import { validateStrongPassword } from "@/src/lib/password";
import { AuthBanner } from "@/src/components/auth/AuthLanding";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { useToast } from "@/src/providers/ToastProvider";

export default function AdminSecurityPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const validationError = validateStrongPassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (newPassword === currentPassword) {
      setError("Your new password must be different from the current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changeAdminPassword(currentPassword, newPassword);
      addToast("Password updated. Sign in again with your new password.", "success");
      router.replace("/admin/login");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-xl bg-accent/10 p-2.5 text-accent">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="font-serif text-2xl font-bold text-fg">Security</h1>
        </div>
        <p className="text-sm text-muted">
          Change the admin password. You will be signed out on success.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7">
        <h2 className="mb-1 text-lg font-bold text-fg">Change password</h2>
        <p className="mb-6 text-sm text-muted">
          Confirm your current password before choosing a replacement.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            maxLength={100}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
            hint="8+ characters with uppercase, lowercase, number, and symbol."
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
          />

          {error && <AuthBanner tone="error">{error}</AuthBanner>}

          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>
    </div>
  );
}
