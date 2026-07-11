import { Building, Store, ShoppingBag, Briefcase, Hospital, GraduationCap, Home, Hotel, MapPin, Network } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";

const CASES = [
  { icon: Building, title: "Colombo Commercial Parking", body: "Automates ticketing and gate flow in high-demand Fort and Pettah zones." },
  { icon: Store, title: "Retail Chain Parking", body: "Protects customer parking with overstay detection across every branch." },
  { icon: ShoppingBag, title: "Shopping Mall Parking", body: "Guides shoppers to free slots and speeds up peak-hour entry and exit." },
  { icon: Briefcase, title: "Office Building Parking", body: "Verifies staff and visitor vehicles automatically for secure access." },
  { icon: Hospital, title: "Hospital Parking", body: "Prioritizes emergency and staff access while managing visitor flow." },
  { icon: GraduationCap, title: "University Parking", body: "Classifies student, staff, and visitor vehicles across campus lots." },
  { icon: Home, title: "Apartment Parking", body: "Grants residents automatic access and blocks unauthorized vehicles." },
  { icon: Hotel, title: "Hotel Parking", body: "Offers guests pre-booking, valet logging, and seamless QR checkout." },
  { icon: MapPin, title: "Public Parking Area", body: "Brings real-time availability and cashless payment to public lots." },
  { icon: Network, title: "Multi-branch Operator", body: "Centralizes occupancy, revenue, and security across all locations." },
];

export function UseCases() {
  return (
    <section id="usecases" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Use Cases"
            title="Where SPM ECO System Can Be Used"
            subtitle="One adaptable platform for every kind of parking facility in Sri Lanka."
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
                <h3 className="text-base font-bold text-foreground">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
