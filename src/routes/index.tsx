import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Hero } from "@/components/site/Hero";
import { UseCases } from "@/components/site/UseCases";
import {
  EcosystemOverview,
  SriLankaSection,
  AIStatus,
  ProjectFAQ,
} from "@/components/site/ReportSections";
import { About } from "@/components/site/About";
import { ParkingJourney } from "@/components/site/ParkingJourney";
import { ParkingCta } from "@/components/site/ParkingCta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPM ECO System | Smart Parking Management System Sri Lanka" },
      {
        name: "description",
        content:
          "Discover SPM ECO, a smart parking ecosystem for Sri Lanka: Flutter driver app, web administration, booking, navigation, QR/ANPR architecture and transparent AI baselines.",
      },
      {
        property: "og:title",
        content: "SPM ECO System | Smart Parking Management System Sri Lanka",
      },
      {
        property: "og:description",
        content:
          "A complete introduction to SPM smart parking, local use cases, Sinhala and Singlish assistance, system architecture and the project's development status.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useScrollReveal();
  return (
    <>
      <Hero />
      <EcosystemOverview />
      <SriLankaSection />
      <ParkingJourney />
      <AIStatus compact />
      <UseCases />
      <About />
      <ProjectFAQ />
      <ParkingCta />
    </>
  );
}
