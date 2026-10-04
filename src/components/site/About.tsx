import { Smartphone, Server, LayoutDashboard, Cpu, PenTool, Trophy } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const TEAM = [
  { icon: Smartphone, role: "Mobile App Development" },
  { icon: Server, role: "Backend & System Integration" },
  { icon: LayoutDashboard, role: "Web Dashboard Development" },
  { icon: Cpu, role: "Navigation & Verification" },
  { icon: PenTool, role: "UI/UX & Documentation" },
];

export function About() {
  const { tt } = useLanguage();
  return (
    <section id="about" className="py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow={tt("About")}
              title={tt("A University Technology Challenge Competition Project")}
              subtitle={tt(
                "SPM ECO is a smart parking software prototype developed for a University Technology Challenge Competition, connecting discovery, booking and custom parking navigation.",
              )}
            />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {tt(
                "The responsive driver web app, parking provider portal and parking operations dashboard share one connected demonstration dataset. ANPR and QR support entry and exit verification; precise internal positioning and payments are simulated.",
              )}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
              <Trophy className="h-4 w-4 text-accent" />
              {tt("University Project · Real Commercial Potential")}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
              <h3 className="text-lg font-bold text-foreground">{tt("Project Team & Roles")}</h3>
              <div className="mt-5 grid gap-3">
                {TEAM.map((t) => (
                  <div
                    key={t.role}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/30"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
                      <t.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{tt(t.role)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
