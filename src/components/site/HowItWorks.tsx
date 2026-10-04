import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
const STEPS = [
  {
    n: 1,
    title: "Find",
    body: "Search nearby facilities, compare availability, opening hours and prices.",
  },
  {
    n: 2,
    title: "Book",
    body: "Choose a vehicle and an available space, then confirm with your demo wallet.",
  },
  {
    n: 3,
    title: "Navigate",
    body: "Follow outdoor demo navigation to the entrance, verify entry, then use the custom map to reach your reserved space.",
  },
  { n: 4, title: "Park", body: "Start a session, view your running charge and use Find My Car." },
  {
    n: 5,
    title: "Exit",
    body: "Follow the exit route, verify your vehicle and settle the outstanding charge to receive a receipt.",
  },
];
export function HowItWorks() {
  const { tt } = useLanguage();
  return (
    <section id="how" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("How It Works")}
            title={tt("Find. Book. Navigate. Park. Exit.")}
            subtitle={tt(
              "Outdoor navigation reaches the facility. Custom parking navigation takes you from the entrance to your exact reserved space.",
            )}
          />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={(i % 3) * 60}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="text-5xl font-bold text-primary/15">0{s.n}</span>
              <h3 className="mt-4 text-xl font-bold">{tt(s.title)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tt(s.body)}</p>
            </Reveal>
          ))}
        </div>
        <a href="/app/demo" className="eco-button mt-8">
          {tt("Explore Live Demo")} →
        </a>
      </Container>
    </section>
  );
}
