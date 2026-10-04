import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
const STACK = [
  { area: "Responsive Web App", tech: "React + TypeScript + TanStack Start" },
  { area: "Design System", tech: "Tailwind CSS + accessible reusable components" },
  { area: "Custom Parking Navigation", tech: "Editable SVG maps + Dijkstra route calculation" },
  { area: "Location", tech: "Optional browser GPS + controlled demo positioning" },
  { area: "Demo Data", tech: "Central typed repository + synchronized browser demo state" },
  { area: "Website CMS", tech: "Existing Firebase authentication, Firestore and CMS services" },
  { area: "Payments & Verification", tech: "Simulated wallet, ANPR and QR adapters" },
  { area: "Smart Intelligence", tech: "Controlled assistant and transparent demo estimates" },
  {
    area: "Future Integrations",
    tech: "Secure API, mobile client and validated vision/ML services",
  },
];
export function TechStack() {
  const { tt } = useLanguage();
  return (
    <section id="technology" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("Technology")}
            title={tt("Built for a connected software journey")}
            subtitle={tt(
              "A responsive web prototype today, with replaceable services for future production integrations.",
            )}
          />
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((s, i) => (
            <Reveal
              key={s.area}
              delay={(i % 3) * 60}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-bold text-primary">{tt(s.area)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tt(s.tech)}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
