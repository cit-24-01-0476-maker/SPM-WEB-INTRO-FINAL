import { SignJWT, jwtVerify } from "jose";
import { getAccessToken, ensureCategoryFolder } from "./drive.server";
import { APK_CHUNK_BYTES, validateApk } from "@/lib/apk";
const MIME = "application/vnd.android.package-archive";
function sessionKey() {
  const secret = process.env.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!secret) throw new Error("Connect Google Drive before uploading an APK.");
  return new TextEncoder().encode(secret);
}
export async function startApkUpload(uid: string, name: string, size: number) {
  const invalid = validateApk({ name, size });
  if (invalid) throw new Error(invalid);
  const access = await getAccessToken();
  const folder = await ensureCategoryFolder(access, "Android-Releases");
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,size",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": MIME,
        "X-Upload-Content-Length": String(size),
      },
      body: JSON.stringify({ name, parents: [folder] }),
    },
  );
  const location = response.headers.get("location");
  if (!response.ok || !location)
    throw new Error(
      "Could not start APK upload. Check the Drive connection and available storage.",
    );
  const session = await new SignJWT({ location, size, name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(uid)
    .setAudience("spm-apk-upload")
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(sessionKey());
  return { session };
}
export async function sendApkChunk(
  uid: string,
  session: string,
  offset: number,
  bytes: ArrayBuffer,
) {
  const { payload } = await jwtVerify(session, sessionKey(), {
    algorithms: ["HS256"],
    audience: "spm-apk-upload",
    subject: uid,
  });
  const size = Number(payload.size);
  const location = new URL(String(payload.location));
  if (
    location.protocol !== "https:" ||
    location.hostname !== "www.googleapis.com" ||
    location.pathname !== "/upload/drive/v3/files"
  )
    throw new Error("Invalid upload session.");
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset % APK_CHUNK_BYTES !== 0 ||
    bytes.byteLength !== Math.min(APK_CHUNK_BYTES, size - offset)
  )
    throw new Error("Invalid APK upload chunk.");
  if (offset === 0 && new Uint8Array(bytes).slice(0, 4).join(",") !== "80,75,3,4")
    throw new Error("This file is not an APK/ZIP package.");
  const access = await getAccessToken();
  const response = await fetch(location, {
    method: "PUT",
    redirect: "error",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": MIME,
      "Content-Range": `bytes ${offset}-${offset + bytes.byteLength - 1}/${size}`,
    },
    body: bytes,
  });
  if (response.status === 308) {
    const range = response.headers.get("range");
    const received = range ? Number(range.split("-").at(-1)) + 1 : 0;
    if (received !== offset + bytes.byteLength)
      throw new Error("Upload interrupted. Choose the file again to restart.");
    return { done: false, received };
  }
  if (!response.ok) throw new Error("APK upload failed. Check the Drive connection and try again.");
  const file = (await response.json()) as { id: string; name: string };
  if (!/^[a-zA-Z0-9_-]+$/.test(file.id)) throw new Error("Invalid uploaded file.");
  const shared = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "anyone", role: "reader" }),
    },
  );
  if (!shared.ok)
    throw new Error(
      "APK uploaded, but public download could not be enabled. Check Drive sharing settings.",
    );
  return {
    done: true,
    received: size,
    url: `https://drive.google.com/uc?export=download&id=${file.id}`,
    name: file.name,
    size,
  };
}
