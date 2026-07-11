import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Problem } from "@/components/site/Problem";

export const Route = createFileRoute("/problem")({
  head: () => ({
    meta: [
      { title: "The Parking Problem | SPM ECO System" },
      {
        name: "description",
        content:
          "The urban parking challenges SPM ECO System solves: peak-hour discovery, no advance booking, manual ticketing, revenue leakage, unauthorized vehicles, and retail parking abuse.",
      },
      { property: "og:title", content: "The Parking Problem | SPM ECO System" },
      {
        property: "og:description",
        content:
          "Peak-hour discovery, manual ticketing, revenue leakage, and retail parking abuse — the problems SPM ECO System is built to solve.",
      },
    ],
  }),
  component: ProblemPage,
});

function ProblemPage() {
  useScrollReveal();
  return (
    <div className="pt-20">
      <Problem />
    </div>
  );
}
