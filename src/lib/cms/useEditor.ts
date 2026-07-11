// Admin editor hook — manages the draft/published lifecycle for a settings
// key (site, design, hero, contact) with dirty tracking and an explicit
// "not initialized" state.

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin/auth";
import { broadcastPublish } from "./broadcast";
import {
  classifyFirestoreError,
  initializeSettings,
  publishDoc,
  readEditorDoc,
  saveDraftDoc,
  type FirestoreErrorKind,
  type SettingsDocMeta,
  type SettingsKey,
} from "./store";

export interface EditorState<T> {
  loading: boolean;
  saving: boolean;
  publishing: boolean;
  initializing: boolean;
  draft: T;
  published: T;
  meta: SettingsDocMeta | null;
  dirty: boolean;
  /** publicSettings/{key} exists. When false, show the initialize gate. */
  initialized: boolean;
  /** Non-null when the last load hit a genuine error (not a missing document). */
  loadError: FirestoreErrorKind | null;
  setDraft: (updater: (prev: T) => T) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  initialize: () => Promise<void>;
  resetToPublished: () => void;
  resetToDefault: () => void;
  reload: () => Promise<void>;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function equal<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useSettingsEditor<T>(key: SettingsKey, defaults: T): EditorState<T> {
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [draft, setDraftState] = useState<T>(() => clone(defaults));
  const [savedDraft, setSavedDraft] = useState<T>(() => clone(defaults));
  const [published, setPublished] = useState<T>(() => clone(defaults));
  const [meta, setMeta] = useState<SettingsDocMeta | null>(null);
  const [initialized, setInitialized] = useState(true);
  const [loadError, setLoadError] = useState<FirestoreErrorKind | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await readEditorDoc(key, defaults);
      setDraftState(res.draft);
      setSavedDraft(clone(res.draft));
      setPublished(res.published);
      setMeta(res.meta);
      setInitialized(res.meta.initialized);
      setLoadError(null);
    } catch (error) {
      // A missing document is NOT an error — readEditorDoc returns defaults and
      // initialized=false for that. Reaching here means a real failure.
      const kind = classifyFirestoreError(error);
      setLoadError(kind);
      if (kind === "permission") {
        toast.error(
          "Firestore blocked access to the requested settings. Publish the updated security rules and confirm that your admin account is active.",
        );
      } else if (kind === "network") {
        toast.error("Unable to connect to Firestore. Your unsaved changes remain in this browser.");
      } else {
        toast.error("Could not load settings. Showing defaults.");
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setDraft = useCallback((updater: (prev: T) => T) => {
    setDraftState((prev) => updater(prev));
  }, []);

  const saveDraft = useCallback(async () => {
    if (!user) {
      toast.error("You must be signed in.");
      return;
    }
    setSaving(true);
    try {
      await saveDraftDoc(key, draft, user.uid);
      setSavedDraft(clone(draft));
      toast.success("Draft saved");
    } catch (error) {
      const kind = classifyFirestoreError(error);
      toast.error(
        kind === "permission"
          ? "You do not have permission to save this draft."
          : "Could not save draft. Your changes remain in this browser.",
      );
    } finally {
      setSaving(false);
    }
  }, [key, draft, user]);

  const publish = useCallback(async () => {
    if (!user) {
      toast.error("You must be signed in.");
      return;
    }
    setPublishing(true);
    try {
      const version = await publishDoc(key, draft, user.uid);
      setSavedDraft(clone(draft));
      setPublished(clone(draft));
      // Notify any open public/admin tabs so they refresh without a reload.
      broadcastPublish(key, version);
      toast.success(`Version ${version} published and synchronized with the public website`);
      await reload();
    } catch (error) {
      const kind = classifyFirestoreError(error);
      toast.error(
        kind === "permission"
          ? "Publishing requires super admin permission."
          : "Could not publish. Please retry.",
      );
    } finally {
      setPublishing(false);
    }
  }, [key, draft, user, reload]);

  const initialize = useCallback(async () => {
    if (!user) {
      toast.error("You must be signed in.");
      return;
    }
    setInitializing(true);
    try {
      await initializeSettings(user.uid);
      toast.success("Website settings initialized");
      await reload();
    } catch (error) {
      const kind = classifyFirestoreError(error);
      toast.error(
        kind === "permission"
          ? "Only a super admin can initialize website settings."
          : "Could not initialize settings. Please retry.",
      );
    } finally {
      setInitializing(false);
    }
  }, [user, reload]);

  const resetToPublished = useCallback(() => {
    setDraftState(clone(published));
    toast.message("Restored published values");
  }, [published]);

  const resetToDefault = useCallback(() => {
    setDraftState(clone(defaults));
    toast.message("Reset to default values");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    saving,
    publishing,
    initializing,
    draft,
    published,
    meta,
    dirty: !equal(draft, savedDraft),
    initialized,
    loadError,
    setDraft,
    saveDraft,
    publish,
    initialize,
    resetToPublished,
    resetToDefault,
    reload,
  };
}
