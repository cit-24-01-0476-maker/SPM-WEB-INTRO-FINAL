import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { text, localize } from "@/lib/site/report-content";
const STACK = [
  {
    area: text("Driver client", "Driver client"),
    tech: text(
      "Flutter mobile app, native biometrics and secure session storage",
      "Flutter mobile app, native biometrics සහ secure session storage",
    ),
  },
  {
    area: text("Operator client", "Operator client"),
    tech: text(
      "Separate Admin Web with authenticated operational tools",
      "Authenticated operational tools සහිත වෙනම Admin Web",
    ),
  },
  {
    area: text("API & business rules", "API සහ business rules"),
    tech: text(
      "Node.js / Express REST API, JWT authentication and RBAC",
      "Node.js / Express REST API, JWT authentication සහ RBAC",
    ),
  },
  {
    area: text("Persistent data", "Persistent data"),
    tech: text(
      "PostgreSQL with Prisma; clients access approved backend services",
      "Prisma සමඟ PostgreSQL; clients approved backend services භාවිතා කරයි",
    ),
  },
  {
    area: text("Real-time events", "Real-time events"),
    tech: text(
      "Socket.IO events; push notification integration requires device validation",
      "Socket.IO events; push notification integration සඳහා device validation අවශ්‍යය",
    ),
  },
  {
    area: text("Navigation engine", "Navigation engine"),
    tech: text(
      "GPS for outdoor guidance; vector graph and Dijkstra for mapped indoor routes",
      "Outdoor guidance සඳහා GPS; indoor routes සඳහා vector graph සහ Dijkstra",
    ),
  },
  {
    area: text("Intelligence layer", "Intelligence layer"),
    tech: text(
      "Explainable rule/data baselines and ML-ready computer-vision pipelines",
      "Explainable rule/data baselines සහ ML-ready computer-vision pipelines",
    ),
  },
  {
    area: text("Deployment target", "Deployment target"),
    tech: text("Vercel + Render + Neon + Android APK", "Vercel + Render + Neon + Android APK"),
  },
];
export function TechStack() {
  const { lang } = useLanguage();
  const l = (en: string, si: string) => localize(text(en, si), lang);
  return (
    <section id="technology" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={l("Technology", "තාක්ෂණය")}
            title={l("The documented ecosystem stack.", "වාර්තාවේ ecosystem තාක්ෂණය.")}
            subtitle={l(
              "The supplied report describes these platform layers. This introduction site's React/Firebase CMS and browser demo are explained separately on the Technology page.",
              "ලබාදුන් වාර්තාවේ platform layers මෙහි දැක්වේ. මෙම site's React/Firebase CMS සහ browser demo එක Technology page එකේ වෙනම විස්තර වේ.",
            )}
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <Reveal key={s.area.en} className="spm-report-card">
              <h3 className="text-sm font-bold text-primary">{localize(s.area, lang)}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {localize(s.tech, lang)}
              </p>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="/technology" className="eco-button">
            {l("Explore architecture & readiness", "Architecture සහ readiness බලන්න")} →
          </a>
        </div>
      </Container>
    </section>
  );
}
