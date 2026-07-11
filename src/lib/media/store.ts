// Firestore data layer for the Media Library (mediaAssets collection).
//
// Metadata is stored client-side by the authenticated admin. Firestore rules
// (mediaAssets) allow create/update for super_admin + content_editor, delete
// for super_admin, and world-read for the public website.
//
// Google Drive BINARY uploads go through the secure server route
// (/api/media/drive-upload); only the returned metadata is written here.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/client";
import {
  extensionOf,
  type MediaAsset,
  type MediaCategory,
  type MediaStatus,
  type MediaSourceType,
} from "./types";

export const MEDIA_COLLECTION = "mediaAssets";

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

function fromDoc(id: string, d: Record<string, unknown>): MediaAsset {
  return {
    id,
    driveFileId: (d.driveFileId as string) ?? null,
    driveFolderId: (d.driveFolderId as string) ?? null,
    sourceType: (d.sourceType as MediaSourceType) ?? "external_url",
    fileName: (d.fileName as string) ?? "",
    originalFileName: (d.originalFileName as string) ?? (d.fileName as string) ?? "",
    extension: (d.extension as string) ?? "",
    mimeType: (d.mimeType as string) ?? "",
    fileSize: (d.fileSize as number) ?? 0,
    width: (d.width as number) ?? null,
    height: (d.height as number) ?? null,
    duration: (d.duration as number) ?? null,
    category: (d.category as MediaCategory) ?? "sections",
    title: (d.title as string) ?? "",
    altText: (d.altText as string) ?? "",
    caption: (d.caption as string) ?? "",
    status: (d.status as MediaStatus) ?? "active",
    thumbnailUrl: (d.thumbnailUrl as string) ?? "",
    previewUrl: (d.previewUrl as string) ?? "",
    publicUrl: (d.publicUrl as string) ?? "",
    uploadedBy: (d.uploadedBy as string) ?? null,
    uploadedAt: tsToIso(d.uploadedAt),
    updatedBy: (d.updatedBy as string) ?? null,
    updatedAt: tsToIso(d.updatedAt),
    usageCount: (d.usageCount as number) ?? 0,
    usedInPages: (d.usedInPages as string[]) ?? [],
    usedInSections: (d.usedInSections as string[]) ?? [],
    version: (d.version as number) ?? 1,
  };
}

export async function listMedia(): Promise<MediaAsset[]> {
  const q = query(collection(firestore, MEDIA_COLLECTION), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((s) => fromDoc(s.id, s.data() as Record<string, unknown>));
}

export interface CreateMediaInput {
  sourceType: MediaSourceType;
  driveFileId?: string | null;
  driveFolderId?: string | null;
  fileName: string;
  originalFileName?: string;
  mimeType: string;
  fileSize?: number;
  category: MediaCategory;
  title: string;
  altText?: string;
  caption?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  publicUrl: string;
}

export async function createMedia(input: CreateMediaInput, uid: string): Promise<string> {
  const now = serverTimestamp();
  const ext = extensionOf(input.fileName || input.publicUrl);
  const ref = await addDoc(collection(firestore, MEDIA_COLLECTION), {
    sourceType: input.sourceType,
    driveFileId: input.driveFileId ?? null,
    driveFolderId: input.driveFolderId ?? null,
    fileName: input.fileName,
    originalFileName: input.originalFileName ?? input.fileName,
    extension: ext,
    mimeType: input.mimeType,
    fileSize: input.fileSize ?? 0,
    width: null,
    height: null,
    duration: null,
    category: input.category,
    title: input.title || input.fileName,
    altText: input.altText ?? "",
    caption: input.caption ?? "",
    status: "active",
    thumbnailUrl: input.thumbnailUrl ?? input.previewUrl ?? input.publicUrl,
    previewUrl: input.previewUrl ?? input.publicUrl,
    publicUrl: input.publicUrl,
    uploadedBy: uid,
    uploadedAt: now,
    updatedBy: uid,
    updatedAt: now,
    usageCount: 0,
    usedInPages: [],
    usedInSections: [],
    version: 1,
  });
  return ref.id;
}

export type MediaMetaPatch = Partial<
  Pick<MediaAsset, "title" | "altText" | "caption" | "category" | "fileName">
>;

export async function updateMediaMeta(
  id: string,
  patch: MediaMetaPatch,
  uid: string,
): Promise<void> {
  await updateDoc(doc(firestore, MEDIA_COLLECTION, id), {
    ...patch,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
  });
}

export async function setMediaStatus(id: string, status: MediaStatus, uid: string): Promise<void> {
  await updateDoc(doc(firestore, MEDIA_COLLECTION, id), {
    status,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
  });
}

/** Hard-delete the Firestore metadata (super_admin only per rules). */
export async function deleteMedia(id: string): Promise<void> {
  await deleteDoc(doc(firestore, MEDIA_COLLECTION, id));
}
