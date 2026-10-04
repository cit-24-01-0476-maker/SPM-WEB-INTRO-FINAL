import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { MotionLogo } from "./MotionLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const INTRO_KEY = "spm-welcome-drone-v5";

export function BrandIntro({ pathname }: { pathname: string }) {
  const [visible, setVisible] = useState(false);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<"scene" | "brand" | "exit">("scene");
  const skipRef = useRef<HTMLButtonElement>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(INTRO_KEY)) return;
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* The intro still works when browser storage is unavailable. */
    }
    setPlaying(false);
    setPhase("scene");
    setVisible(true);
  }, [pathname]);

  useEffect(() => {
    const replay = () => {
      setPlaying(false);
      setPhase("scene");
      setRun((value) => value + 1);
      setVisible(true);
    };
    window.addEventListener("spm:replay-intro", replay);
    return () => window.removeEventListener("spm:replay-intro", replay);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("spm-intro-running");
    skipRef.current?.focus({ preventScroll: true });
    const timer = window.setTimeout(() => setVisible(false), 20000);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
      // The intro contains one control, so keep keyboard focus on that control.
      if (event.key === "Tab") {
        event.preventDefault();
        skipRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("spm-intro-running");
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [visible, run]);

  useEffect(() => {
    if (!visible || phase === "scene") return;
    const timer = window.setTimeout(
      () => (phase === "brand" ? setPhase("exit") : setVisible(false)),
      phase === "brand" ? 1800 : 700,
    );
    return () => window.clearTimeout(timer);
  }, [visible, phase, run]);

  if (!visible) return null;
  return (
    <div
      key={run}
      className={`spm-brand-intro spm-real-intro spm-drone-intro${playing ? " is-playing" : ""}`}
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label="SPM ECO welcome"
    >
      <button ref={skipRef} className="spm-intro-skip" onClick={() => setVisible(false)}>
        {lang === "si" ? "මඟ හරින්න" : "Skip intro"}
        <X size={16} />
      </button>
      <video
        className="spm-intro-real-video"
        muted
        playsInline
        preload="auto"
        poster="/videos/spm-drone-poster.jpg"
        aria-hidden="true"
        onCanPlayThrough={(event) => {
          // Buffer enough footage before starting the reveal sequence.
          void event.currentTarget.play().catch(() => setVisible(false));
        }}
        onPlaying={() => setPlaying(true)}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= 5 && phase === "scene") setPhase("brand");
        }}
        onEnded={() => {
          if (phase === "scene") setPhase("brand");
        }}
        onError={(event) => {
          console.warn("SPM intro video could not play", event.currentTarget.error?.message);
          setVisible(false);
        }}
      >
        <source src="/videos/spm-drone-enhanced.webm" type="video/webm" />
        <source src="/videos/spm-drone-enhanced.mp4" type="video/mp4" />
      </video>
      {!playing && (
        <span className="spm-intro-loading" role="status">
          {lang === "si" ? "ඔබේ ගමන සූදානම් කරමින්…" : "Preparing your journey…"}
        </span>
      )}
      <div className="spm-intro-video-shade" aria-hidden="true" />
      <div className="spm-intro-brand">
        <span className="spm-intro-aura" aria-hidden="true" />
        <svg className="spm-intro-ring" viewBox="0 0 240 240" fill="none" aria-hidden="true">
          <circle cx="120" cy="120" r="112" pathLength="100" />
          <path d="M38 120H12M202 120H228M120 38V12M120 202V228" />
        </svg>
        <MotionLogo />
        <div className="spm-intro-wordmark">
          <span className="spm-wordmark-main">SPM</span> <span>ECO</span>
        </div>
        <p>
          {lang === "si"
            ? "සොයන්න. මඟ සොයාගන්න. පහසුවෙන් නවත්වන්න."
            : "Find. Navigate. Park Smarter."}
        </p>
        <span className="spm-intro-enter">
          {lang === "si" ? "ඔබේ ගමන මෙතැනින් ඇරඹේ" : "Your journey starts here"}
          <ArrowRight size={15} />
        </span>
      </div>
      <div className="spm-intro-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
