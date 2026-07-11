import { createFileRoute } from "@tanstack/react-router";
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE, type DriveUploadResult } from "@/lib/media/types";

// Secure server route for Google Drive uploads.
//
// The browser POSTs multipart FormData (file + category folder). This handler:
//   1. Verifies the Firebase admin ID token (x-firebase-token header).
//   2. Confirms Drive is configured; otherwise returns 503 { configured:false }.
//   3. Streams the file into the shared Drive folder server-side.
//   4. Returns Drive metadata; the client then writes Firestore mediaAssets.
//
// Credentials never leave the server. XHR on the client tracks upload progress.

export const Route = createFileRoute("/api/media/drive-upload")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await verify(request);
        if (!auth.ok) return json({ error: auth.error }, auth.status);
        const { driveMode } = await import("@/lib/media/drive.server");
        const mode = driveMode();
        return json({ configured: mode !== "none", mode });
      },
      POST: async ({ request }) => {
        const auth = await verify(request);
        if (!auth.ok) return json({ error: auth.error }, auth.status);

        const { driveMode, uploadToDrive } = await import("@/lib/media/drive.server");
        if (driveMode() === "none") {
          return json(
            {
              configured: false,
              error: "Google Drive is not configured on the server. Use URL media mode instead.",
            },
            503,
          );
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return json({ error: "Invalid multipart form data" }, 400);
        }
        const file = form.get("file");
        const categoryFolder = String(form.get("categoryFolder") ?? "Sections");
        if (!(file instanceof File)) return json({ error: "No file provided" }, 400);
        if (file.size > MAX_FILE_SIZE) return json({ error: "File exceeds 20MB" }, 413);
        const mime = file.type || "application/octet-stream";
        if (!ACCEPTED_MIME_TYPES.includes(mime) && !/\.(svg|avif|webp)$/i.test(file.name)) {
          return json({ error: `Unsupported file type: ${mime}` }, 415);
        }

        try {
          const bytes = await file.arrayBuffer();
          const result: DriveUploadResult = await uploadToDrive({
            bytes,
            fileName: file.name,
            mimeType: mime,
            categoryFolder,
          });
          return json({ configured: true, asset: result });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          console.error("Drive upload error:", message);
          return json({ error: message }, 502);
        }
      },
    },
  },
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function verify(
  request: Request,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const token = request.headers.get("x-firebase-token") ?? "";
  if (!token) return { ok: false, status: 401, error: "Missing admin token" };
  try {
    const { verifyFirebaseAdmin } = await import("@/lib/firebase/verify.server");
    await verifyFirebaseAdmin(token);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      status: 403,
      error: err instanceof Error ? err.message : "Forbidden",
    };
  }
}
