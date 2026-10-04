import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ParkingSquare, ArrowUpRight, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useParking } from "@/lib/parking/useParking";
import { money } from "@/lib/parking/billing";
const NAV = {
  driver: [
    ["/app", "Overview"],
    ["/app/parking", "Find Parking"],
    ["/app/bookings", "My Booking"],
    ["/app/navigation", "Navigation"],
    ["/app/session", "Parking Session"],
    ["/app/vehicles", "My Vehicles"],
    ["/app/wallet", "Wallet"],
    ["/app/history", "History"],
    ["/app/assistant", "Smart Assistant"],
    ["/app/demo", "Campus Demo"],
    ["/app/profile", "Profile"],
  ],
  provider: [
    ["/provider", "Overview"],
    ["/provider/facilities", "Facilities"],
    ["/provider/slots", "Spaces"],
    ["/provider/map", "Map Editor"],
    ["/provider/pricing", "Pricing"],
    ["/provider/bookings", "Bookings"],
    ["/provider/sessions", "Sessions"],
    ["/provider/transactions", "Transactions"],
    ["/provider/reports", "Reports"],
    ["/provider/settings", "Settings"],
  ],
  operations: [
    ["/parking-admin", "Overview"],
    ["/parking-admin/drivers", "Drivers"],
    ["/parking-admin/providers", "Providers"],
    ["/parking-admin/facilities", "Facilities"],
    ["/parking-admin/slots", "Spaces"],
    ["/parking-admin/bookings", "Bookings"],
    ["/parking-admin/sessions", "Sessions"],
    ["/parking-admin/transactions", "Transactions"],
    ["/parking-admin/verifications", "Verification Records"],
    ["/parking-admin/reports", "Reports"],
    ["/parking-admin/settings", "Settings"],
  ],
};
export function ProductShell({ area, children }: { area: keyof typeof NAV; children: ReactNode }) {
  const { state, run } = useParking();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const { tt } = useLanguage();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const name =
    area === "driver"
      ? "Driver App"
      : area === "provider"
        ? "Provider Portal"
        : "Parking Operations";
  return (
    <div className="parking-workspace">
      <header className="parking-topbar">
        <a href="/" className="parking-brand">
          <ParkingSquare size={30} />
          <strong>SPM ECO</strong>
        </a>
        <span className="parking-area-label">{tt(name)}</span>
        <div className="parking-top-actions">
          <LanguageSwitcher variant="dropdown" />
          {area === "driver" && state.currentDriverId && (
            <a href="/app/wallet" className="parking-wallet-badge">
              {money(state.wallets[state.currentDriverId] ?? 0)}
            </a>
          )}
          <button
            className="parking-menu-button"
            aria-label={open ? "Close product menu" : "Open product menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className="parking-workspace-grid">
        <aside className={`parking-sidebar ${open ? "is-open" : ""}`}>
          <p className="parking-sidebar-caption">{tt(name)}</p>
          <nav aria-label={`${name} navigation`}>
            {NAV[area].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={
                  pathname === href ||
                  (pathname.startsWith(href + "/") &&
                    href !== "/app" &&
                    href !== "/provider" &&
                    href !== "/parking-admin")
                    ? "active"
                    : ""
                }
                onClick={() => setOpen(false)}
              >
                {tt(label)}
                <ArrowUpRight size={15} />
              </a>
            ))}
          </nav>
          <div className="parking-switch-area">
            <p>{tt("Explore the prototype")}</p>
            <a href="/app">{tt("Driver App")}</a>
            <a href="/provider">{tt("Provider Portal")}</a>
            <a href="/parking-admin">{tt("Parking Operations")}</a>
            <a href="/">{tt("Public website")}</a>
          </div>
          {area === "driver" && state.currentDriverId && (
            <button
              className="parking-text-button"
              onClick={() => void run({ type: "LOGOUT" }, "Signed out of demo")}
            >
              {tt("Log out of demo")}
            </button>
          )}
          <div className="parking-sidebar-note">
            {tt(
              "Demo workspace. Fictional data, simulated payments and verification. No production access privileges.",
            )}
          </div>
        </aside>
        <main className="parking-main">
          <div className="parking-demo-banner">
            <span className="parking-demo-dot" />
            {tt("University prototype · Shared demo data · No real charges")}
          </div>
          {ready ? (
            children
          ) : (
            <section className="parking-panel" role="status" aria-live="polite">
              {tt("Loading shared demo workspace…")}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
