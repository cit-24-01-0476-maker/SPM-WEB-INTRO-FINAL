import { createFileRoute } from "@tanstack/react-router";
import { DatabaseBackup } from "lucide-react";
import { ComingSoon } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/backup")({
  component: () => (
    <ComingSoon
      title="Backup & Restore"
      description="Create and restore backups of website content and media with strong confirmation."
      icon={DatabaseBackup}
      points={[
        "Manual & scheduled backups",
        "Media backup",
        "Download backup",
        "Restore with confirmation",
        "Backup history & status",
      ]}
    />
  ),
});
