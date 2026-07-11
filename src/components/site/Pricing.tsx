import { Container, SectionHeading, Reveal } from "./primitives";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const RATES = [
  { label: "Off-peak weekday", value: "Rs 100", unit: "/ hour", tone: false },
  { label: "Morning peak", value: "Rs 160", unit: "/ hour", tone: true },
  { label: "Evening peak", value: "Rs 180", unit: "/ hour", tone: true },
  { label: "Weekend", value: "Rs 140", unit: "/ hour", tone: false },
  { label: "Holiday", value: "Rs 200", unit: "/ hour", tone: true },
  { label: "Overtime", value: "Rs 250", unit: "/ hour", tone: true },
  { label: "Retail overstay", value: "Rs 300", unit: "/ hour", tone: true },
];

const BENEFITS = [
  "Improves operator revenue",
  "Controls demand",
  "Reduces parking abuse",
  "Supports guaranteed booking",
  "Makes pricing transparent for drivers",
];

export function Pricing() {
  const { tt } = useLanguage();
  return (
    <section id="pricing" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("Dynamic Pricing")}
            title={tt("Smart Pricing for Peak and Off-Peak Demand")}
            subtitle={tt(
              "Instead of flat-rate pricing, a flexible pricing engine lets operators increase revenue during high-demand periods and encourage better usage off-peak.",
            )}
          />
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <p className="text-sm font-semibold text-muted-foreground">{tt("Example rate card")}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {RATES.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground">{tt(r.label)}</span>
                  <span
                    className={`text-sm font-bold ${r.tone ? "text-primary" : "text-foreground"}`}
                  >
                    {r.value}
                    <span className="text-xs font-medium text-muted-foreground"> {tt(r.unit)}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {tt("Illustrative rates only — every operator configures their own pricing rules.")}
            </p>
          </Reveal>

          <Reveal
            delay={120}
            className="flex flex-col justify-center rounded-3xl bg-gradient-navy p-8 text-white shadow-glow"
          >
            <h3 className="text-xl font-bold">{tt("Benefits")}</h3>
            <ul className="mt-5 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-white/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                  {tt(b)}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
