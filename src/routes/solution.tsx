import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Solution } from "@/components/site/Solution";
import { HowItWorks } from "@/components/site/HowItWorks";

export const Route = createFileRoute("/solution")({
  head: () => ({
    meta: [
      { title: "The Solution | SPM ECO System" },
      {
        name: "description",
        content:
          "How SPM ECO System works: real-time availability, advance booking, dynamic pricing, ANPR gate automation, QR payment, and a step-by-step smart parking workflow.",
      },
      { property: "og:title", content: "The Solution | SPM ECO System" },
      {
        property: "og:description",
        content:
          "A unified smart parking solution — real-time availability, booking, ANPR gates, dynamic pricing, and QR payment — explained step by step.",
      },
    ],
  }),
  component: SolutionPage,
});

function SolutionPage() {
  useScrollReveal();
  return (
    <div className="pt-20">
      <Solution />
      <HowItWorks />
    </div>
  );
}
