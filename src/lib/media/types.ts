// Media Library shared types + category taxonomy.
// Used by both the client (Firestore reads/writes, UI) and the server (Drive
// upload metadata). Keep this module client-safe — no server-only imports.

export type MediaSourceType = "google_drive" | "external_url";

export type MediaStatus = "uploading" | "processing" | "active" | "archived" | "failed" | "deleted";

export type MediaCategory =
  | "hero"
  | "backgrounds"
  | "sections"
  | "features"
  | "anpr"
  | "mobile_app"
  | "dashboard"
  | "retail_parking"
  | "technology"
  | "team"
  | "contact"
  | "documents"
  | "archive";

export interface MediaCategoryDef {
  id: MediaCategory;
  label: string;
  /** Google Drive subfolder name inside SPM-ECO-Media/. */
  folder: string;
}

export const MEDIA_CATEGORIES: MediaCategoryDef[] = [
  { id: "hero", label: "Hero", folder: "Hero" },
  { id: "backgrounds", label: "Backgrounds", folder: "Backgrounds" },
  { id: "sections", label: "Sections", folder: "Sections" },
  { id: "features", label: "Features", folder: "Features" },
  { id: "anpr", label: "ANPR", folder: "ANPR" },
  { id: "mobile_app", label: "Mobile App", folder: "Mobile-App" },
  { id: "dashboard", label: "Dashboard", folder: "Dashboard" },
  { id: "retail_parking", label: "Retail Parking", folder: "Retail-Parking" },
  { id: "technology", label: "Technology", folder: "Technology" },
  { id: "team", label: "Team", folder: "Team" },
  { id: "contact", label: "Contact", folder: "Contact" },
  { id: "documents", label: "Documents", folder: "Documents" },
  { id: "archive", label: "Archive", folder: "Archive" },
];

export function categoryLabel(id: string): string {
  return MEDIA_CATEGORIES.find((c) => c.id === id)?.label ?? "Uncategorized";
}

export function categoryFolder(id: string): string {
  return MEDIA_CATEGORIES.find((c) => c.id === id)?.folder ?? "Sections";
}

export interface MediaAsset {
  id: string;
  driveFileId: string | null;
  driveFolderId: string | null;
  sourceType: MediaSourceType;
  fileName: string;
  originalFileName: string;
  extension: string;
  mimeType: string;
  fileSize: number; // bytes; 0 when unknown (external URL)
  width: number | null;
  height: number | null;
  duration: number | null;
  category: MediaCategory;
  title: string;
  altText: string;
  caption: string;
  status: MediaStatus;
  thumbnailUrl: string;
  previewUrl: string;
  publicUrl: string;
  uploadedBy: string | null;
  uploadedAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  usageCount: number;
  usedInPages: string[];
  usedInSections: string[];
  version: number;
}

/** The subset returned by the Drive upload endpoint. */
export interface DriveUploadResult {
  driveFileId: string;
  driveFolderId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  publicUrl: string;
  thumbnailUrl: string;
  previewUrl: string;
}

export interface DriveStatus {
  configured: boolean;
  mode: "service_account" | "oauth" | "none";
  /** Human-readable reason when not configured. */
  detail: string;
}

const IMAGE_MIME = /^image\//;
const VIDEO_MIME = /^video\//;

export function isImage(a: Pick<MediaAsset, "mimeType">): boolean {
  return IMAGE_MIME.test(a.mimeType);
}

export function isVideo(a: Pick<MediaAsset, "mimeType">): boolean {
  return VIDEO_MIME.test(a.mimeType);
}

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function validateFile(file: { type: string; size: number; name: string }): string | null {
  const type = file.type || "application/octet-stream";
  const okType =
    ACCEPTED_MIME_TYPES.includes(type) ||
    // Some browsers report empty type for SVG/AVIF — fall back to extension.
    ["svg", "avif", "webp", "gif", "mp4", "webm", "mov", "pdf", "jpg", "jpeg", "png"].includes(
      extensionOf(file.name),
    );
  if (!okType) return `Unsupported file type: ${type || extensionOf(file.name) || "unknown"}`;
  if (file.size > MAX_FILE_SIZE) return `File is larger than 20MB (${formatBytes(file.size)})`;
  return null;
}
