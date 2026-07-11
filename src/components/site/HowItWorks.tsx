import { Container, SectionHeading, Reveal } from "./primitives";

const STEPS = [
  { n: 1, title: "Driver Opens Mobile App", body: "Checks nearby parking locations, distance, live availability, and price." },
  { n: 2, title: "Driver Books a Slot", body: "Selects arrival time and duration; the system calculates the fee with dynamic pricing." },
  { n: 3, title: "QR Confirmation Issued", body: "After payment, the user receives a QR-coded booking confirmation." },
  { n: 4, title: "Vehicle Arrives at Gate", body: "The ANPR camera reads the vehicle number plate automatically." },
  { n: 5, title: "System Verifies Vehicle", body: "Checks whether the vehicle is pre-booked, staff, walk-in, delivery, or unauthorized." },
  { n: 6, title: "Gate Opens Automatically", body: "If verified, the barrier lifts and the vehicle is directed to its allocated slot." },
  { n: 7, title: "Parking Duration Tracked", body: "The system tracks entry time, exit time, overtime, and parking charges." },
  { n: 8, title: "Payment & Checkout", body: "At exit, the final or overtime fee is calculated; pay via QR or card." },
  { n: 9, title: "Reports Generated", body: "The dashboard updates occupancy, vehicle count, revenue, and security logs in real time." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How It Works"
            title="Complete Parking Lifecycle Automation"
            subtitle="From driver booking to gate automation and live operator monitoring — every step is connected."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={(i % 3) * 80}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <span className="text-5xl font-bold text-primary/10">{String(s.n).padStart(2, "0")}</span>
              <h3 className="mt-1 text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <span className="absolute right-5 top-6 grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                {s.n}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
