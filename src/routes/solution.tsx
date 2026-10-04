import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  EcosystemOverview,
  ReportWorkflow,
  ReportSecurity,
} from "@/components/site/ReportSections";
import { ParkingCta } from "@/components/site/ParkingCta";

export const Route = createFileRoute("/solution")({
  head: () => ({
    meta: [
      { title: "The Solution | SPM ECO System" },
      {
        name: "description",
        content:
          "How SPM ECO works: find parking, book a space, navigate to the facility and reserved slot, park and exit with a final receipt.",
      },
      { property: "og:title", content: "The Solution | SPM ECO System" },
      {
        property: "og:description",
        content:
          "One connected parking journey from finding and booking a space to custom map navigation, parking sessions and final billing.",
      },
    ],
  }),
  component: SolutionPage,
});

function SolutionPage() {
  useScrollReveal();
  return (
    <div className="pt-20">
      <EcosystemOverview />
      <ReportWorkflow />
      <ReportSecurity />
      <ParkingCta />
    </div>
  );
}
