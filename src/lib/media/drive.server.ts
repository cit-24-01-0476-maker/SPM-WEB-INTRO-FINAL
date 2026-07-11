// Server-only Google Drive integration for the Media Library.
//
// Uploads binary media into the shared Drive folder using a service account
// (JWT bearer flow). Worker/Vercel-compatible: no googleapis SDK, no native
// modules — just fetch + jose for RS256 signing.
//
// NEVER import this from client code. Credentials come from server-only env
// vars (no VITE_ prefix).

import { importPKCS8, SignJWT } from "jose";
import type { DriveUploadResult } from "./types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const ROOT_FOLDER_NAME = "SPM-ECO-Media";

export type DriveMode = "service_account" | "oauth" | "none";

export function driveMode(): DriveMode {
  const env = process.env;
  if (
    env.GOOGLE_DRIVE_FOLDER_ID &&
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  ) {
    return "service_account";
  }
  if (
    env.GOOGLE_DRIVE_FOLDER_ID &&
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_REFRESH_TOKEN
  ) {
    return "oauth";
  }
  return "none";
}

function normalizeKey(raw: string): string {
  // Env stores newlines as literal \n; restore them for PEM parsing.
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

async function getAccessToken(): Promise<string> {
  const mode = driveMode();
  if (mode === "oauth") {
    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    });
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(`Drive OAuth token failed [${res.status}]: ${await res.text()}`);
    return ((await res.json()) as { access_token: string }).access_token;
  }

  // service_account
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = await importPKCS8(
    normalizeKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!),
    "RS256",
  );
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/drive" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(email)
    .setSubject(email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Drive service-account token failed [${res.status}]: ${await res.text()}`);
  }
  return ((await res.json()) as { access_token: string }).access_token;
}

async function findOrCreateFolder(token: string, name: string, parentId: string): Promise<string> {
  const escaped = name.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `name='${escaped}' and mimeType='${FOLDER_MIME}' and '${parentId}' in parents and trashed=false`,
  );
  const listRes = await fetch(
    `${DRIVE_API}/files?q=${q}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!listRes.ok) throw new Error(`Drive folder lookup failed [${listRes.status}]`);
  const found = (await listRes.json()) as { files?: { id: string }[] };
  if (found.files && found.files.length > 0) return found.files[0].id;

  const createRes = await fetch(`${DRIVE_API}/files?supportsAllDrives=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  });
  if (!createRes.ok) {
    throw new Error(`Drive folder create failed [${createRes.status}]: ${await createRes.text()}`);
  }
  return ((await createRes.json()) as { id: string }).id;
}

/** Ensure SPM-ECO-Media/<categoryFolder> exists; return the category folder id. */
async function ensureCategoryFolder(token: string, categoryFolder: string): Promise<string> {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const mediaRoot = await findOrCreateFolder(token, ROOT_FOLDER_NAME, rootId);
  return findOrCreateFolder(token, categoryFolder, mediaRoot);
}

function publicUrlsFor(fileId: string, mimeType: string) {
  const isImage = mimeType.startsWith("image/");
  return {
    publicUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
    previewUrl: isImage
      ? `https://drive.google.com/uc?export=view&id=${fileId}`
      : `https://drive.google.com/file/d/${fileId}/preview`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`,
  };
}

export interface DriveUploadInput {
  bytes: ArrayBuffer;
  fileName: string;
  mimeType: string;
  categoryFolder: string;
}

export async function uploadToDrive(input: DriveUploadInput): Promise<DriveUploadResult> {
  const token = await getAccessToken();
  const folderId = await ensureCategoryFolder(token, input.categoryFolder);

  const metadata = {
    name: input.fileName,
    parents: [folderId],
  };
  const boundary = `spm${Math.random().toString(36).slice(2)}`;
  const enc = new TextEncoder();
  const pre = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata,
    )}\r\n--${boundary}\r\nContent-Type: ${input.mimeType}\r\n\r\n`,
  );
  const post = enc.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(pre.byteLength + input.bytes.byteLength + post.byteLength);
  body.set(pre, 0);
  body.set(new Uint8Array(input.bytes), pre.byteLength);
  body.set(post, pre.byteLength + input.bytes.byteLength);

  const uploadRes = await fetch(
    `${DRIVE_UPLOAD}?uploadType=multipart&supportsAllDrives=true&fields=id,name,size,mimeType`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  if (!uploadRes.ok) {
    throw new Error(`Drive upload failed [${uploadRes.status}]: ${await uploadRes.text()}`);
  }
  const file = (await uploadRes.json()) as {
    id: string;
    name: string;
    size?: string;
    mimeType: string;
  };

  // Make the file readable by anyone with the link so the public site can load it.
  const permRes = await fetch(`${DRIVE_API}/files/${file.id}/permissions?supportsAllDrives=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
  // A permission failure is non-fatal (file still uploaded); log server-side only.
  if (!permRes.ok) {
    console.error(`Drive permission set failed [${permRes.status}]: ${await permRes.text()}`);
  }

  const urls = publicUrlsFor(file.id, file.mimeType);
  return {
    driveFileId: file.id,
    driveFolderId: folderId,
    fileName: file.name,
    mimeType: file.mimeType,
    fileSize: file.size ? Number(file.size) : input.bytes.byteLength,
    ...urls,
  };
}
