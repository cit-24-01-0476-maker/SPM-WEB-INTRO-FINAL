import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { ComingSoon } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/integrations")({
  component: () => (
    <ComingSoon
      title="Integrations"
      description="Connect email, analytics and other services. Secrets stay server-side, never in frontend code."
      icon={Plug}
      points={["Email notifications", "External analytics", "Webhooks", "Custom scripts"]}
    />
  ),
});
