import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { ComingSoon } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/faq")({
  component: () => (
    <ComingSoon
      title="FAQ"
      description="Manage frequently asked questions and answers."
      icon={HelpCircle}
      points={["Add / edit questions", "Reorder & categorize", "Hide questions", "Publish or draft"]}
    />
  ),
});
