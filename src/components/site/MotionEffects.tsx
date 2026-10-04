import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const MOTION_PREFERENCE_KEY = "spm-background-motion-paused";

/** Decorative public-site motion. All content remains usable without this effect. */
export function MotionEffects({ pathname }: { pathname: string }) {
  const ambientRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(MOTION_PREFERENCE_KEY);
    } catch {
      // Motion preferences are optional when browser storage is unavailable.
    }
    setReducedMotion(preference.matches);
    setPaused(preference.matches || saved === "true");

    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPaused(true);
    };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const site = document.querySelector<HTMLElement>(".spm-public-site");
    if (!site) return;
    site.dataset.motionPaused = String(paused || reducedMotion);
    return () => {
      delete site.dataset.motionPaused;
    };
  }, [pathname, paused, reducedMotion]);

  const toggleMotion = () => {
    const next = !paused;
    setPaused(next);
    try {
      sessionStorage.setItem(MOTION_PREFERENCE_KEY, String(next));
    } catch {
      // The current page still honors the preference without persistence.
    }
  };

  const toggleLabel = reducedMotion
    ? lang === "si"
      ? "උපාංග සැකසුම් අනුව චලන අඩු කර ඇත"
      : "Motion reduced by device settings"
    : paused
      ? lang === "si"
        ? "චලන නැවත ආරම්භ කරන්න"
        : "Resume animations"
      : lang === "si"
        ? "චලන නවත්වන්න"
        : "Pause animations";

  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".spm-public-site main");
    if (!main) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const marked = new Set<HTMLElement>();
    const sections = new Set<HTMLElement>();
    let frame = 0;
    let observer: IntersectionObserver | undefined;

    const show = (element: HTMLElement) => {
      element.classList.add("eco-motion-shown");
      observer?.unobserve(element);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) show(entry.target as HTMLElement);
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
      );
    }

    const decorate = () => {
      main.querySelectorAll<HTMLElement>("section:not(.eco-hero)").forEach((section) => {
        section.classList.add("eco-motion-section");
        sections.add(section);
      });

      main
        .querySelectorAll<HTMLElement>("h2, .eco-journey-card > .parking-photo")
        .forEach((element) => {
          // The existing reveal hook owns these elements; keep its timing intact.
          if (marked.has(element) || element.closest(".reveal, .eco-hero")) return;
          marked.add(element);
          element.classList.add("eco-motion-reveal");

          if (
            preference.matches ||
            !observer ||
            element.getBoundingClientRect().top < innerHeight
          ) {
            show(element);
          } else {
            observer.observe(element);
          }
        });
    };

    const updatePreference = () => {
      if (preference.matches) marked.forEach(show);
    };
    const updateVisibility = () => {
      if (ambientRef.current) {
        ambientRef.current.dataset.paused = String(document.hidden);
      }
    };

    frame = requestAnimationFrame(decorate);
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(decorate);
    });
    mutations.observe(main, { childList: true, subtree: true });
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      mutations.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
      marked.forEach((element) => {
        element.classList.remove("eco-motion-reveal", "eco-motion-shown");
      });
      sections.forEach((element) => element.classList.remove("eco-motion-section"));
    };
  }, [pathname]);

  return (
    <>
      <div ref={ambientRef} className="eco-ambient-network" aria-hidden="true">
        <span className="eco-ambient-glow eco-ambient-glow-one" />
        <span className="eco-ambient-glow eco-ambient-glow-two" />
        <svg
          className="eco-network-lines"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M-70 150H86Q114 150 114 178V380Q114 408 142 408H252Q282 408 282 438V682Q282 710 312 710H386" />
            <path d="M-70 174H62Q90 174 90 202V408Q90 436 118 436H228Q258 436 258 464V734H342" />
            <path d="M1650 278H1460Q1426 278 1426 312V472Q1426 500 1398 500H1270Q1242 500 1242 528V818Q1242 846 1214 846H1162" />
            <path d="M1650 302H1484Q1450 302 1450 336V500Q1450 526 1422 526H1294Q1268 526 1268 554V842Q1268 872 1240 872H1190" />
            <path d="M-20 900H114Q146 900 146 868V812" />
            <path d="M1532 60V130Q1532 160 1502 160H1390" />
          </g>
          <g className="eco-network-junctions" fill="currentColor">
            <circle cx="114" cy="242" r="3" />
            <circle cx="252" cy="408" r="3" />
            <circle cx="282" cy="610" r="3" />
            <circle cx="1426" cy="388" r="3" />
            <circle cx="1270" cy="500" r="3" />
            <circle cx="1242" cy="746" r="3" />
          </g>
          <g className="eco-network-signal eco-network-signal-left" fill="#19c6f4">
            <circle cx="114" cy="245" r="5" />
            <circle cx="114" cy="245" r="14" fill="none" stroke="#19c6f4" strokeWidth="1" />
          </g>
          <g className="eco-network-signal eco-network-signal-right" fill="#176bff">
            <circle cx="1426" cy="390" r="5" />
            <circle cx="1426" cy="390" r="14" fill="none" stroke="#176bff" strokeWidth="1" />
          </g>
        </svg>
      </div>
      <button
        type="button"
        className="eco-motion-toggle"
        onClick={toggleMotion}
        disabled={reducedMotion}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
        <span className="eco-motion-toggle-label" aria-hidden="true">
          {toggleLabel}
        </span>
      </button>
    </>
  );
}
