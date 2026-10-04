import {
  Building,
  Store,
  ShoppingBag,
  Briefcase,
  Hospital,
  GraduationCap,
  Home,
  Hotel,
  MapPin,
  Network,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const CASES = [
  {
    icon: Building,
    title: "Colombo Commercial Parking",
    body: "Helps drivers discover, reserve and navigate busy city parking facilities.",
  },
  {
    icon: Store,
    title: "Retail Chain Parking",
    body: "Could help operators distinguish customer stays and manage parking across branches.",
  },
  {
    icon: ShoppingBag,
    title: "Shopping Mall Parking",
    body: "Guides shoppers to free slots and speeds up peak-hour entry and exit.",
  },
  {
    icon: Briefcase,
    title: "Office Building Parking",
    body: "Connects visitor reservations with entry verification and exact-space guidance.",
  },
  {
    icon: Hospital,
    title: "Hospital Parking",
    body: "A potential setting for visitor guidance, clearly mapped bays and operator oversight.",
  },
  {
    icon: GraduationCap,
    title: "University Parking",
    body: "Demonstrates the complete SLTC campus journey from booking to receipt.",
  },
  {
    icon: Home,
    title: "Apartment Parking",
    body: "Helps residents and visitors find reserved spaces on a custom facility map.",
  },
  {
    icon: Hotel,
    title: "Hotel Parking",
    body: "Connects guest pre-booking, parking guidance and a clear final receipt.",
  },
  {
    icon: MapPin,
    title: "Public Parking Area",
    body: "A potential pilot setting for clear availability, pricing and navigation.",
  },
  {
    icon: Network,
    title: "Multi-branch Operator",
    body: "Centralizes occupancy, revenue, and security across all locations.",
  },
];

export function UseCases() {
  const { tt } = useLanguage();
  return (
    <section id="usecases" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("Potential use cases")}
            title={tt("Where SPM ECO System Can Be Used")}
            subtitle={tt("One adaptable platform for every kind of parking facility in Sri Lanka.")}
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => (
            <Reveal
              key={c.title}
              delay={(i % 3) * 70}
              className="group flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-white">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">{tt(c.title)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tt(c.body)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
