import anprImg from "@/assets/anpr-camera.jpg";
import {
  Camera,
  DoorClosed,
  Cpu,
  QrCode,
  Printer,
  CreditCard,
  Radar,
  MonitorSmartphone,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const HARDWARE = [
  { icon: Camera, title: "ANPR Camera", body: "Captures number plates at entry and exit gates." },
  {
    icon: DoorClosed,
    title: "Barrier Gate Controller",
    body: "Automatically opens and closes gates on system approval.",
  },
  {
    icon: Cpu,
    title: "Raspberry Pi / Edge Device",
    body: "Performs on-site ANPR processing and local communication.",
  },
  {
    icon: QrCode,
    title: "QR Scanner",
    body: "Scans booking confirmations, QR tickets, and payment codes.",
  },
  { icon: Printer, title: "Thermal Printer", body: "Prints tickets and bills for walk-in users." },
  { icon: CreditCard, title: "Payment Terminal", body: "Supports card and QR-based payments." },
  {
    icon: Radar,
    title: "Vehicle Detection Sensor",
    body: "Detects vehicle presence near the gate.",
  },
  {
    icon: MonitorSmartphone,
    title: "Operator Control Device",
    body: "Used by officers for manual approval and alert handling.",
  },
];

export function Hardware() {
  const { tt } = useLanguage();
  return (
    <section id="hardware" className="relative overflow-hidden bg-secondary/60 py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="overflow-hidden rounded-3xl border border-border shadow-card">
            <img
              src={anprImg}
              alt="ANPR camera mounted at a parking gate"
              width={1200}
              height={912}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </Reveal>

          <div>
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow={tt("Hardware")}
                title={tt("Smart Parking Hardware Integration")}
                subtitle={tt(
                  "A complete on-site hardware stack that pairs with the SPM ECO software platform.",
                )}
              />
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {HARDWARE.map((h, i) => (
                <Reveal
                  key={h.title}
                  delay={(i % 2) * 80}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-1"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
                    <h.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{tt(h.title)}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {tt(h.body)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
