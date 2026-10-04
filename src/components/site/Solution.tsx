import {
  MapPin,
  CalendarCheck,
  TrendingUp,
  ScanLine,
  DoorOpen,
  QrCode,
  Timer,
  LayoutDashboard,
  BellRing,
  BarChart3,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const FEATURES = [
  { icon: MapPin, label: "Real-time Parking Availability" },
  { icon: CalendarCheck, label: "Advance Slot Booking" },
  { icon: TrendingUp, label: "Configurable Hourly Pricing" },
  { icon: ScanLine, label: "ANPR / QR Verification Demo" },
  { icon: DoorOpen, label: "Custom Parking Navigation" },
  { icon: QrCode, label: "Demo Wallet & Receipt" },
  { icon: Timer, label: "Parking Sessions" },
  { icon: LayoutDashboard, label: "Provider Portal" },
  { icon: BellRing, label: "Parking Notifications" },
  { icon: BarChart3, label: "Revenue Analytics" },
];

export function Solution() {
  const { tt } = useLanguage();
  return (
    <section id="solution" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-secondary/60" />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow={tt("The Solution")}
            title={tt("What is SPM ECO System?")}
            subtitle={tt(
              "One connected software prototype for finding parking, reserving a space, navigating to the facility and exact slot, managing the session and completing payment.",
            )}
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.label}
              delay={(i % 5) * 60}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-white shadow-glow transition-transform group-hover:scale-105">
                <f.icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold leading-snug text-foreground">{tt(f.label)}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
