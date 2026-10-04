import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Dashboard } from "@/components/site/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Provider Dashboard Demo | SPM ECO" },
      {
        name: "description",
        content:
          "Explore the SPM ECO provider dashboard demo: shared availability, bookings, parking sessions, revenue and configurable platform commission.",
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
      <Dashboard />
    </div>
  );
}
