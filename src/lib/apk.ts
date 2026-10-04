export const APK_MAX_BYTES = 200 * 1024 * 1024;
export const APK_CHUNK_BYTES = 1024 * 1024;
export function apkUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}
export function validateApk(file: { name: string; size: number }): string | null {
  if (!/\.apk$/i.test(file.name)) return "Choose an Android .apk file.";
  if (!Number.isSafeInteger(file.size) || file.size < 4) return "The APK file is empty or invalid.";
  if (file.size > APK_MAX_BYTES) return "APK files must be 200 MB or smaller.";
  return null;
}
