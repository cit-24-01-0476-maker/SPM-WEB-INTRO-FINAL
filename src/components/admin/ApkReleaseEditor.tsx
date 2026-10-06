import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";
import { FieldCard, TextField, ToggleField } from "./editor";
import { firebaseAuth } from "@/lib/firebase/client";
import { APK_CHUNK_BYTES, apkUrl, validateApk, resolveApkRelease } from "@/lib/apk";
import type { SiteSettings } from "@/lib/cms/model";
import { formatBytes } from "@/lib/media/types";
export function ApkReleaseEditor({
  value: storedValue,
  onChange: update,
  canUpload,
  disabled,
  onBusyChange,
}: {
  value: SiteSettings;
  onChange: (patch: Partial<SiteSettings>) => void;
  canUpload: boolean;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const value = resolveApkRelease(storedValue);
  const onChange = (patch: Partial<SiteSettings>) => update({
    apkUrl: value.apkUrl,
    apkVersion: value.apkVersion,
    apkFileName: value.apkFileName,
    apkFileSize: value.apkFileSize,
    apkDownloadEnabled: value.apkDownloadEnabled,
    ...patch,
    apkReleaseManaged: true,
  });
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch("/api/app-upload", { headers: { "x-firebase-token": token } });
        if (!res.ok) return;
        const body = await res.json();
        if (active) setConfigured(body.configured === true);
      } catch {
        /* Keep the upload attempt available when the status check is unavailable. */
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  async function upload(file: File) {
    const invalid = validateApk(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setUploading(true);
    onBusyChange(true);
    setProgress(0);
    try {
      const headers = async () => ({
        "x-firebase-token": await firebaseAuth.currentUser!.getIdToken(),
      });
      const started = await fetch("/api/app-upload", {
        method: "POST",
        headers: { ...(await headers()), "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size }),
      });
      const start = await started.json();
      if (!started.ok) throw new Error(start.error);
      for (let offset = 0; offset < file.size; offset += APK_CHUNK_BYTES) {
        const response = await fetch("/api/app-upload", {
          method: "PUT",
          headers: {
            ...(await headers()),
            "Content-Type": "application/octet-stream",
            "x-upload-session": start.session,
            "x-upload-offset": String(offset),
          },
          body: file.slice(offset, offset + APK_CHUNK_BYTES),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setProgress(Math.round((result.received / file.size) * 100));
        if (result.done) {
          onChange({
            apkUrl: result.url,
            apkFileName: result.name,
            apkFileSize: result.size,
            apkDownloadEnabled: false,
          });
          toast.success(
            "APK uploaded to your draft. Set the version, enable downloads, then Publish.",
          );
          return;
        }
      }
      throw new Error("Upload did not finish. Choose the APK again.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "APK upload failed.");
    } finally {
      setUploading(false);
      onBusyChange(false);
      if (input.current) input.current.value = "";
    }
  }
  const locked = disabled || uploading;
  return (
    <FieldCard title="Android app / APK release">
      <p className="text-sm text-muted-foreground">
        Leave this blank until your APK is ready. Upload a release, set its version, enable
        downloads and Publish to show it on the website. Replacing a file leaves downloads off in
        the draft until you enable them.
      </p>
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm">
          {value.apkFileName || "No APK uploaded yet"}
          {value.apkFileSize > 0 ? ` · ${formatBytes(value.apkFileSize)}` : ""}
        </p>
        <input
          ref={input}
          type="file"
          accept=".apk,application/vnd.android.package-archive"
          className="sr-only"
          aria-label="Select Android APK"
          disabled={locked || !canUpload || configured === false}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          disabled={locked || !canUpload || configured === false}
          onClick={() => input.current?.click()}
        >
          {uploading ? <Loader2 size={17} className="animate-spin" /> : <UploadCloud size={17} />}{" "}
          {uploading ? `Uploading ${progress}%` : "Upload APK file"}
        </button>
        {uploading && (
          <progress
            className="block w-full"
            max={100}
            value={progress}
            aria-label="APK upload progress"
          />
        )}
        <p className="text-xs text-muted-foreground">
          Android .apk only · maximum 200 MB. Only super administrators can upload.
        </p>
        {configured === false && (
          <p className="text-sm text-amber-700">
            File uploads need the Google Drive connection configured on the server. You can use a
            public HTTPS APK download link below in the meantime.
          </p>
        )}
      </div>
      <fieldset disabled={locked} className="space-y-4">
        <TextField
          label="APK download URL"
          value={value.apkUrl || ""}
          onChange={(url) =>
            onChange({ apkUrl: url, apkFileName: "", apkFileSize: 0, apkDownloadEnabled: false })
          }
          hint="Filled automatically after upload, or paste a public HTTPS download link."
        />
        <TextField
          label="App version"
          value={value.apkVersion || ""}
          onChange={(apkVersion) => onChange({ apkVersion })}
          hint="For example: 1.0.0. Leave blank until confirmed."
        />
        <ToggleField
          label="Enable public APK downloads"
          description="Visitors see Coming soon while this is off or no valid HTTPS download URL is set."
          checked={!!value.apkDownloadEnabled}
          onChange={(enabled) => {
            if (enabled && !apkUrl(value.apkUrl || "")) {
              toast.error("Upload an APK or enter a valid HTTPS download URL first.");
              return;
            }
            onChange({ apkDownloadEnabled: enabled });
          }}
        />
      </fieldset>
    </FieldCard>
  );
}
