import { Smartphone, Server, LayoutDashboard, Cpu, PenTool, Trophy } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";

const TEAM = [
  { icon: Smartphone, role: "Mobile App Development" },
  { icon: Server, role: "Backend & System Integration" },
  { icon: LayoutDashboard, role: "Web Dashboard Development" },
  { icon: Cpu, role: "ANPR & Hardware Integration" },
  { icon: PenTool, role: "UI/UX & Documentation" },
];

export function About() {
  return (
    <section id="about" className="py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="About"
              title="A University Technology Challenge Competition Project"
              subtitle="SPM ECO System is a software and hardware-based smart parking management solution developed for a University Technology Challenge Competition — engineered with real commercial potential."
            />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              The system focuses on solving real parking problems in urban Sri Lanka using modern digital technologies,
              automation, computer vision, and cloud-based management — combining a driver mobile app, ANPR gate
              automation, dynamic pricing, retail parking control, and a multi-location operator dashboard into a single
              ecosystem.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
              <Trophy className="h-4 w-4 text-accent" />
              University Project · Real Commercial Potential
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
              <h3 className="text-lg font-bold text-foreground">Project Team & Roles</h3>
              <div className="mt-5 grid gap-3">
                {TEAM.map((t) => (
                  <div
                    key={t.role}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/30"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
                      <t.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{t.role}</span>
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
