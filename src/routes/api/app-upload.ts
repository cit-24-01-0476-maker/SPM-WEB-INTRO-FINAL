import { createFileRoute } from "@tanstack/react-router";
import { APK_CHUNK_BYTES } from "@/lib/apk";
function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
async function admin(request: Request) {
  const { verifyFirebaseAdmin } = await import("@/lib/firebase/verify.server");
  const user = await verifyFirebaseAdmin(request.headers.get("x-firebase-token") || "");
  if (user.role !== "super_admin")
    throw new Error("Only a super administrator can upload an app release.");
  return user;
}
export const Route = createFileRoute("/api/app-upload")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await admin(request);
        } catch {
          return json({ error: "Administrator access required." }, 403);
        }
        const { driveMode } = await import("@/lib/media/drive.server");
        return json({ configured: driveMode() !== "none" });
      },
      POST: async ({ request }) => {
        let user;
        try {
          user = await admin(request);
        } catch {
          return json({ error: "Administrator access required." }, 403);
        }
        try {
          const { startApkUpload } = await import("@/lib/media/apk-upload.server");
          const input = await request.json();
          return json(await startApkUpload(user.uid, String(input.name || ""), Number(input.size)));
        } catch {
          return json(
            { error: "Could not start APK upload. Check the file and Google Drive configuration." },
            400,
          );
        }
      },
      PUT: async ({ request }) => {
        let user;
        try {
          user = await admin(request);
        } catch {
          return json({ error: "Administrator access required." }, 403);
        }
        if (Number(request.headers.get("content-length")) > APK_CHUNK_BYTES)
          return json({ error: "Upload chunk too large." }, 413);
        try {
          const bytes = await request.arrayBuffer();
          if (!bytes.byteLength || bytes.byteLength > APK_CHUNK_BYTES)
            return json({ error: "Invalid upload chunk." }, 413);
          const { sendApkChunk } = await import("@/lib/media/apk-upload.server");
          return json(
            await sendApkChunk(
              user.uid,
              request.headers.get("x-upload-session") || "",
              Number(request.headers.get("x-upload-offset")),
              bytes,
            ),
          );
        } catch {
          return json(
            { error: "Upload failed or expired. Check your connection and choose the APK again." },
            400,
          );
        }
      },
    },
  },
});
