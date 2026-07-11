// Centralized Firebase Realtime Database access for live visitor presence.
//
// The Realtime Database is OPTIONAL: the public website and all historical
// Firestore analytics keep working when it is not configured. Live presence is
// simply unavailable until `VITE_FIREBASE_DATABASE_URL` is set.
//
// We deliberately reuse the single initialized Firebase app from `client.ts`
// (never create a second app) and pass the database URL explicitly so the app
// does not need `databaseURL` baked into its base config.
import { getDatabase, type Database } from "firebase/database";
import { firebaseApp } from "./client";

/** The configured Realtime Database URL (empty string when not configured). */
export const realtimeDatabaseUrl = (
  (import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined) ?? ""
).trim();

/** True when a Realtime Database URL has been provided via env. */
export const realtimeConfigured = realtimeDatabaseUrl.length > 0;

let cached: Database | null = null;

/**
 * Returns the Realtime Database instance, or `null` when it is not configured
 * or fails to initialize. Callers MUST handle `null` gracefully — never crash
 * the public site and never invent fake visitors.
 */
export function getRealtimeDatabase(): Database | null {
  if (!realtimeConfigured) return null;
  if (cached) return cached;
  try {
    cached = getDatabase(firebaseApp, realtimeDatabaseUrl);
    return cached;
  } catch {
    return null;
  }
}

/** Convenience singleton (may be null). Prefer `getRealtimeDatabase()` in hooks. */
export const realtimeDatabase = getRealtimeDatabase();

/** Where live presence sessions live in the Realtime Database. */
export const PRESENCE_ROOT = "presence";

/** A visitor tab is considered "live" if seen within this window (ms). */
export const PRESENCE_ACTIVE_WINDOW_MS = 90_000;
