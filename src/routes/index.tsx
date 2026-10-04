import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { AppDownload } from "@/components/site/AppDownload";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPM ECO System | Smart Parking Management System Sri Lanka" },
      {
        name: "description",
        content:
          "Meet the SPM ECO Android smart parking app for Sri Lanka. Find parking, book slots and navigate inside the mobile app. Download the APK here when released.",
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
      <AppDownload />
      <EcosystemOverview />
      <SriLankaSection />
      <ParkingJourney />
      <AIStatus compact />
      <UseCases />
      <About />
      <ProjectFAQ />
    </>
  );
}
