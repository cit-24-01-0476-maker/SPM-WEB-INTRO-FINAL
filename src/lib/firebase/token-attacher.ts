import { createMiddleware } from "@tanstack/react-start";

// Client-side function middleware: attaches the current Firebase ID token to
// every server-function RPC so the server can verify the admin. Harmless for
// calls made when no admin is signed in (no header is added).
export const attachFirebaseToken = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token = "";
    if (typeof window !== "undefined") {
      try {
        const { firebaseAuth } = await import("@/lib/firebase/client");
        token = (await firebaseAuth.currentUser?.getIdToken()) ?? "";
      } catch {
        /* not signed in */
      }
    }
    return next({ headers: token ? { "x-firebase-token": token } : {} });
  },
);
