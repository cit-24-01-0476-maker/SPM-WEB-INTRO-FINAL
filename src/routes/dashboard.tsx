import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Dashboard } from "@/components/site/Dashboard";
import { OperatorOverview } from "@/components/site/ReportSections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin & Operator Web | SPM ECO Sri Lanka" },
      {
        name: "description",
        content:
          "Understand SPM web administration, facility maps, bookings, tariff approval, safe AI reports and the separate interactive provider demonstration.",
      },
      { property: "og:title", content: "Provider Dashboard Demo | SPM ECO" },
      {
        property: "og:description",
        content:
          "Shared demo bookings, occupancy, completed revenue and commission in one provider dashboard.",
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
      <Dashboard />
    </div>
  );
}
