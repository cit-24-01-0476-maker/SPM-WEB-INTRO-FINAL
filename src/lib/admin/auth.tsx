import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase/client";
import { useQueryClient } from "@tanstack/react-query";

export type AppRole = "super_admin" | "content_editor" | "analytics_viewer" | "inquiry_manager";

export type AdminStatus = "active" | "disabled" | "suspended";

const APPROVED_ROLES: AppRole[] = [
  "super_admin",
  "content_editor",
  "analytics_viewer",
  "inquiry_manager",
];

export function isApprovedRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APPROVED_ROLES as string[]).includes(value);
}

export interface AdminProfile {
  uid: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  status: AdminStatus;
  avatar_url: string | null;
  last_login_at: string | null;
}

interface AdminAuthValue {
  user: User | null;
  profile: AdminProfile | null;
  role: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  /** True only when signed in AND holding an active, approved admin profile. */
  authorized: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function toStringOrNull(v: unknown): string | null {
  if (typeof v === "string") return v;
  // Firestore Timestamp -> ISO string
  if (
    v &&
    typeof v === "object" &&
    "toDate" in v &&
    typeof (v as { toDate: unknown }).toDate === "function"
  ) {
    try {
      return (v as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const evaluate = useCallback(async (u: User): Promise<boolean> => {
    // Authorization for this phase comes from the Firestore admins/{uid} doc,
    // read by the EXACT authenticated UID.
    let snap;
    try {
      snap = await getDoc(doc(firestore, "admins", u.uid));
    } catch (err) {
      // permission-denied (or any read failure) — treat as unauthorized.
      if (import.meta.env.DEV) {
        console.warn("[ADMIN_DOCUMENT_PERMISSION_DENIED] admins/" + u.uid, err);
      }
      return false;
    }
    if (import.meta.env.DEV) {
      console.info("Authenticated UID:", u.uid);
      console.info("Admin document path:", `admins/${u.uid}`);
      console.info("Admin document exists:", snap.exists());
    }
    if (!snap.exists()) return false;
    const d = snap.data() as Record<string, unknown>;
    const role = d.role;
    const status = d.status;
    if (!isApprovedRole(role) || status !== "active") return false;

    if (firebaseAuth.currentUser?.uid !== u.uid) return false;
    setProfile({
      uid: u.uid,
      full_name: (d.displayName as string) ?? u.displayName ?? null,
      email: (d.email as string) ?? u.email ?? null,
      role,
      status: status as AdminStatus,
      avatar_url: (d.profileImage as string) ?? (d.avatar_url as string) ?? null,
      last_login_at: toStringOrNull(d.lastLoginAt),
    });
    return true;
  }, []);

  useEffect(() => {
    const auth = firebaseAuth;
    const unsub = onAuthStateChanged(auth, async (u) => {
      queryClient.clear();
      setLoading(true);
      setProfile(null);
      setAuthorized(false);
      setUser(u);
      if (!u) {
        setProfile(null);
        setAuthorized(false);
        setLoading(false);
        return;
      }
      try {
        const ok = await evaluate(u);
        if (auth.currentUser?.uid !== u.uid) return;
        if (!ok) {
          // Signed-in Firebase user without a valid admin profile — sign out.
          setProfile(null);
          setAuthorized(false);
          await firebaseSignOut(auth);
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Admin profile check failed:", err);
        setProfile(null);
        setAuthorized(false);
      } finally {
        if (auth.currentUser?.uid === u.uid) setLoading(false);
      }
    });
    return () => unsub();
  }, [evaluate, queryClient]);

  const role = profile?.role ?? null;

  const value: AdminAuthValue = {
    user,
    profile,
    role,
    roles: role ? [role] : [],
    loading,
    authorized,
    isSuperAdmin: role === "super_admin",
    isAdmin: role !== null,
    hasRole: (r) => role === r,
    hasAnyRole: (list) => (role ? list.includes(role) : false),
    refresh: async () => {
      if (user) {
        try {
          const ok = await evaluate(user);
          setAuthorized(ok);
          if (!ok) {
            setProfile(null);
            await firebaseSignOut(firebaseAuth);
          }
        } catch {
          setProfile(null);
          setAuthorized(false);
        }
      }
    },
    signOut: async () => {
      queryClient.clear();
      try {
        await firebaseSignOut(firebaseAuth);
      } catch {
        /* ignore */
      }
      setUser(null);
      setProfile(null);
      setAuthorized(false);
    },
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
