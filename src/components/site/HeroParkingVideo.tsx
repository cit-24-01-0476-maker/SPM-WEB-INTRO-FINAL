import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ScanLine,
  LayoutDashboard,
  CheckCircle2,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import posterImg from "@/assets/hero-parking-poster.jpg";
import heroVideo from "@/assets/hero-parking.mp4.asset.json";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const CYCLE = 15; // seconds per demonstration loop

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Drives the demonstration timeline (seconds within the current loop) and the
 * total elapsed seconds. Pauses when the element is off-screen for performance.
 */
function useDemoTimeline(active: boolean, reduced: boolean) {
  const [t, setT] = useState(reduced ? CYCLE - 1 : 0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (reduced || !active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const secs = (now - start) / 1000;
      setElapsed(secs);
      setT(secs % CYCLE);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  return { t, elapsed };
}

function LiveStatusBadge() {
  const { tt } = useLanguage();
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan backdrop-blur">
      <span className="relative flex h-1.5 w-1.5">
        <span className="live-ping absolute inline-flex h-full w-full rounded-full bg-success" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
      </span>
      {tt("Live System Preview")}
    </span>
  );
}

function StatusRow({ label, value, done }: { label: string; value: string; done: boolean }) {
  const { tt } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-white/55">{tt(label)}</span>
      <span
        className={`inline-flex items-center gap-1 font-semibold transition-colors duration-500 ${
          done ? "text-[#7ff0c0]" : "text-white/35"
        }`}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : null}
        {done ? tt(value) : "···"}
      </span>
    </div>
  );
}

function LiveAnprCard({ t }: { t: number }) {
  const { tt } = useLanguage();
  const scanning = t < 4;
  const plateDetected = t >= 4;
  const classified = t >= 6;
  const verified = t >= 8;
  const approved = t >= 10;

  return (
    <div className="glass-dark absolute left-3 top-3 w-[8.75rem] rounded-2xl border border-white/10 p-3 text-white shadow-[0_16px_44px_-20px_rgba(3,12,24,0.75)] sm:left-5 sm:top-5 sm:w-[13.5rem] sm:p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan sm:text-[11px]">
        {scanning ? (
          <ScanLine className="h-4 w-4 shrink-0" />
        ) : (
          <Camera className="h-4 w-4 shrink-0" />
        )}
        {scanning ? tt("Scanning Vehicle") : tt("ANPR Detected")}
      </div>

      {/* Plate box with scanning line */}
      <div className="relative mt-3 overflow-hidden rounded-lg border border-white/15 bg-navy/50 px-2 py-2.5 text-center">
        {scanning ? (
          <span className="anpr-scan-line pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-cyan/80 shadow-[0_0_10px_2px_rgba(24,200,255,0.6)]" />
        ) : null}
        <span
          className={`font-mono text-lg font-bold tracking-[0.18em] transition-all duration-500 sm:text-xl ${
            plateDetected ? "text-white blur-0" : "text-white/40 blur-[3px]"
          }`}
        >
          {plateDetected ? "CAA-4582" : "•••-••••"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <StatusRow label="Category" value="Pre-Booked" done={classified} />
        <StatusRow label="Booking" value="Verified" done={verified} />
        <StatusRow label="Access" value="Approved" done={approved} />
      </div>

      {/* Barrier gate opening indicator */}
      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-[10px] font-medium sm:text-[11px]">
        <ShieldCheck
          className={`h-3.5 w-3.5 shrink-0 transition-colors duration-500 ${
            approved ? "text-[#7ff0c0]" : "text-white/35"
          }`}
        />
        <span className={approved ? "text-white/80" : "text-white/40"}>
          {approved ? tt("Demo entry approved") : tt("Awaiting Verification")}
        </span>
      </div>
    </div>
  );
}

function LiveOccupancyCard({ elapsed }: { elapsed: number }) {
  const { tt } = useLanguage();
  const available = 138 - (Math.floor(elapsed / 5) % 3); // 138 / 137 / 136
  const total = 420;
  const occupied = 246;
  const occupiedPct = Math.round((occupied / total) * 100);

  return (
    <div className="glass-dark absolute bottom-3 right-3 w-[8.75rem] rounded-2xl border border-white/10 p-3 text-white shadow-[0_16px_44px_-20px_rgba(3,12,24,0.75)] sm:bottom-5 sm:right-5 sm:w-[13rem] sm:p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan sm:text-[11px]">
        <LayoutDashboard className="h-4 w-4 shrink-0" /> {tt("Live Occupancy")}
      </div>

      <p className="mt-2.5 text-xl font-bold tabular-nums sm:text-[1.6rem]">
        {available} <span className="text-sm font-medium text-white/60">{tt("Available")}</span>
      </p>
      <p className="text-[11px] text-white/60 sm:text-xs">{tt("Colombo Fort · Zone A")}</p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-gradient-primary transition-[width] duration-700 ease-out"
          style={{ width: `${occupiedPct}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[10px] sm:text-[11px]">
        <div>
          <p className="font-bold text-white">{total}</p>
          <p className="text-white/50">{tt("Capacity")}</p>
        </div>
        <div>
          <p className="font-bold text-white">{occupied}</p>
          <p className="text-white/50">{tt("Occupied")}</p>
        </div>
        <div>
          <p className="font-bold text-white">36</p>
          <p className="text-white/50">{tt("Reserved")}</p>
        </div>
      </div>

      <p className="mt-2.5 flex items-center gap-1 text-[9px] leading-tight text-white/40 sm:text-[10px]">
        <BadgeCheck className="h-3 w-3 shrink-0" />{" "}
        {tt("Demonstration data — not verified live facility information.")}
      </p>
    </div>
  );
}

export function HeroParkingVideo() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(true);
  const { t, elapsed } = useDemoTimeline(inView, reduced);

  // Pause video + timeline when off-screen (performance / battery).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    if (inView) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView, reduced]);

  return (
    <div ref={wrapRef} className="reveal is-visible relative flex flex-col gap-3.5">
      <div className="px-1">
        <LiveStatusBadge />
      </div>

      <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-glow transition-shadow duration-500 hover:shadow-[0_0_0_1px_rgba(24,200,255,0.35),0_36px_90px_-24px_rgba(24,200,255,0.35)]">
        {reduced ? (
          <img
            src={posterImg}
            alt="Smart parking arrival concept illustration"
            width={1600}
            height={912}
            className="aspect-[16/10] h-full w-full object-cover object-center"
          />
        ) : (
          <video
            ref={videoRef}
            className="aspect-[16/10] h-full w-full object-cover object-center brightness-[0.96] transition-[filter] duration-500 group-hover:brightness-105"
            poster={posterImg}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Live smart parking system demonstration: vehicle arrival, ANPR plate detection, gate approval and occupancy update"
          >
            <source src={heroVideo.url} type="video/mp4" />
            {/* Fallback for browsers that cannot play the video */}
            <img
              src={posterImg}
              alt="Smart parking arrival concept illustration"
              width={1600}
              height={912}
            />
          </video>
        )}

        {/* Subtle dark-blue overlay — light enough to keep the full scene visible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/0 to-navy/15" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy/25 to-transparent" />

        <LiveAnprCard t={t} />
        <LiveOccupancyCard elapsed={elapsed} />
      </div>
    </div>
  );
}
