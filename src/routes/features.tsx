import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Modules } from "@/components/site/Modules";
import { Hardware } from "@/components/site/Hardware";
import { TechStack } from "@/components/site/TechStack";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features & Modules | SPM ECO System" },
      {
        name: "description",
        content:
          "Explore parking discovery, booking, custom SVG navigation, geofence arrival, demo verification, wallet, sessions and parking management.",
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
      <Modules />
      <Hardware />
      <TechStack />
    </div>
  );
}
