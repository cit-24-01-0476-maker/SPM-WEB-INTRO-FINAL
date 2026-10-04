import {
  Search,
  CalendarCheck,
  Navigation,
  ScanLine,
  Wallet,
  Building2,
  Sparkles,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
const MODULES = [
  {
    icon: Search,
    title: "Smart Parking Discovery",
    body: "Search parking facilities, check availability, compare distance and prices, and view opening hours.",
    points: ["Search parking", "Availability", "Distance", "Operating hours", "Pricing"],
  },
  {
    icon: CalendarCheck,
    title: "Smart Booking",
    body: "Choose a vehicle and an available space, confirm the booking and follow its progress.",
    points: ["Slot selection", "Vehicle selection", "Booking confirmation", "Booking history"],
  },
  {
    icon: Navigation,
    title: "Smart Navigation",
    body: "Navigate to the facility, verify entry and follow the custom parking map to your exact space.",
    points: [
      "Outdoor navigation demo",
      "Optional browser GPS",
      "Geofence arrival",
      "Custom parking map",
      "Internal route guidance",
      "Find My Car",
      "Exit navigation",
    ],
  },
  {
    icon: ScanLine,
    title: "Smart Verification",
    body: "ANPR verifies vehicle entry and exit. A simulated QR token provides a fallback when the plate check fails.",
    points: ["ANPR demo", "QR fallback", "Booking match", "Verification records"],
  },
  {
    icon: Wallet,
    title: "Smart Payments",
    body: "Use a demo wallet, configurable hourly billing and a final receipt. No real banking or card payments.",
    points: ["Demo wallet", "Mock top-up", "Hourly billing", "Transaction history", "Receipt"],
  },
  {
    icon: Building2,
    title: "Smart Management",
    body: "Providers configure facilities and maps while parking operations track the shared booking journey.",
    points: [
      "Facility management",
      "Slot management",
      "Booking management",
      "Parking sessions",
      "Pricing",
      "Revenue",
      "Reports",
      "Platform commission",
    ],
  },
  {
    icon: Sparkles,
    title: "Smart Intelligence",
    body: "A controlled assistant answers questions from demo state. Transparent scenario estimates demonstrate recommendation and prediction ideas.",
    points: [
      "SPM Smart Assistant",
      "Demo parking recommendations",
      "Demo demand forecasts",
      "Demo duration estimates",
    ],
  },
];
export function Modules() {
  const { tt } = useLanguage();
  return (
    <section id="features" className="bg-secondary/60 py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("Platform features")}
            title={tt("One connected parking experience")}
            subtitle={tt(
              "Discovery, booking, navigation and management — built around the complete driver journey.",
            )}
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {MODULES.map((m, i) => (
            <Reveal
              key={m.title}
              delay={(i % 2) * 60}
              className="rounded-2xl border border-border bg-card p-7"
            >
              <m.icon className="mb-5 h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">{tt(m.title)}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{tt(m.body)}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {m.points.map((p) => (
                  <li key={p} className="rounded-md bg-secondary px-3 py-2 text-xs text-primary">
                    {tt(p)}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="/app/demo" className="eco-button">
            {tt("Explore Live Demo")} →
          </a>
          <a href="/provider" className="eco-button eco-button-outline">
            {tt("For Parking Providers")} →
          </a>
        </div>
      </Container>
    </section>
  );
}
