import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAdmin } from "@/lib/admin/admin-guard";
import type { DriveStatus } from "@/lib/media/types";

// Reports whether Google Drive upload is configured on the server. Never
// exposes any credential values — only a boolean + mode. Admin-gated.
export const getDriveStatus = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAdmin])
  .handler(async (): Promise<DriveStatus> => {
    const { driveMode } = await import("@/lib/media/drive.server");
    const mode = driveMode();
    if (mode === "none") {
      return {
        configured: false,
        mode: "none",
        detail:
          "Google Drive credentials are not set on the server. URL media mode is fully available.",
      };
    }
    return {
      configured: true,
      mode,
      detail:
        mode === "service_account"
          ? "Connected via Google service account."
          : "Connected via Google OAuth refresh token.",
    };
  });
