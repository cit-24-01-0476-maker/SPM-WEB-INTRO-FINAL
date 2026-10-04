import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { MotionLogo } from "./MotionLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const INTRO_KEY = "spm-welcome-seen-v1";

export function BrandIntro({ pathname }: { pathname: string }) {
  const [visible, setVisible] = useState(false);
  const [run, setRun] = useState(0);
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
    setVisible(true);
  }, [pathname]);

  useEffect(() => {
    const replay = () => {
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
    const timer = window.setTimeout(() => setVisible(false), 3400);
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

  if (!visible) return null;
  return (
    <div
      key={run}
      className="spm-brand-intro"
      role="dialog"
      aria-modal="true"
      aria-label="SPM ECO welcome"
    >
      <button ref={skipRef} className="spm-intro-skip" onClick={() => setVisible(false)}>
        {lang === "si" ? "මඟ හරින්න" : "Skip intro"}
        <X size={16} />
      </button>
      <div className="spm-intro-horizon" aria-hidden="true" />
      <div className="spm-intro-city" aria-hidden="true">
        {[44, 72, 110, 62, 138, 84, 120, 52].map((height, index) => (
          <i key={index} style={{ height: `${height}px` }} />
        ))}
      </div>
      <div className="spm-intro-road" aria-hidden="true">
        <div className="spm-intro-road-edge" />
        <div className="spm-intro-lane spm-intro-lane-left" />
        <div className="spm-intro-lane spm-intro-lane-right" />
      </div>
      <div className="spm-intro-car" aria-hidden="true">
        <svg viewBox="0 0 160 260" fill="none">
          <path
            d="M26 64Q24 30 47 16Q80 3 113 16Q136 30 134 64L141 213Q138 241 116 247H44Q22 241 19 213Z"
            fill="#143b6b"
            stroke="#68dbff"
            strokeWidth="2"
          />
          <path d="M40 65Q80 43 120 65L113 99H47Z" fill="#07203c" stroke="#3e95cb" />
          <path d="M47 111H113L117 175Q80 187 43 175Z" fill="#0b294a" stroke="#3e95cb" />
          <path d="M44 187Q80 200 116 187L118 213H42Z" fill="#06182c" />
          <path
            d="M29 42L52 32M108 32L131 42"
            stroke="#d4f7ff"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M29 225H50M110 225H131" stroke="#19c6f4" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M17 90L9 92M143 90L151 92"
            stroke="#7cbbef"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M55 24H105M36 111V167M124 111V167" stroke="#4e8bba" strokeWidth="2" />
        </svg>
        <span className="spm-intro-headlights" />
      </div>
      <div className="spm-intro-brand">
        <MotionLogo />
        <div className="spm-intro-wordmark">
          SPM <span>ECO</span>
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
