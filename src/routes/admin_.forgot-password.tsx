import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ParkingSquare, Loader2, Mail, ArrowLeft, MailCheck } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";

export const Route = createFileRoute("/admin_/forgot-password")({
  ssr: false,
  component: ForgotPasswordPage,
});

const NEUTRAL_MESSAGE =
  "If an administrator account exists for this email address, a password reset link has been sent.";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return setError("Enter a valid email address.");

    setLoading(true);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(firebaseAuth, trimmed, {
        url: `${window.location.origin}/admin/login`,
      });
    } catch {
      // Never reveal whether the account exists — always show the neutral state.
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white">
          <ParkingSquare className="h-5 w-5" />
        </span>

        {sent ? (
          <>
            <span className="mt-4 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <MailCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-foreground">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">{NEUTRAL_MESSAGE}</p>
            <Link
              to="/admin/login"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-xl font-bold text-foreground">Reset password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your administrator email and we'll send a secure password reset link.
            </p>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="text-xs font-semibold text-foreground">Admin email</label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="you@organization.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Password Reset Link
              </button>
            </form>

            <Link
              to="/admin/login"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
