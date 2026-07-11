import { MapPin, Navigation, Ticket, Clock, QrCode, Check } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const CAPABILITIES = [
  "Live parking location map",
  "Distance from driver",
  "Available slot count",
  "Estimated fee",
  "Arrival time selection",
  "Duration selection",
  "Guaranteed slot reservation",
  "QR confirmation",
  "Payment before arrival",
];

export function Booking() {
  const { tt } = useLanguage();
  return (
    <section id="mobile" className="relative overflow-hidden bg-secondary/60 py-24">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow={tt("Mobile App")}
              title={tt("Find, Book, and Park Faster")}
              subtitle={tt(
                "The mobile app reduces driver search time by showing live parking availability before arrival.",
              )}
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{tt(c)}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Phone mockup */}
          <Reveal delay={120} className="flex justify-center">
            <div className="relative w-[280px] rounded-[2.6rem] border-[10px] border-navy bg-navy p-2 shadow-glow">
              <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-navy" />
              <div className="overflow-hidden rounded-[2rem] bg-background">
                {/* app header */}
                <div className="bg-gradient-primary px-4 pb-4 pt-8 text-white">
                  <p className="text-xs text-white/70">{tt("Good afternoon")}</p>
                  <p className="text-lg font-bold">{tt("Nearby Parking")}</p>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs backdrop-blur">
                    <MapPin className="h-4 w-4" /> {tt("Colombo Fort, Sri Lanka")}
                  </div>
                </div>
                {/* list */}
                <div className="space-y-3 p-4">
                  {[
                    {
                      name: "Fort City Car Park",
                      dist: "0.4 km",
                      slots: 42,
                      price: "Rs 120/hr",
                      peak: false,
                    },
                    {
                      name: "Pettah Central Plaza",
                      dist: "1.1 km",
                      slots: 8,
                      price: "Rs 180/hr",
                      peak: true,
                    },
                    {
                      name: "Marine Drive Deck",
                      dist: "2.3 km",
                      slots: 27,
                      price: "Rs 100/hr",
                      peak: false,
                    },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="rounded-xl border border-border bg-card p-3 shadow-card"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        {p.peak ? (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                            {tt("Peak")}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" /> {p.dist}
                        </span>
                        <span className="text-primary">
                          {p.slots} {tt("slots")}
                        </span>
                        <span>{p.price}</span>
                      </div>
                    </div>
                  ))}
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-white">
                    <Ticket className="h-4 w-4" /> {tt("Book Now")}
                  </button>
                  <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" /> Arrival 3:30 PM · 2 hrs
                    </div>
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
