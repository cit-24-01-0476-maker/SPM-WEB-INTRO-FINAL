import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  ArchitectureSection,
  AIStatus,
  ProjectReadiness,
  ReportSecurity,
} from "@/components/site/ReportSections";
import { ParkingCta } from "@/components/site/ParkingCta";
import { Container } from "@/components/site/primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title: "Architecture, AI & Project Readiness | SPM ECO Sri Lanka" },
      {
        name: "description",
        content:
          "Explore the SPM Flutter, Express, Prisma and PostgreSQL architecture, 12 AI feature statuses, backend security, report verification and deployment roadmap.",
      },
      { property: "og:title", content: "SPM ECO | Architecture & Transparent AI" },
    ],
  }),
  component: TechnologyPage,
});
function TechnologyPage() {
  useScrollReveal();
  const { lang } = useLanguage();
  return (
    <div className="pt-28">
      <Container>
        <nav
          aria-label={lang === "si" ? "Technical sections" : "Technical sections"}
          className="spm-chapter-nav"
        >
          {[
            ["architecture", "Architecture", "Architecture"],
            ["ai-status", "AI features", "AI features"],
            ["trust", "Security", "ආරක්ෂාව"],
            ["readiness", "Readiness & roadmap", "Readiness සහ roadmap"],
          ].map(([id, en, si]) => (
            <a href={`#${id}`} key={id}>
              {lang === "si" ? si : en}
            </a>
          ))}
        </nav>
      </Container>
      <ArchitectureSection />
      <AIStatus />
      <ReportSecurity />
      <ProjectReadiness />
      <ParkingCta />
    </div>
  );
}
