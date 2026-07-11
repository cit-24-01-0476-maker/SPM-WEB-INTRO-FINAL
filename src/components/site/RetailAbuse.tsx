import retailImg from "@/assets/retail-parking.jpg";
import { Container, SectionHeading, Reveal } from "./primitives";
import { Check } from "lucide-react";

const WORKFLOW = [
  "Vehicle enters retail car park",
  "ANPR camera logs number plate",
  "System starts free parking timer",
  "Vehicle exceeds free threshold",
  "Overstay charge is calculated",
  "Driver pays through QR at exit",
  "Gate opens after payment",
];

const BENEFITS = [
  "Prevents long-term parking abuse",
  "Improves parking availability for shoppers",
  "Increases customer convenience",
  "Supports branch-level parking monitoring",
  "Provides data for retail management",
];

export function RetailAbuse() {
  return (
    <section id="retail" className="relative overflow-hidden bg-secondary/60 py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Retail Parking"
            title="Protect Retail Parking for Genuine Customers"
            subtitle="Retail spaces are often used by commuters and office workers for long hours. SPM ECO System tracks vehicle duration and charges overstays automatically."
          />
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-3xl border border-border shadow-card">
            <img
              src={retailImg}
              alt="Aerial view of a retail supermarket parking lot"
              width={1200}
              height={912}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-lg font-bold text-foreground">Overstay Workflow</h3>
              <ol className="mt-4 space-y-3">
                {WORKFLOW.map((w, i) => (
                  <li key={w} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {w}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl bg-gradient-navy p-6 text-white shadow-glow">
              <h3 className="text-lg font-bold">Benefits</h3>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-white/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
