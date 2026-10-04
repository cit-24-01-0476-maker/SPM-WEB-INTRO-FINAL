import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ParkingSquare,
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { firebaseApp, firebaseAuth, firestore } from "@/lib/firebase/client";
import { isApprovedRole } from "@/lib/admin/auth";
import bgImage from "@/assets/hero-parking-poster.jpg";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  component: AdminLoginPage,
});

const REMEMBER_EMAIL_KEY = "spm.admin.rememberedEmail";

const MSG = {
  invalid: "Invalid email or password.",
  invalidEmail: "Enter a valid administrator email address.",
  disabled: "This administrator account is currently disabled.",
  tooMany: "Too many unsuccessful attempts. Please try again later or reset your password.",
  network: "Unable to connect to Firebase. Check your connection and try again.",
  notAllowed: "Email and password authentication is not enabled for this Firebase project.",
  // Firestore admin-profile problems (after Firebase auth already succeeded).
  docMissing: "Your Firebase account is valid, but no administrator profile is linked to it.",
  permission:
    "Firebase authenticated your account, but Firestore blocked access to your administrator profile.",
  inactive: "This administrator account is currently inactive.",
  invalidRole: "This account does not have a valid administrator role.",
  unknown: "Unable to sign in. Please try again.",
};

/** Maps a raw FirebaseError auth code to a safe, user-facing message. */
function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return MSG.invalid;
    case "auth/invalid-email":
      return MSG.invalidEmail;
    case "auth/user-disabled":
      return MSG.disabled;
    case "auth/too-many-requests":
      return MSG.tooMany;
    case "auth/network-request-failed":
      return MSG.network;
    case "auth/operation-not-allowed":
      return MSG.notAllowed;
    case "permission-denied":
      return MSG.permission;
    default:
      return MSG.unknown;
  }
}

