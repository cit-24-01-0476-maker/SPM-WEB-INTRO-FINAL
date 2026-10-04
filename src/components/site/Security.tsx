import {
  ShieldAlert,
  ListX,
  Lock,
  Images,
  BellRing,
  CheckCheck,
  History,
  Route,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const FEATURES = [
  {
    icon: ShieldAlert,
    title: "Unauthorized Vehicle Alert",
    body: "Instant alerts when an unrecognized or restricted plate is detected.",
  },
  {
    icon: ListX,
    title: "Blacklist Support",
    body: "Maintain a blacklist to automatically deny flagged vehicles.",
  },
  {
    icon: Lock,
    title: "Verification Failure",
    body: "Failed demo checks do not approve the parking entry. Use the QR fallback or retry.",
  },
  {
    icon: Images,
    title: "Entry & Exit Image Logs",
    body: "Every gate event captures a timestamped plate image.",
  },
  {
    icon: BellRing,
    title: "Security Officer Notification",
    body: "Push notifications route incidents to the right officer.",
  },
  {
    icon: CheckCheck,
    title: "Manual Approval Option",
    body: "Officers can approve or override access when needed.",
  },
  {
    icon: History,
    title: "Audit History",
    body: "Full audit trail of overrides, approvals, and access events.",
  },
  {
    icon: Route,
    title: "Vehicle Movement Records",
    body: "Track entry, exit, and movement across all locations.",
  },
];

export function Security() {
  const { tt } = useLanguage();
  return (
    <section id="security" className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={tt("Security")}
            title={tt("Real-time Security Monitoring")}
            subtitle={tt(
              "Help security teams identify unauthorized vehicles, suspicious activity, overstays, and manual override cases.",
            )}
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 4) * 70}
              className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">{tt(f.title)}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tt(f.body)}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
