import { Car, Building2, Store, Check } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";

const GROUPS = [
  {
    icon: Car,
    title: "For Drivers",
    items: [
      "Find parking faster",
      "Reserve parking in advance",
      "Avoid unnecessary searching",
      "Transparent pricing",
      "QR-based easy access",
      "Reduced waiting time",
    ],
  },
  {
    icon: Building2,
    title: "For Operators",
    items: [
      "Reduce manual work",
      "Prevent revenue leakage",
      "Improve vehicle throughput",
      "Track revenue in real time",
      "Manage multiple locations",
      "Get historical reports",
      "Improve security",
      "Increase revenue with dynamic pricing",
    ],
  },
  {
    icon: Store,
    title: "For Retailers",
    items: [
      "Prevent free parking abuse",
      "Improve customer parking availability",
      "Reduce non-customer parking",
      "Monitor branch parking activity",
      "Generate overstay revenue",
    ],
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="relative overflow-hidden bg-secondary/60 py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Benefits"
            title="Why SPM ECO System Matters"
            subtitle="Clear value for everyone in the parking ecosystem — drivers, operators, and retailers."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {GROUPS.map((g, i) => (
            <Reveal
              key={g.title}
              delay={i * 100}
              className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1.5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-white shadow-glow">
                <g.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-foreground">{g.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {g.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {it}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
