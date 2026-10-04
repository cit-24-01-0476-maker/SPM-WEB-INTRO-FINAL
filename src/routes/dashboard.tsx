import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { OperatorOverview } from "@/components/site/ReportSections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin & Operator Web | SPM ECO Sri Lanka" },
      {
        name: "description",
        content:
          "Understand SPM web administration, facility maps, bookings, tariff approval, safe AI reports and backend-backed operational reporting.",
      },
      { property: "og:title", content: "Admin & Operator Web | SPM ECO" },
      {
        property: "og:description",
        content:
          "Explore facility management, navigation maps, tariff approval and operational reporting.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  useScrollReveal();
  return (
    <div className="pt-20">
      <OperatorOverview />
    </div>
  );
}
