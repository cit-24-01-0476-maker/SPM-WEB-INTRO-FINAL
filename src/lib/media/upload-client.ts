// Client-side uploader for Google Drive media. Uses XHR so the admin sees real
// upload progress. Reads the current Firebase ID token to authenticate against
// the secure /api/media/drive-upload server route.

import { firebaseAuth } from "@/lib/firebase/client";
import type { DriveUploadResult } from "./types";

const ENDPOINT = "/api/media/drive-upload";

export interface DriveUploadResponse {
  configured: boolean;
  asset?: DriveUploadResult;
  error?: string;
}

async function token(): Promise<string> {
  const t = await firebaseAuth.currentUser?.getIdToken();
  if (!t) throw new Error("You must be signed in as an administrator.");
  return t;
}

/** Check whether the server has Drive configured. Never throws for config. */
export async function checkDriveConfigured(): Promise<{ configured: boolean; mode: string }> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "GET",
      headers: { "x-firebase-token": await token() },
    });
    if (!res.ok) return { configured: false, mode: "none" };
    return (await res.json()) as { configured: boolean; mode: string };
  } catch {
    return { configured: false, mode: "none" };
  }
}

export async function uploadToDrive(
  file: File,
  categoryFolder: string,
  onProgress: (pct: number) => void,
): Promise<DriveUploadResponse> {
  const t = await token();
  const form = new FormData();
  form.append("file", file);
  form.append("categoryFolder", categoryFolder);

  return new Promise<DriveUploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", ENDPOINT);
    xhr.setRequestHeader("x-firebase-token", t);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body: DriveUploadResponse = { configured: false };
      try {
        body = JSON.parse(xhr.responseText) as DriveUploadResponse;
      } catch {
        /* non-JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.asset) {
        resolve(body);
      } else {
        reject(new Error(body.error ?? `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}
