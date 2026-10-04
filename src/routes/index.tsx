import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Hero } from "@/components/site/Hero";
import { Benefits } from "@/components/site/Benefits";
import { UseCases } from "@/components/site/UseCases";
import { Outcomes } from "@/components/site/Outcomes";
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
          "SPM ECO helps drivers find parking, reserve a space, navigate to the exact slot and manage parking sessions. Explore the connected SLTC campus software demo.",
      },
      {
        property: "og:title",
        content: "SPM ECO System | Smart Parking Management System Sri Lanka",
      },
      {
        property: "og:description",
        content:
          "A connected parking software prototype: discovery, booking, outdoor and custom parking navigation, demo wallet, sessions and provider management.",
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
      <ParkingJourney />
      <Benefits />
      <UseCases />
      <Outcomes />
      <About />
      <ParkingCta />
    </>
  );
}
