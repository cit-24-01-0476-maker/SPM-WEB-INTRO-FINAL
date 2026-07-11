// Firestore data layer for the CMS settings.
//
// Architecture (Phase: split public/protected):
//   publicSettings/{key}  — PUBLISHED values, world-readable. Shape: { value, ...meta }
//   adminDrafts/{key}     — DRAFT values, admin-only.        Shape: { value, ...meta }
//
// The settings payload is nested under `value` so it can never collide with
// metadata keys (publishedAt, updatedBy, …). The public website reads ONLY
// publicSettings/{key}.value. The admin editor reads both, writes drafts to
// adminDrafts/{key}, and on publish copies the draft into publicSettings/{key}.

import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/client";
import {
  DEFAULT_CONTACT,
  DEFAULT_DESIGN,
  DEFAULT_HERO,
  DEFAULT_NAVIGATION,
  DEFAULT_SITE,
  mergeDefaults,
} from "./model";

export type SettingsKey = "site" | "design" | "hero" | "contact" | "navigation";

export const PUBLIC_COLLECTION = "publicSettings";
export const DRAFT_COLLECTION = "adminDrafts";

/** Distinguishable outcomes for a settings read/write failure. */
export type FirestoreErrorKind = "permission" | "network" | "unknown";

/**
 * Classify a Firestore error so the UI can show an accurate state instead of a
 * single generic "Could not load settings" message. Never throws.
 */
export function classifyFirestoreError(error: unknown): FirestoreErrorKind {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  if (code.includes("permission-denied") || code.includes("unauthenticated")) return "permission";
  if (
    code.includes("unavailable") ||
    code.includes("deadline-exceeded") ||
    code.includes("network") ||
    (typeof navigator !== "undefined" && navigator.onLine === false)
  ) {
    return "network";
  }
  return "unknown";
}

export interface SettingsDocMeta {
  updatedAt: string | null;
  updatedBy: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  hasDraft: boolean;
  /** publicSettings/{key} exists — the website has been initialized for this key. */
  initialized: boolean;
}

