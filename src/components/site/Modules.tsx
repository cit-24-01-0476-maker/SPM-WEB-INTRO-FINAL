import { Smartphone, ScanLine, TrendingUp, Store, LayoutDashboard, Check } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const MODULES = [
  {
    icon: Smartphone,
    tag: "Module 01",
    title: "SmartPark Mobile Application",
    body: "A mobile app for Android and iOS that helps drivers view live availability, compare nearby locations, reserve slots in advance, receive dynamic pricing, pay, and get QR confirmation.",
    points: [
      "Live parking map",
      "Nearby parking search",
      "Available slot count",
      "Advance booking",
      "Dynamic price quote",
      "QR booking confirmation",
      "Payment history",
      "Overtime notification",
      "Cross-branch recommendation",
    ],
  },
  {
    icon: ScanLine,
    tag: "Module 02",
    title: "ANPR Automated Gate System",
    body: "Entry and exit gates use cameras and number-plate recognition to identify vehicles automatically, verify the category, and control the gate without manual intervention.",
    points: [
      "Pre-booked: verify booking & open gate",
      "Staff: match registered plate & open",
      "Walk-in: check space & issue QR ticket",
      "Delivery: verify access & log entry",
      "Unauthorized: keep closed & alert security",
    ],
  },
  {
    icon: TrendingUp,
    tag: "Module 03",
    title: "Dynamic Pricing Engine",
    body: "Calculates parking fees based on time, duration, demand, peak hours, weekends, holidays, and overtime.",
    points: [
      "Off-peak pricing",
      "Peak-hour premium pricing",
      "Weekend pricing",
      "Holiday pricing",
      "Overtime charges",
      "Pre-booking charges",
      "Retail overstay charges",
    ],
  },
  {
    icon: Store,
    tag: "Module 04",
    title: "Retail Parking Management",
    body: "Designed for retail chains like supermarkets and shopping outlets. Detects vehicles that exceed the free parking threshold and automatically generates an overstay bill.",
    points: [
      "ANPR vehicle entry log",
      "Free parking time limit",
      "Overstay detection",
      "QR payment at exit",
      "Customer slot booking",
      "Cross-branch recommendation",
      "Retail abuse prevention",
    ],
  },
  {
    icon: LayoutDashboard,
    tag: "Module 05",
    title: "Operator Dashboard",
    body: "A web dashboard for parking owners and operators to manage multiple parking locations from one place.",
    points: [
      "Live occupancy map",
      "Available & occupied slots",
      "Daily vehicle count",
      "Vehicle category breakdown",
      "Revenue summary",
      "Peak-hour analytics",
      "Overstay reports",
      "Security alerts & unauthorized logs",
      "Multi-location management",
      "Historical trend reports",
    ],
  },
];

export function Modules() {
  const { tt } = useLanguage();
  return (
    <section id="features" className="relative overflow-hidden bg-gradient-navy py-24 text-white">
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/30 blur-[140px]" />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow={tt("Core Modules")}
            title={tt("Core Modules of SPM ECO System")}
            subtitle={tt(
              "Five deeply integrated modules covering the driver, the gate, pricing, retail, and operations.",
            )}
            invert
          />
        </Reveal>

        <div className="mt-14 flex flex-col gap-6">
          {MODULES.map((m, i) => (
            <Reveal
              key={m.title}
              delay={(i % 2) * 90}
              className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-8"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
                  {m.tag}
                </span>
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white shadow-glow">
                    <m.icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-xl font-bold">{tt(m.title)}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/70">{tt(m.body)}</p>
              </div>
              <ul className="grid content-start gap-2.5 sm:grid-cols-2">
                {m.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-white/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>{tt(p)}</span>
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
