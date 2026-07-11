import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const STACK = [
  { area: "Mobile App", tech: "React Native for Android and iOS" },
  { area: "Web Dashboard", tech: "React.js / Next.js" },
  { area: "Backend API", tech: "Node.js / Express.js or NestJS" },
  { area: "Database", tech: "PostgreSQL for relational data" },
  { area: "Real-time Layer", tech: "Redis for live occupancy & caching" },
  { area: "ANPR / Computer Vision", tech: "Python, OpenCV, Tesseract OCR & custom model" },
  { area: "Payments", tech: "QR & card payment gateway integration" },
  { area: "Cloud", tech: "AWS or GCP hosting, storage & notifications" },
  { area: "Version Control", tech: "Git and GitHub" },
  { area: "Design", tech: "Figma for UI/UX design & prototyping" },
];

export function TechStack() {
  const { tt } = useLanguage();
  return (
    <section id="technology" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("Technology")}
            title={tt("Technology Stack")}
            subtitle={tt(
              "A modern, scalable architecture spanning mobile, web, backend, computer vision, and cloud.",
            )}
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((s, i) => (
            <Reveal
              key={s.area}
              delay={(i % 3) * 60}
              className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {tt(s.area)}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{tt(s.tech)}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
