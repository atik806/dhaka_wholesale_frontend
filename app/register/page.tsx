"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/src/lib/auth-api";
import { useAuthStore } from "@/src/store/useAuthStore";
import { SiteLogo } from "@/src/components/brand/SiteLogo";
import { BookOpen } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-[#BE3D1F]" };
  if (score === 2) return { score, label: "Medium", color: "bg-[#F5A300]" };
  return { score, label: "Strong", color: "bg-[#1F6F50]" };
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!agreedToTerms) {
      setError("Please accept the Terms of Service");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      if (data.session?.access_token) {
        setAuth(data.user, data.session);
        router.push("/");
      } else {
        setSuccess(data.message || "Registration successful! Please check your email to confirm your account.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FBF6EC] dark:bg-[#0D1F2C]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] shadow-xl p-8 relative overflow-hidden">
          {/* Top Stamp Tag */}
          <div className="absolute top-0 right-0 bg-[#132A3A] text-[#F5A300] font-mono text-[9px] font-bold px-3 py-1 uppercase tracking-widest border-b border-l border-[#E7DCC4] dark:border-[#2a3d4d]">
            NEW ACCOUNT
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <SiteLogo variant="auth" href="/" priority showWordmark />
            </div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-[#1F6F50] bg-[#1F6F50]/10 px-2 py-0.5 rounded-[2px] mb-2">
              <BookOpen className="w-3 h-3" /> NEW ACCOUNT
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#132A3A] dark:text-[#E7DCC4]">
              Create Your Account
            </h1>
            <p className="font-mono text-xs text-[#1C1A17]/70 dark:text-[#a0b4c4] mt-1">
              Create your account today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                minLength={2}
                className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">
                Account Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
              />
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-[2px] ${
                          i < strength.score ? strength.color : "bg-[#E7DCC4]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#132A3A] dark:text-[#E7DCC4]">
                    {strength.label.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block font-bold text-[#132A3A] dark:text-[#E7DCC4] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                minLength={8}
                className="w-full rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] px-4 py-2.5 outline-none focus:border-[#F5A300] bg-[#FBF6EC] dark:bg-[#0D1F2C] text-[#132A3A] dark:text-[#E7DCC4] placeholder:text-[#1C1A17]/40 dark:placeholder:text-[#a0b4c4]"
              />
            </div>
            <label className="flex items-start gap-2 cursor-pointer font-sans text-xs text-[#1C1A17]">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded-[2px] accent-[#F5A300]"
              />
              <span>
                I agree to the{" "}
                <Link href="/privacy-policy" className="text-[#BE3D1F] font-bold underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-[#BE3D1F] font-bold underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error && (
              <p className="font-mono text-xs font-bold text-[#BE3D1F] bg-[#BE3D1F]/10 rounded-[2px] border border-[#BE3D1F]/30 p-3">
                {error}
              </p>
            )}
            {success && (
              <p className="font-mono text-xs font-bold text-[#1F6F50] bg-[#1F6F50]/10 rounded-[2px] border border-[#1F6F50]/30 p-3">
                {success}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading} rotate>
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </Button>
          </form>

          <p className="font-mono text-xs text-[#1C1A17]/70 dark:text-[#a0b4c4] text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#132A3A] dark:text-[#E7DCC4] font-bold underline hover:text-[#BE3D1F]"
            >
              SIGN IN TO ACCOUNT
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
