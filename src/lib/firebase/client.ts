import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Client-safe Firebase configuration for the SPM ECO System admin console.
 *
 * These are the PUBLISHABLE Firebase Web values for the `spm-eco-system`
 * project. They are safe to ship to the browser (Firebase security is enforced
 * by Firebase Auth + Firestore Security Rules, not by hiding these values).
 *
 * Privileged Firebase Admin credentials / service-account keys are NEVER used
 * here and must never be imported into client code.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAqW6-sN5dAoXYGUwHDLQHmkAfeJHr0eVY",
  authDomain: "spm-eco-system.firebaseapp.com",
  projectId: "spm-eco-system",
  storageBucket: "spm-eco-system.firebasestorage.app",
  messagingSenderId: "79819493343",
  appId: "1:79819493343:web:c2238dfa082161066bbe6a",
};

/**
 * Firebase is always configured in this build — the publishable web config is
 * embedded above. Kept as `true` for backwards compatibility with older call
 * sites; do not gate the login form on this.
 */
export const firebaseConfigured = true;

// Initialize Firebase exactly once (guards against duplicate-app errors during
// HMR / repeated module evaluation).
export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firestore: Firestore = getFirestore(firebaseApp);

// Development-only, credential-free diagnostics. Never logs secrets, tokens,
// user objects or API responses — only readiness flags and the project id.
if (import.meta.env.DEV) {
  console.info("Firebase project:", firebaseApp.options.projectId);
  console.info("Firebase Auth ready:", Boolean(firebaseAuth));
  console.info("Firestore ready:", Boolean(firestore));
}

// App Check protects Firebase resources from automated abuse. Browser-only and
// optional — only starts if a reCAPTCHA v3 site key is provided.
if (typeof window !== "undefined") {
  const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY as string | undefined;
  if (siteKey) {
    void import("firebase/app-check")
      .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true,
        });
      })
      .catch(() => {
        /* App Check is optional in development. */
      });
  }
}

/** @deprecated Use the exported `firebaseApp` directly. */
export function getFirebaseApp(): FirebaseApp {
  return firebaseApp;
}

/** @deprecated Use the exported `firebaseAuth` directly. */
export function getFirebaseAuth(): Auth {
  return firebaseAuth;
}

/** @deprecated Use the exported `firestore` directly. */
export function getDb(): Firestore {
  return firestore;
}
