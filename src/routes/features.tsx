import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  ReportCapabilities,
  AssistantExplanation,
  AIStatus,
} from "@/components/site/ReportSections";
import { Hardware } from "@/components/site/Hardware";
import { TechStack } from "@/components/site/TechStack";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features & Modules | SPM ECO System" },
      {
        name: "description",
        content:
          "Explore the documented SPM ecosystem: driver-only Flutter app, biometrics, GPS, recommendations, booking, wallet, navigation, operations and multilingual assistance.",
      },
      { property: "og:title", content: "Features & Modules | SPM ECO System" },
      {
        property: "og:description",
        content:
          "Discovery, booking, navigation, sessions, demo payment and provider management in one software prototype.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  useScrollReveal();
  return (
    <div className="pt-20">
      <ReportCapabilities />
      <AssistantExplanation />
      <Hardware />
      <AIStatus compact />
      <TechStack />
    </div>
  );
}
