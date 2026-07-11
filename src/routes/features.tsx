import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Modules } from "@/components/site/Modules";
import { VehicleClassification } from "@/components/site/VehicleClassification";
import { Booking } from "@/components/site/Booking";
import { Pricing } from "@/components/site/Pricing";
import { RetailAbuse } from "@/components/site/RetailAbuse";
import { Security } from "@/components/site/Security";
import { Hardware } from "@/components/site/Hardware";
import { TechStack } from "@/components/site/TechStack";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features & Modules | SPM ECO System" },
      {
        name: "description",
        content:
          "Explore SPM ECO System features: mobile app, ANPR gates, vehicle classification, advance booking, dynamic pricing, retail overstay control, security, hardware, and technology stack.",
      },
      { property: "og:title", content: "Features & Modules | SPM ECO System" },
      {
        property: "og:description",
        content:
          "Mobile app, ANPR gates, dynamic pricing, retail control, security, and the full hardware + software stack behind SPM ECO System.",
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
      <VehicleClassification />
      <Booking />
      <Pricing />
      <RetailAbuse />
      <Security />
      <Hardware />
      <TechStack />
    </div>
  );
}
