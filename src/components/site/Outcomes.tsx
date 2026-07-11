import garageImg from "@/assets/garage.jpg";
import { Container, SectionHeading, Reveal } from "./primitives";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const OUTCOMES = [
  "A fully functional smart parking mobile application",
  "ANPR-based automated entry and exit gate system",
  "Dynamic pricing and QR payment workflow",
  "Retail parking overstay detection module",
  "Web-based operator dashboard",
  "Multi-location parking management",
  "Revenue analytics and trend reports",
  "Improved driver parking experience",
  "Reduced manual errors and revenue leakage",
  "Better parking security and control",
];

const DEMO = [
  "User searches parking location",
  "User books a parking slot",
  "QR confirmation is generated",
  "Vehicle number plate is recognized",
  "Gate access is approved",
  "Parking duration is tracked",
  "Overtime fee is calculated",
  "QR payment is completed",
  "Operator dashboard updates live data",
  "Security alert is shown for unauthorized vehicle",
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
                  "What SPM ECO System delivers as a complete software + hardware solution.",
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
              <img
                src={garageImg}
                alt="Modern smart parking garage interior with slot sensor lighting"
                width={1200}
                height={912}
                loading="lazy"
                className="h-56 w-full object-cover sm:h-64"
              />
            </Reveal>
            <Reveal
              delay={120}
              className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
            >
              <h3 className="text-lg font-bold">{tt("Prototype Demonstration Plan")}</h3>
              <p className="mt-2 text-sm text-white/65">
                {tt(
                  "The prototype demonstrates the full journey from driver booking to gate automation and operator monitoring.",
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
