import { ParkingSquare, Mail, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Container } from "./primitives";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Problem", to: "/problem" },
  { label: "Solution", to: "/solution" },
  { label: "Features", to: "/features" },
  { label: "Technology", to: "/technology" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Contact", to: "/contact" },
  { label: "Get the app", to: "/" },
] as const;

export function Footer() {
  const { site, contact } = usePublicSettings();
  const { config: langConfig, switcherEnabled, tt } = useLanguage();
  const showFooterSwitcher = switcherEnabled && langConfig.showInFooter;
  const links = LINKS;
  return (
    <footer className="bg-gradient-navy py-14 text-white">
      {/* language switcher (footer) rendered below when enabled */}
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-white">
                <ParkingSquare className="h-5 w-5" />
              </span>
              <span className="text-base font-bold">{tt(site.siteName)}</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              {tt(
                "A smart parking ecosystem for Sri Lanka, connecting driver discovery, booking and navigation with web administration, operational data and explainable intelligence.",
              )}
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-white/70">
              <a
                href={`mailto:${contact.primaryEmail}`}
                className="inline-flex items-center gap-2 hover:text-cyan"
              >
                <Mail className="h-4 w-4 text-cyan" />
                {contact.primaryEmail}
              </a>
              <a
                href={`tel:${contact.primaryPhone}`}
                className="inline-flex items-center gap-2 hover:text-cyan"
              >
                <Phone className="h-4 w-4 text-cyan" />
                {contact.primaryPhone}
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{tt("Explore")}</p>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    hash={l.label === "Get the app" ? "download-app" : undefined}
                    className="text-sm text-white/60 transition-colors hover:text-cyan"
                  >
                    {tt(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {showFooterSwitcher ? (
          <div className="mt-8 flex justify-center [&_button]:border-white/20 [&_button]:bg-white/5 [&_button]:text-white">
            <LanguageSwitcher variant="dropdown" />
          </div>
        ) : null}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} SPM ECO System —{" "}
          {tt("A University Technology Challenge Competition Project. All rights reserved.")}
        </div>
      </Container>
    </footer>
  );
}
