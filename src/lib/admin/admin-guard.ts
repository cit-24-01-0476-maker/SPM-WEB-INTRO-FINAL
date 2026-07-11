import { createMiddleware } from "@tanstack/react-start";
import type { VerifiedAdmin } from "@/lib/firebase/verify.server";

// Server-side function middleware: validates the Firebase ID token attached by
// attachFirebaseToken and confirms the caller is an active, approved admin.
// The verified admin is placed on context.admin.
export const requireFirebaseAdmin = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const token = getRequestHeader("x-firebase-token") ?? "";
    const { verifyFirebaseAdmin } = await import("@/lib/firebase/verify.server");
    const admin: VerifiedAdmin = await verifyFirebaseAdmin(token);
    return next({ context: { admin } });
  },
);
