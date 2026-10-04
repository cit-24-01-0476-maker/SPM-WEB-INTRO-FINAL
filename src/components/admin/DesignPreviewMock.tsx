// Live design preview: a scoped mock of the public website styled by the
// supplied (draft) design settings. Design tokens are applied to the scoped
// root element so changes reflect live without touching the global document.

import { useEffect, useRef } from "react";
import { ArrowRight, Car, Gauge, ShieldCheck } from "lucide-react";
import { applyDesign } from "@/lib/cms/apply";
import type { DesignSettings } from "@/lib/cms/model";

export function DesignPreviewMock({ design }: { design: DesignSettings }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) applyDesign(design, ref.current);
  }, [design]);

  const b = design.buttons;
  const t = design.typography;

  const primaryBtn: React.CSSProperties = {
    background: `linear-gradient(120deg, ${design.colors.buttonGradientStart}, ${design.colors.buttonGradientEnd})`,
    color: b.primaryText,
    borderRadius: b.borderRadius,
    padding: `${b.paddingY}px ${b.paddingX}px`,
    fontWeight: b.fontWeight,
    boxShadow: b.enableGlow ? `0 18px 40px -18px ${design.colors.techBlue}` : "none",
    fontFamily: "var(--cms-font-button)",
  };
  const secondaryBtn: React.CSSProperties = {
    background: b.secondaryBg,
    color: b.secondaryText,
    borderRadius: b.borderRadius,
    padding: `${b.paddingY}px ${b.paddingX}px`,
    fontWeight: b.fontWeight,
    border: `${b.borderWidth}px solid ${b.borderColor}`,
    fontFamily: "var(--cms-font-button)",
  };

  return (
    <div
      ref={ref}
      className="min-h-full"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* nav */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          fontFamily: "var(--cms-font-nav)",
          background: design.colors.primaryNavy,
          color: "#fff",
        }}
      >
        <span className="text-sm font-bold">SPM ECO System</span>
        <div className="flex items-center gap-4 text-xs opacity-90">
          <span>Platform</span>
          <span>Solution</span>
          <span>Contact</span>
        </div>
      </div>

      {/* hero */}
      <div
        className="relative overflow-hidden px-6 py-12"
        style={{ background: "var(--gradient-hero)", color: "#fff" }}
      >
        <div
          className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full blur-[90px]"
          style={{ background: design.colors.heroGlow, opacity: 0.3 }}
        />
        <span
          className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ background: "rgba(255,255,255,0.08)", color: design.colors.cyanAccent }}
        >
          {design.effects.heroGlow.enabled ? "AI-Powered Smart Parking" : "Smart Parking"}
        </span>
        <h1
          className="mt-4 max-w-xl"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: t.heroTitleSize * 0.62,
            fontWeight: t.headingWeight,
            lineHeight: t.lineHeight,
            letterSpacing: `${t.letterSpacing}em`,
          }}
        >
          Intelligent Parking. Seamless Mobility.
        </h1>
        <p
          className="mt-4 max-w-lg opacity-85"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: t.bodyTextSize,
            fontWeight: t.bodyWeight,
          }}
        >
          Real-time availability, ANPR access, dynamic pricing and multi-location analytics in one
          intelligent platform.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <button style={primaryBtn} className="inline-flex items-center gap-2">
            {design.buttons.primaryText ? "Request a Demo" : "Demo"}
            {b.enableArrow ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
          <button style={secondaryBtn}>Explore Platform</button>
        </div>
      </div>

      {/* cards */}
      <div className="grid gap-4 px-6 py-10 sm:grid-cols-3">
        {[
          { icon: Car, title: "ANPR Access", text: "Automated number-plate recognition." },
          { icon: Gauge, title: "Live Occupancy", text: "Real-time space availability." },
          { icon: ShieldCheck, title: "Secure Payments", text: "QR & card, end-to-end secure." },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-5"
            style={{
              background: "var(--card)",
              border: `1px solid ${design.colors.border}`,
              borderRadius: b.borderRadius + 6,
              boxShadow: design.effects.cardBorderGlow.enabled
                ? `0 18px 44px -24px ${design.colors.sectionGlow}`
                : "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-xl text-white"
              style={{
                background: `linear-gradient(120deg, ${design.colors.buttonGradientStart}, ${design.colors.buttonGradientEnd})`,
              }}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <h3
              className="mt-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: t.subheadingSize,
                fontWeight: t.headingWeight,
                color: "var(--foreground)",
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                color: design.colors.secondaryText,
                fontSize: t.smallTextSize,
                marginTop: 4,
              }}
            >
              {card.text}
            </p>
          </div>
        ))}
      </div>

      {/* form + state colors */}
      <div className="px-6 pb-12">
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--card)",
            border: `1px solid ${design.colors.border}`,
            borderRadius: b.borderRadius + 6,
          }}
        >
          <p style={{ fontSize: t.smallTextSize, fontWeight: 600, color: "var(--foreground)" }}>
            Form Label
          </p>
          <input
            className="mt-1.5 w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              border: `1px solid ${design.colors.border}`,
              background: "var(--background)",
              color: "var(--foreground)",
            }}
            placeholder="you@company.com"
            readOnly
          />
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white">
            <span className="rounded-full px-3 py-1" style={{ background: design.colors.success }}>
              Success
            </span>
            <span className="rounded-full px-3 py-1" style={{ background: design.colors.warning }}>
              Warning
            </span>
            <span className="rounded-full px-3 py-1" style={{ background: design.colors.error }}>
              Error
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
