import { Clock, CalendarX, ReceiptText, ShieldAlert, ShoppingCart } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const PROBLEMS = [
  {
    icon: Clock,
    title: "Time lost searching",
    body: "Drivers circle around looking for a free parking space.",
  },
  {
    icon: CalendarX,
    title: "Uncertain availability",
    body: "Drivers reach a facility without knowing whether a space is available.",
  },
  {
    icon: ShoppingCart,
    title: "Congested facilities",
    body: "Busy parking areas create queues and unnecessary driving.",
  },
  {
    icon: Clock,
    title: "Finding the entrance",
    body: "The correct parking entrance is not always easy to locate.",
  },
  {
    icon: CalendarX,
    title: "Finding the reserved space",
    body: "A reservation is only useful when the driver can find its exact location.",
  },
  {
    icon: ReceiptText,
    title: "Manual process delays",
    body: "Manual check-in and payment can slow down a parking journey.",
  },
  {
    icon: ReceiptText,
    title: "Inconvenient payments",
    body: "Drivers need a clear running charge and a simple checkout.",
  },
  {
    icon: Clock,
    title: "Remembering the parked vehicle",
    body: "Drivers may forget where they parked and need guidance back to their car.",
  },
  {
    icon: ShieldAlert,
    title: "Limited provider visibility",
    body: "Providers need one consistent view of spaces, reservations and revenue.",
  },
  {
    icon: CalendarX,
    title: "Booking conflicts",
    body: "Conflicting reservations can promise the same space to multiple drivers.",
  },
];

export function Problem() {
  const { tt } = useLanguage();
  return (
    <section id="problem" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("The Problem")}
            title={tt("The Parking Problem in Urban Sri Lanka")}
            subtitle={tt(
              "Parking facilities in Colombo and commercial zones still depend heavily on manual and paper-based operations.",
            )}
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
              <h3 className="mt-5 text-lg font-bold text-foreground">{tt(p.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tt(p.body)}</p>
            </Reveal>
          ))}
          <Reveal
            delay={350}
            className="flex flex-col justify-center rounded-2xl bg-gradient-navy p-6 text-white shadow-glow"
          >
            <p className="text-3xl font-bold text-cyan">{tt("1 platform")}</p>
            <p className="mt-2 text-sm text-white/75">
              {tt(
                "SPM ECO System replaces fragmented manual operations with one integrated, automated ecosystem.",
              )}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
