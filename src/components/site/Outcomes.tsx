import { ParkingPhoto } from "./ParkingPhoto";
import { Container, SectionHeading, Reveal } from "./primitives";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const OUTCOMES = [
  "A responsive driver web application",
  "Simulated ANPR / QR entry and exit verification",
  "Configurable hourly billing and demo wallet",
  "Custom SVG map and exact-slot demo navigation",
  "Parking provider portal and operations dashboard",
  "Multi-location parking management",
  "Revenue analytics and trend reports",
  "Improved driver parking experience",
  "Reduced manual errors and revenue leakage",
  "Better parking security and control",
];

const DEMO = [
  "User searches parking location",
  "User books a parking slot",
  "Demo verification token is generated",
  "Vehicle plate is verified in demo mode",
  "Entry verification is approved",
  "Parking duration is tracked",
  "Overtime fee is calculated",
  "Outstanding demo wallet payment is completed",
  "Provider dashboard updates shared demo records",
  "Final receipt and platform commission are recorded",
];

export function Outcomes() {
  const { tt } = useLanguage();
  return (
    <section id="outcomes" className="relative overflow-hidden bg-gradient-navy py-24 text-white">
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-primary/30 blur-[140px]" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow={tt("Outcomes")}
                title={tt("Expected Project Outcomes")}
                subtitle={tt(
                  "A complete parking software prototype with one consistent driver, provider and operations journey.",
                )}
                invert
              />
            </Reveal>
            <ul className="mt-8 grid gap-3">
              {OUTCOMES.map((o, i) => (
                <Reveal
                  as="li"
                  key={o}
                  delay={i * 40}
                  className="flex items-start gap-2.5 text-sm text-white/85"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                  {tt(o)}
                </Reveal>
              ))}
            </ul>
          </div>

          <div>
            <Reveal className="overflow-hidden rounded-3xl border border-white/10 shadow-glow">
              <ParkingPhoto className="h-56 w-full sm:h-64" />
            </Reveal>
            <Reveal
              delay={120}
              className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
            >
              <h3 className="text-lg font-bold">{tt("Prototype Demonstration Plan")}</h3>
              <p className="mt-2 text-sm text-white/65">
                {tt(
                  "The prototype demonstrates booking, custom navigation, simulated verification, parking sessions and shared provider reporting.",
                )}
              </p>
              <ol className="mt-4 space-y-2">
                {DEMO.map((d, i) => (
                  <li key={d} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    {tt(d)}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
