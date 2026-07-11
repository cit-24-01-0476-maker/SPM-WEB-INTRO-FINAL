// Server-only: verify a Firebase ID token and confirm the caller is an active,
// approved administrator (admins/{uid} in Firestore). Never import from client code.
import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = "spm-eco-system";

const APPROVED_ROLES = [
  "super_admin",
  "content_editor",
  "analytics_viewer",
  "inquiry_manager",
] as const;

export type VerifiedRole = (typeof APPROVED_ROLES)[number];

export interface VerifiedAdmin {
  uid: string;
  email: string | null;
  role: VerifiedRole;
  status: string;
}

// Google's public keys for Firebase Auth ID tokens (RS256).
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwks/securetoken@system.gserviceaccount.com",
  ),
);

export async function verifyFirebaseAdmin(idToken: string): Promise<VerifiedAdmin> {
  if (!idToken) throw new Error("Unauthorized: missing admin token");

  let uid: string;
  let email: string | null;
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    uid = String(payload.sub ?? "");
    email = typeof payload.email === "string" ? payload.email : null;
  } catch {
    throw new Error("Unauthorized: invalid admin token");
  }
  if (!uid) throw new Error("Unauthorized: invalid admin token");

  // Read the caller's own admin profile via Firestore REST (rules allow this).
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${uid}`,
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
  if (!res.ok) throw new Error("Forbidden: not an administrator");

  const doc = (await res.json()) as { fields?: Record<string, { stringValue?: string }> };
  const role = doc.fields?.role?.stringValue;
  const status = doc.fields?.status?.stringValue;

  if (!role || !(APPROVED_ROLES as readonly string[]).includes(role) || status !== "active") {
    throw new Error("Forbidden: administrator profile is not active");
  }

  return { uid, email, role: role as VerifiedRole, status };
}