function tsToIso(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (
    typeof v === "object" &&
    v !== null &&
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

export interface EditorDoc<T> {
  published: T;
  draft: T;
  meta: SettingsDocMeta;
}

/** Admin editor read: both the published doc and the protected draft. */
export async function readEditorDoc<T>(key: SettingsKey, defaults: T): Promise<EditorDoc<T>> {
  const [pubSnap, draftSnap] = await Promise.all([
    getDoc(doc(firestore, PUBLIC_COLLECTION, key)),
    getDoc(doc(firestore, DRAFT_COLLECTION, key)),
  ]);
  const pub = pubSnap.exists() ? (pubSnap.data() as Record<string, unknown>) : null;
  const drf = draftSnap.exists() ? (draftSnap.data() as Record<string, unknown>) : null;

  const published = mergeDefaults(defaults, pub?.value);
  // If there is no draft yet, seed the editor from the published values.
  const draft = drf ? mergeDefaults(defaults, drf.value) : published;

  return {
    published,
    draft,
    meta: {
      updatedAt: tsToIso(drf?.updatedAt ?? pub?.updatedAt),
      updatedBy: (drf?.updatedBy as string) ?? (pub?.updatedBy as string) ?? null,
      publishedAt: tsToIso(pub?.publishedAt),
      publishedBy: (pub?.publishedBy as string) ?? null,
      hasDraft: Boolean(drf),
      initialized: pubSnap.exists(),
    },
  };
}

/** Public website read: PUBLISHED values only. Falls back to defaults safely. */
export async function readPublicDoc<T>(key: SettingsKey, defaults: T): Promise<T> {
  try {
    const snap = await getDoc(doc(firestore, PUBLIC_COLLECTION, key));
    if (!snap.exists()) return defaults;
    return mergeDefaults(defaults, (snap.data() as Record<string, unknown>).value);
  } catch {
    return defaults; // offline / permission — safe fallback for public visitors
  }
}

/**
 * Real-time subscription to a PUBLISHED settings document. Fires immediately
 * with the current value and again on every change (including publishes from
 * another tab or admin). Returns an unsubscribe function. Errors fall back to
 * defaults silently — the public website must never surface Firestore errors.
 *
 * The callback also receives the stored `version` (0 when absent) so the
 * consumer can guard its last-known-good cache against stale writes.
 */
export function subscribePublicDoc<T>(
  key: SettingsKey,
  defaults: T,
  onValue: (value: T, version: number) => void,
): () => void {
  return onSnapshot(
    doc(firestore, PUBLIC_COLLECTION, key),
    (snap) => {
      if (!snap.exists()) {
        onValue(defaults, 0);
        return;
      }
      const data = snap.data() as Record<string, unknown>;
      const version = Number(data.version ?? 0) || 0;
      onValue(mergeDefaults(defaults, data.value), version);
    },
    () => {
      // permission / network / offline — keep whatever we already have
      onValue(defaults, 0);
    },
  );
}

/** Save the draft only (adminDrafts/{key}). */
export async function saveDraftDoc<T>(key: SettingsKey, draft: T, uid: string): Promise<void> {
  await setDoc(
    doc(firestore, DRAFT_COLLECTION, key),
    { value: draft, updatedAt: serverTimestamp(), updatedBy: uid },
    { merge: true },
  );
}

/**
 * Publish atomically: copy the validated draft into publicSettings/{key} with
 * an incremented `version`, and mirror it back into adminDrafts/{key} so draft
 * and published stay in sync. After the transaction, the public document is
 * read back and its version returned so the caller can verify the write landed
 * before claiming success.
 */
export async function publishDoc<T>(key: SettingsKey, draft: T, uid: string): Promise<number> {
  const publicRef = doc(firestore, PUBLIC_COLLECTION, key);
  const draftRef = doc(firestore, DRAFT_COLLECTION, key);

  const nextVersion = await runTransaction(firestore, async (tx) => {
    const pubSnap = await tx.get(publicRef);
    const current = pubSnap.exists()
      ? Number((pubSnap.data() as Record<string, unknown>).version ?? 0)
      : 0;
    const version = (Number.isFinite(current) ? current : 0) + 1;
    const now = serverTimestamp();
    tx.set(
      publicRef,
      { value: draft, version, publishedAt: now, publishedBy: uid, updatedAt: now, updatedBy: uid },
      { merge: true },
    );
    tx.set(
      draftRef,
      { value: draft, basePublishedVersion: version, updatedAt: now, updatedBy: uid },
      { merge: true },
    );
    return version;
  });

  // Read back and verify the published version actually landed.
  const verifySnap = await getDoc(publicRef);
  const storedVersion = verifySnap.exists()
    ? Number((verifySnap.data() as Record<string, unknown>).version ?? 0)
    : 0;
  if (storedVersion < nextVersion) {
    throw new Error("PUBLISH_VERIFY_FAILED");
  }
  return storedVersion;
}

/* --- migration & initialization ------------------------------------- */

const OLD_SOURCES: Record<
  SettingsKey,
  { collection: string; id: string; flat: boolean; defaults: unknown }
> = {
  site: { collection: "siteSettings", id: "global", flat: true, defaults: DEFAULT_SITE },
  design: { collection: "designSettings", id: "global", flat: false, defaults: DEFAULT_DESIGN },
  hero: { collection: "heroSettings", id: "home", flat: false, defaults: DEFAULT_HERO },
  contact: { collection: "contactSettings", id: "global", flat: false, defaults: DEFAULT_CONTACT },
  navigation: {
    collection: "navigationSettings",
    id: "global",
    flat: false,
    defaults: DEFAULT_NAVIGATION,
  },
};

const KEYS: SettingsKey[] = ["site", "design", "hero", "contact", "navigation"];

/** True when every publicSettings/{key} document already exists. */
export async function settingsInitialized(): Promise<boolean> {
  const snaps = await Promise.all(KEYS.map((k) => getDoc(doc(firestore, PUBLIC_COLLECTION, k))));
  return snaps.every((s) => s.exists());
}

/**
 * Create the eight settings documents if missing, migrating published/draft
 * values from the legacy documents where present. Never overwrites documents
 * that already exist. Requires an authenticated super_admin (enforced by rules).
 */
export async function initializeSettings(uid: string): Promise<void> {
  const now = serverTimestamp();
  const batch = writeBatch(firestore);
  let writes = 0;

  for (const key of KEYS) {
    const pubRef = doc(firestore, PUBLIC_COLLECTION, key);
    const draftRef = doc(firestore, DRAFT_COLLECTION, key);
    const [pubSnap, draftSnap] = await Promise.all([getDoc(pubRef), getDoc(draftRef)]);

    // Attempt to migrate from the legacy document (best-effort).
    const src = OLD_SOURCES[key];
    let published = src.defaults;
    let draft = src.defaults;
    try {
      const oldSnap = await getDoc(doc(firestore, src.collection, src.id));
      if (oldSnap.exists()) {
        const data = oldSnap.data() as Record<string, unknown>;
        if (src.flat) {
          published = mergeDefaults(src.defaults, data);
          draft = published;
        } else {
          published = mergeDefaults(src.defaults, data.published);
          draft = mergeDefaults(src.defaults, data.draft ?? data.published);
        }
      }
    } catch {
      /* legacy doc unreadable — fall back to defaults */
    }

    if (!pubSnap.exists()) {
      batch.set(pubRef, {
        value: published,
        createdAt: now,
        createdBy: uid,
        publishedAt: now,
        publishedBy: uid,
        updatedAt: now,
        updatedBy: uid,
        migratedAt: now,
      });
      writes++;
    }
    if (!draftSnap.exists()) {
      batch.set(draftRef, {
        value: draft,
        createdAt: now,
        createdBy: uid,
        updatedAt: now,
        updatedBy: uid,
        migratedAt: now,
      });
      writes++;
    }
  }

  if (writes > 0) await batch.commit();
}
