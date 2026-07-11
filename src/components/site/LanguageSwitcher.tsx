// Public language switcher.
//
// Accessible EN / සිංහල selector driven entirely by the published language
// settings. Renders nothing when the switcher is disabled or fewer than two
// languages are enabled, so no empty space is left in the header.
//
// Two layouts:
//   - "dropdown" (default): compact button + menu for the desktop header.
//   - "list": full-width stacked options for the mobile navigation drawer.

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { LanguageCode } from "@/lib/cms/model";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "list";
  className?: string;
  onSelect?: () => void;
}

export function LanguageSwitcher({
  variant = "dropdown",
  className,
  onSelect,
}: LanguageSwitcherProps) {
  const { lang, setLang, config, switcherEnabled, available, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hide entirely when disabled or nothing meaningful to switch between.
  if (!switcherEnabled || available.length < 2) return null;

  const style = config.style;
  const label = (c: LanguageCode) => config.labels[c] || (c === "si" ? "සිංහල" : "English");
  const shortLabel = (c: LanguageCode) => config.shortLabels[c] || (c === "si" ? "සිං" : "EN");

  const choose = (c: LanguageCode) => {
    setLang(c);
    setOpen(false);
    onSelect?.();
  };

  if (variant === "list") {
    return (
      <div
        className={cn("flex flex-col gap-1", className)}
        role="group"
        aria-label={t("nav.selectLanguage")}
      >
        {available.map((c) => {
          const active = c === lang;
          return (
            <button
              key={c}
              type="button"
              lang={c}
              onClick={() => choose(c)}
              aria-pressed={active}
              className={cn(
                "flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                {style.showIcon ? <Globe className="h-4 w-4" /> : null}
                {label(c)}
              </span>
              {active ? <Check className="h-4 w-4 text-primary" /> : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("nav.selectLanguage")}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        {style.showIcon ? <Globe className="h-4 w-4 shrink-0" /> : null}
        {style.showLanguageCode ? <span lang={lang}>{shortLabel(lang)}</span> : null}
        {style.showLanguageName ? <span lang={lang}>{label(lang)}</span> : null}
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-card"
        >
          {available.map((c) => {
            const active = c === lang;
            return (
              <button
                key={c}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                lang={c}
                onClick={() => choose(c)}
                className={cn(
                  "flex w-full min-h-[40px] items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span>{label(c)}</span>
                {active ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
