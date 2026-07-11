import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Hero } from "@/components/site/Hero";
import { Benefits } from "@/components/site/Benefits";
import { UseCases } from "@/components/site/UseCases";
import { Outcomes } from "@/components/site/Outcomes";
import { About } from "@/components/site/About";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPM ECO System | Smart Parking Management System Sri Lanka" },
      {
        name: "description",
        content:
          "SPM ECO System is a complete software + hardware smart parking ecosystem for Sri Lanka: real-time booking, ANPR gate automation, dynamic pricing, QR payment, retail control, and operator analytics.",
      },
      { property: "og:title", content: "SPM ECO System | Smart Parking Management System Sri Lanka" },
      {
        property: "og:description",
        content:
          "A complete software + hardware smart parking ecosystem: real-time booking, ANPR gate automation, dynamic pricing, QR payment, retail parking control, and operator analytics.",
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
      <Benefits />
      <UseCases />
      <Outcomes />
      <About />
    </>
  );
}
