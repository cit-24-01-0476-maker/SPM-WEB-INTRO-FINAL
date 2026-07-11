import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Dashboard } from "@/components/site/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Operator Dashboard | SPM ECO System" },
      {
        name: "description",
        content:
          "The SPM ECO System operator dashboard: live occupancy, multi-branch monitoring, bookings, payments, security alerts, retail overstay, and revenue analytics in one place.",
      },
      { property: "og:title", content: "Operator Dashboard | SPM ECO System" },
      {
        property: "og:description",
        content:
          "Live occupancy, multi-branch monitoring, payments, security alerts, and revenue analytics in one operator dashboard.",
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