type AuthResult = "Not tested" | "Failed" | "Successful";
type ProfileResult =
  "Not checked" | "Missing" | "Permission blocked" | "Inactive" | "Invalid role" | "Valid";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dev-only diagnostics state.
  const [authResult, setAuthResult] = useState<AuthResult>("Not tested");
  const [profileResult, setProfileResult] = useState<ProfileResult>("Not checked");
  const [authedUid, setAuthedUid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Restore only the email when "Remember me" was previously chosen. The
  // password is NEVER stored or restored.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) setEmail(saved);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  // If a valid, active admin is already signed in, skip the form.
  useEffect(() => {
    let active = true;
    let unsub = () => {};
    void (async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      const { doc, getDoc } = await import("firebase/firestore");
      unsub = onAuthStateChanged(firebaseAuth, async (u) => {
        if (!active || !u) return;
        try {
          const snap = await getDoc(doc(firestore, "admins", u.uid));
          const d = snap.exists() ? (snap.data() as Record<string, unknown>) : null;
          if (d && isApprovedRole(d.role) && d.status === "active") {
            navigate({ to: "/admin/dashboard", replace: true });
          }
        } catch {
          /* ignore — the form remains available */
        }
      });
    })();
    return () => {
      active = false;
      unsub();
    };
  }, [navigate]);

  async function copyUid() {
    if (!authedUid) return;
    try {
      await navigator.clipboard.writeText(authedUid);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore clipboard errors */
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // 1. Clear the previous UI state.
    setError(null);
    setAuthResult("Not tested");
    setProfileResult("Not checked");
    setAuthedUid(null);

    // 2. Validate email and password.
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setError(MSG.invalidEmail);
    if (!password) return setError("Password is required.");

    // 3. Disable the submit button.
    setLoading(true);
    try {
      const {
        signInWithEmailAndPassword,
        signOut,
        setPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      } = await import("firebase/auth");
      const { doc, getDoc, updateDoc, serverTimestamp } = await import("firebase/firestore");

      // 4. Set Firebase persistence based on "Remember me".
      await setPersistence(
        firebaseAuth,
        remember ? browserLocalPersistence : browserSessionPersistence,
      );

      // 5. Authenticate with Firebase FIRST.
      const credential = await signInWithEmailAndPassword(firebaseAuth, trimmedEmail, password);
      setAuthResult("Successful");

      // Use the EXACT authenticated UID as the admin document ID.
      const uid = credential.user.uid;
      setAuthedUid(uid);

      // Persist (or clear) the remembered email — never the password.
      try {
        if (remember) window.localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
        else window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
      } catch {
        /* ignore */
      }

      // 6. Only after auth succeeds, read admins/{uid} by the exact UID.
      const adminRef = doc(firestore, "admins", uid);
      let adminSnapshot;
      try {
        adminSnapshot = await getDoc(adminRef);
      } catch (readErr) {
        const rc = (readErr as { code?: string }).code ?? "";
        if (import.meta.env.DEV) {
          console.error("[ADMIN_DOCUMENT_PERMISSION_DENIED] read error code:", rc);
          console.info("Authenticated UID:", uid);
          console.info("Admin document path:", `admins/${uid}`);
        }
        setProfileResult("Permission blocked");
        await signOut(firebaseAuth);
        setError(MSG.permission);
        return;
      }

      if (import.meta.env.DEV) {
        console.info("Authenticated UID:", uid);
        console.info("Admin document path:", `admins/${uid}`);
        console.info("Admin document exists:", adminSnapshot.exists());
      }

      // 7. Validate the admin profile.
      if (!adminSnapshot.exists()) {
        if (import.meta.env.DEV) console.warn("[ADMIN_DOCUMENT_MISSING]");
        setProfileResult("Missing");
        await signOut(firebaseAuth);
        setError(MSG.docMissing);
        return;
      }

      const d = adminSnapshot.data() as Record<string, unknown>;
      if (import.meta.env.DEV) {
        console.info("Admin status:", (d.status as string) ?? "missing");
        console.info("Admin role:", (d.role as string) ?? "missing");
      }

      if (d.status !== "active") {
        if (import.meta.env.DEV) console.warn("[ADMIN_STATUS_INACTIVE]", d.status);
        setProfileResult("Inactive");
        await signOut(firebaseAuth);
        setError(MSG.inactive);
        return;
      }

      if (!isApprovedRole(d.role)) {
        if (import.meta.env.DEV) console.warn("[ADMIN_ROLE_INVALID]", d.role);
        setProfileResult("Invalid role");
        await signOut(firebaseAuth);
        setError(MSG.invalidRole);
        return;
      }

      // [ADMIN_PROFILE_VALID]
      if (import.meta.env.DEV) console.info("[ADMIN_PROFILE_VALID]");
      setProfileResult("Valid");

      // 8. Update lastLoginAt — BEST-EFFORT ONLY. The initial rules block client
      //    writes to admins/*, so a permission-denied here must NOT block login.
      try {
        await updateDoc(adminRef, { lastLoginAt: serverTimestamp() });
      } catch (writeErr) {
        if (import.meta.env.DEV) {
          console.warn("Admin authenticated, but lastLoginAt could not be updated.", writeErr);
        }
      }

      // 9. Navigate to the dashboard.
      toast.success("Signed in");
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (err) {
      // 10. Re-enable the form and surface an accurate message.
      const code = (err as { code?: string }).code ?? "";
      if (import.meta.env.DEV) console.error("Firebase login error code:", code);
      setAuthResult("Failed");
      setError(mapFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  // Dev-only: show the setup panel when auth succeeded but the profile is not valid.
  const showSetupPanel =
    import.meta.env.DEV &&
    authResult === "Successful" &&
    profileResult !== "Valid" &&
    profileResult !== "Not checked";

  return (
    <div className="grid min-h-screen bg-navy lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-navy opacity-90" />
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/25 blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan/20 blur-[140px]" />

        <div className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary">
            <ParkingSquare className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="text-base font-bold">SPM ECO System</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan">Admin Console</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-tight">
            Intelligent Parking{" "}
            <span className="bg-gradient-to-r from-cyan to-white bg-clip-text text-transparent">
              Administration
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/75">
            Manage website content, media, inquiries, analytics and system settings through one
            secure centralized workspace.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {["Role-based access control", "Firebase-secured accounts", "Activity is recorded"].map(
              (f) => (
                <li key={f} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan" /> {f}
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="relative text-xs text-white/45">
          © {new Date().getFullYear()} SPM ECO System — University Technology Challenge Project.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white">
              <ParkingSquare className="h-5 w-5" />
            </span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in using your authorized administrator account.
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="text-xs font-semibold text-foreground">Admin Email</label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="you@organization.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Secure Sign In
            </button>
          </form>

          {/* Dev-only admin setup diagnostics — never shown in production. */}
          {showSetupPanel && authedUid && (
            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
              <p className="mb-2 text-xs font-semibold">Admin setup required (dev only)</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <span>Firebase Authentication</span>
                <span className="font-semibold">Successful</span>
                <span>Authenticated UID</span>
                <span className="break-all font-mono">{authedUid}</span>
                <span>Required Firestore path</span>
                <span className="break-all font-mono">admins/{authedUid}</span>
                <span>Admin document</span>
                <span className="font-semibold">{profileResult}</span>
                <span>Required status</span>
                <span className="font-mono">active</span>
                <span>Required role</span>
                <span className="font-mono">super_admin</span>
              </div>
              <button
                type="button"
                onClick={copyUid}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/60 bg-amber-100/60 px-2.5 py-1.5 font-medium hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/40"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Firebase UID"}
              </button>
            </div>
          )}

          {import.meta.env.DEV && (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              <p className="mb-1 font-semibold text-foreground">Dev diagnostics</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <span>Firebase project</span>
                <span className="font-mono text-foreground">{firebaseApp.options.projectId}</span>
                <span>Firebase initialized</span>
                <span className="text-foreground">{firebaseApp ? "Yes" : "No"}</span>
                <span>Auth instance ready</span>
                <span className="text-foreground">{firebaseAuth ? "Yes" : "No"}</span>
                <span>Firestore ready</span>
                <span className="text-foreground">{firestore ? "Yes" : "No"}</span>
                <span>Authentication result</span>
                <span className="text-foreground">{authResult}</span>
                <span>Admin profile result</span>
                <span className="text-foreground">{profileResult}</span>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              Authorized administrators only. Administrative activity may be recorded.
            </p>
            <Link
              to="/"
              className="inline-block text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
