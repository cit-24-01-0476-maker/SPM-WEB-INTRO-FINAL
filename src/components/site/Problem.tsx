import { Clock, CalendarX, ReceiptText, ShieldAlert, ShoppingCart } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";

const PROBLEMS = [
  {
    icon: Clock,
    title: "Peak-Hour Parking Discovery",
    body: "Drivers have no reliable way to know whether spaces are available before reaching a location, causing repeated circling, wasted time, congestion, and frustration during peak hours.",
  },
  {
    icon: CalendarX,
    title: "No Advance Booking System",
    body: "Most locations run first-come, first-served. Drivers cannot reserve ahead, and operators miss revenue from premium, guaranteed parking.",
  },
  {
    icon: ReceiptText,
    title: "Manual Ticketing & Revenue Leakage",
    body: "Paper tickets and hand calculations create human errors, fake tickets, slow vehicle movement, and poor revenue tracking.",
  },
  {
    icon: ShieldAlert,
    title: "Unclassified & Unauthorized Vehicles",
    body: "Staff, delivery, walk-in, and unauthorized vehicles are not properly identified, causing security issues and operational confusion.",
  },
  {
    icon: ShoppingCart,
    title: "Retail Free Parking Abuse",
    body: "Retail spaces are misused by non-customers who park for long hours, reducing availability for genuine shoppers and affecting store revenue.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The Problem"
            title="The Parking Problem in Urban Sri Lanka"
            subtitle="Parking facilities in Colombo and commercial zones still depend heavily on manual and paper-based operations."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 70}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive/15">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </Reveal>
          ))}
          <Reveal
            delay={350}
            className="flex flex-col justify-center rounded-2xl bg-gradient-navy p-6 text-white shadow-glow"
          >
            <p className="text-3xl font-bold text-cyan">1 platform</p>
            <p className="mt-2 text-sm text-white/75">
              SPM ECO System replaces fragmented manual operations with one integrated, automated ecosystem.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
