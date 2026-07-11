import { CalendarCheck, IdCard, UserPlus, Truck, Ban } from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const VEHICLES = [
  {
    icon: CalendarCheck,
    title: "Pre-booked Vehicles",
    body: "Vehicles with a confirmed mobile app booking and QR confirmation.",
    tone: "ok",
  },
  {
    icon: IdCard,
    title: "Staff Vehicles",
    body: "Registered staff plates are verified automatically through the database.",
    tone: "ok",
  },
  {
    icon: UserPlus,
    title: "Walk-in Vehicles",
    body: "Vehicles without booking can enter if spaces are available and receive QR ticketing.",
    tone: "neutral",
  },
  {
    icon: Truck,
    title: "Delivery Vehicles",
    body: "Delivery vehicles are logged and allowed based on configured access rules.",
    tone: "neutral",
  },
  {
    icon: Ban,
    title: "Unauthorized Vehicles",
    body: "Unrecognized or restricted vehicles trigger real-time security alerts and gate blocking.",
    tone: "block",
  },
];

const toneMap: Record<string, string> = {
  ok: "bg-primary/10 text-primary",
  neutral: "bg-accent/15 text-accent-foreground",
  block: "bg-destructive/10 text-destructive",
};

export function VehicleClassification() {
  const { tt } = useLanguage();
  return (
    <section id="anpr" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("ANPR System")}
            title={tt("Intelligent Vehicle Classification")}
            subtitle={tt(
              "SPM ECO System automatically classifies every vehicle at the gate and applies the correct access rule.",
            )}
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {VEHICLES.map((v, i) => (
            <Reveal
              key={v.title}
              delay={i * 70}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${toneMap[v.tone]}`}>
                <v.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-bold text-foreground">{tt(v.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tt(v.body)}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
