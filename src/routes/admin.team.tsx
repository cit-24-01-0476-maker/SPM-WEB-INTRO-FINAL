import { createFileRoute } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import { ComingSoon } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/team")({
  component: () => (
    <ComingSoon
      title="Team"
      description="Manage the project team section for the Technology Challenge Competition."
      icon={Users2}
      points={[
        "Name, role, student ID",
        "Profile image & biography",
        "Display order",
        "Visibility toggle",
        "Private contact numbers hidden by default",
      ]}
    />
  ),
});
