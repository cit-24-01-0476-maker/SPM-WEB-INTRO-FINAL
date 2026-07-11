import { useEffect, useState } from "react";
import { Menu, X, ParkingSquare } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { CmsButton } from "./CmsButton";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { safeNavHref, type NavItem } from "@/lib/cms/model";

/**
 * Public site header. Logo, navigation items and the Request Demo CTA are all
 * driven by the published `navigation` CMS document (usePublicSettings), so a
 * single admin-managed source controls BOTH the desktop pill nav and the mobile
 * menu. Hardcoded defaults live in DEFAULT_NAVIGATION and are used only as a
 * safe fallback before Firestore data arrives.
 */
export function Navbar() {
  const { navigation, site } = usePublicSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);

      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : to.startsWith("/") && pathname.startsWith(to);

  const items = (navigation.items ?? []).filter((i) => i.enabled);
  const desktopItems = items.filter((i) => i.desktopVisible);
  const mobileItems = items.filter((i) => i.mobileVisible);

  const linkTarget = (item: NavItem) =>
    item.newTab ? { target: "_blank", rel: "noopener noreferrer" as const } : {};

  const logoText = navigation.logoText || site.siteName || "SPM ECO System";
  const logoSubtitle = navigation.logoSubtitle || "Smart Parking";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <nav className="relative mx-auto w-full max-w-6xl">
        {/* Ambient glow behind the floating island */}
        <div className="pointer-events-none absolute -z-10 left-1/4 top-1/2 h-24 w-32 -translate-y-1/2 rounded-full bg-primary/20 blur-[60px]" />
        <div className="pointer-events-none absolute -z-10 right-1/4 top-1/2 h-24 w-32 -translate-y-1/2 rounded-full bg-cyan/25 blur-[60px]" />

        {/* Floating navbar container */}
        <div
          className={cn(
            "relative flex items-center justify-between gap-4 rounded-2xl border px-4 py-2.5 transition-all duration-500 sm:px-6 sm:py-3",
            scrolled
              ? "glass border-border/50 shadow-card ring-1 ring-foreground/5"
              : "glass border-white/25 shadow-glow ring-1 ring-white/10",
          )}
        >
          {/* Logo lockup */}
          <a href="/" className="group flex shrink-0 items-center gap-2.5">
            {navigation.logoUrl ? (
              <img
                src={navigation.logoUrl}
                alt={logoText}
                className="h-9 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-white shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <ParkingSquare className="h-5 w-5" />
              </span>
            )}
            {!navigation.logoUrl ? (
              <span className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight text-foreground">
                  {logoText}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  {logoSubtitle}
                </span>
              </span>
            ) : null}
          </a>

          {/* Pill navigation (desktop) */}
          <div className="hidden items-center rounded-full border border-border/50 bg-secondary/50 p-1.5 lg:flex">
            {desktopItems.map((l) => {
              const active = isActive(l.to);
              return (
                <a
                  key={l.id}
                  href={safeNavHref(l.to)}
                  {...linkTarget(l)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                    active
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l.label}
                </a>
              );
            })}
          </div>

          {/* CTA section */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {navigation.showThemeToggle ? <ThemeToggle /> : null}
            {navigation.ctaEnabled ? (
              <CmsButton
                variant="primary"
                href={safeNavHref(navigation.ctaLink)}
                target={navigation.ctaNewTab ? "_blank" : undefined}
                rel={navigation.ctaNewTab ? "noopener noreferrer" : undefined}
                className="hidden min-h-[44px] text-sm font-bold uppercase tracking-wider sm:inline-flex"
              >
                {navigation.ctaLabel}
              </CmsButton>
            ) : null}
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Scroll progress bar */}
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px] overflow-hidden rounded-full bg-border/40">
            <div
              className="h-full rounded-full bg-gradient-primary shadow-[0_0_8px_var(--cyan)] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "mt-2 overflow-hidden rounded-2xl transition-[max-height,opacity] duration-500 ease-in-out lg:hidden",
            open
              ? "glass max-h-[80vh] border border-border/50 opacity-100 shadow-card"
              : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-1 p-4">
            {mobileItems.map((l) => {
              const active = isActive(l.to);
              return (
                <a
                  key={l.id}
                  href={safeNavHref(l.to)}
                  {...linkTarget(l)}
                  className={cn(
                    "flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {l.shortLabel || l.label}
                  {active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-primary" />
                  ) : null}
                </a>
              );
            })}
            {navigation.ctaEnabled ? (
              <a
                href={safeNavHref(navigation.ctaLink)}
                {...(navigation.ctaNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-1 flex min-h-[48px] items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wider text-white shadow-glow"
              >
                {navigation.ctaLabel}
              </a>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
