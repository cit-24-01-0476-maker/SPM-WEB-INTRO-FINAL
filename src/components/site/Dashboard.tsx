import {
  LayoutGrid,
  CalendarCheck,
  Car,
  CreditCard,
  ShieldAlert,
  Timer,
  FileBarChart,
  Settings,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const WIDGETS = [
  { label: "Total Parking Slots", value: "1,240", sub: "across 6 branches" },
  { label: "Available Slots", value: "318", sub: "25% free" },
  { label: "Occupied Slots", value: "842", sub: "68% in use" },
  { label: "Reserved Slots", value: "80", sub: "pre-booked" },
  { label: "Today's Revenue", value: "Rs 486K", sub: "+12% vs avg" },
  { label: "Today's Vehicles", value: "2,914", sub: "entries logged" },
];

const PAGES = [
  { icon: LayoutGrid, label: "Live Map" },
  { icon: CalendarCheck, label: "Bookings" },
  { icon: Car, label: "Vehicles" },
  { icon: CreditCard, label: "Payments" },
  { icon: ShieldAlert, label: "Security Alerts" },
  { icon: Timer, label: "Retail Overstay" },
  { icon: FileBarChart, label: "Reports" },
  { icon: Settings, label: "Settings" },
  { icon: Building2, label: "Branches" },
];

const OCCUPANCY = [
  { b: "Colombo Fort", pct: 82 },
  { b: "Pettah Plaza", pct: 64 },
  { b: "Marine Drive", pct: 45 },
  { b: "Nugegoda Mall", pct: 91 },
  { b: "Kandy City", pct: 38 },
];

export function Dashboard() {
  const { tt } = useLanguage();
  return (
    <section id="dashboard" className="relative overflow-hidden bg-gradient-navy py-24 text-white">
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-cyan/20 blur-[130px]" />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow={tt("Dashboard")}
            title={tt("A Central Dashboard for Parking Operators")}
            subtitle={tt(
              "Manage every location, vehicle, payment, and alert in real time from one web dashboard.",
            )}
            invert
          />
        </Reveal>

        <Reveal
          delay={120}
          className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-6"
        >
          <div className="grid gap-6 lg:grid-cols-[190px_1fr]">
            {/* sidebar */}
            <aside className="hidden flex-col gap-1 rounded-2xl bg-navy/60 p-3 lg:flex">
              {PAGES.map((p, i) => (
                <span
                  key={p.label}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                    i === 0 ? "bg-gradient-primary font-semibold text-white" : "text-white/65"
                  }`}
                >
                  <p.icon className="h-4 w-4" />
                  {tt(p.label)}
                </span>
              ))}
            </aside>

            <div className="space-y-6">
              {/* KPI widgets */}
              <div className="grid gap-3 sm:grid-cols-3">
                {WIDGETS.map((w) => (
                  <div
                    key={w.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-xs text-white/55">{tt(w.label)}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{w.value}</p>
                    <p className="text-[11px] text-cyan">{tt(w.sub)}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* branch occupancy */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4 text-cyan" /> {tt("Branch-wise Occupancy")}
                  </div>
                  <div className="mt-4 space-y-3">
                    {OCCUPANCY.map((o) => (
                      <div key={o.b}>
                        <div className="flex justify-between text-xs text-white/70">
                          <span>{o.b}</span>
                          <span>{o.pct}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan to-primary"
                            style={{ width: `${o.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* alerts */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldAlert className="h-4 w-4 text-destructive" /> {tt("Live Alerts")}
                  </div>
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between rounded-lg bg-destructive/15 px-3 py-2">
                      <span className="text-white/85">{tt("Unauthorized vehicle · Gate 2")}</span>
                      <span className="font-semibold text-destructive">{tt("Blocked")}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-accent/15 px-3 py-2">
                      <span className="text-white/85">{tt("Overstay")} · WP-CAB-4821</span>
                      <span className="font-semibold text-cyan">2h 14m</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-white/85">{tt("Peak-hour usage")}</span>
                      <span className="font-semibold text-cyan">91%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-white/85">{tt("Overstay vehicles today")}</span>
                      <span className="font-semibold text-white">17</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
