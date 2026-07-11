import {
  ScanLine,
  TrendingUp,
  QrCode,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { HeroParkingVideo } from "./HeroParkingVideo";
import { Container } from "./primitives";
import { CmsButton } from "./CmsButton";
import { usePublicSettings } from "@/lib/cms/PublicSettings";

const STATUS = [
  { icon: Clock3, label: "Real-Time Availability" },
  { icon: ScanLine, label: "ANPR Automation" },
  { icon: TrendingUp, label: "Dynamic Pricing" },
  { icon: QrCode, label: "Secure QR Payments" },
  { icon: LayoutDashboard, label: "Multi-Location Control" },
];

export function Hero() {
  const { hero } = usePublicSettings();
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-hero pt-32 pb-16 text-white sm:pt-36 lg:pb-24"
    >
      {/* soft grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 60% 30%, black 0%, transparent 75%)",
        }}
      />
      {/* controlled cyan / blue radial glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#176bff]/25 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#18c8ff]/20 blur-[150px]" />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          <div className="reveal is-visible flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              {hero.eyebrow}
            </span>

            <h1 className="text-[2.5rem] font-extrabold leading-[1.03] sm:text-6xl lg:text-[4.5rem]">
              {hero.headline}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              {hero.supporting}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <CmsButton variant="primary" href={hero.primaryCtaLink}>
                {hero.primaryCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </CmsButton>
              <CmsButton variant="secondary" onDark href={hero.secondaryCtaLink}>
                {hero.secondaryCtaLabel}
              </CmsButton>
            </div>

            <p className="flex items-center gap-2 pt-1 text-xs text-white/55">
              <ShieldCheck className="h-4 w-4 text-cyan" />
              {hero.trustStatement}
            </p>
          </div>

          {/* Hero visual: live smart parking system demonstration video */}
          <HeroParkingVideo />
        </div>

        {/* Status bar with dividers */}
        <div className="reveal is-visible mt-14 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3 backdrop-blur lg:mt-20">
          <div className="flex flex-wrap items-center justify-center gap-y-3 divide-white/10 sm:divide-x">
            {STATUS.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-2 px-4 text-xs font-medium text-white/80 sm:px-6"
              >
                <s.icon className="h-4 w-4 text-cyan" />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
