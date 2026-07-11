import { useEffect, useRef, useState } from "react";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { contactWhatsappLink, visibleContacts, type ContactPerson } from "@/lib/cms/model";

/**
 * Premium floating WhatsApp button for the public website.
 *
 * - Reads all configuration from the PUBLISHED contact settings (admin-editable).
 * - If exactly one WhatsApp-enabled contact exists, clicking opens it directly.
 * - If more than one, clicking opens a small contact selector.
 * - Never hardcodes a number or contact.
 */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"
      />
    </svg>
  );
}

export function WhatsAppButton() {
  const { contact } = usePublicSettings();
  const wa = contact.whatsapp;
  const waContacts = visibleContacts(contact.contacts).filter(
    (c) => c.whatsappEnabled && c.whatsappNumber,
  );
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!wa.enabled || waContacts.length === 0) return null;

  const onLeft = wa.desktopPosition === "left";
  const single = waContacts.length === 1 ? waContacts[0] : null;

  const openContact = (c: ContactPerson) => {
    window.open(contactWhatsappLink(c), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="fixed z-50"
      style={{
        right: onLeft ? undefined : "max(1rem, env(safe-area-inset-right))",
        left: onLeft ? "max(1rem, env(safe-area-inset-left))" : undefined,
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      {open && !single ? (
        <div
          role="menu"
          aria-label="Choose a contact"
          className={`absolute bottom-16 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-glow ${
            onLeft ? "left-0" : "right-0"
          }`}
        >
          <div className="border-b border-border bg-secondary/50 px-4 py-3">
            <p className="text-sm font-bold text-foreground">Chat on WhatsApp</p>
            <p className="text-xs text-muted-foreground">{wa.onlineLabel}</p>
          </div>
          <ul className="max-h-72 overflow-y-auto p-1.5">
            {waContacts.map((c) => (
              <li key={c.id}>
                <button
                  role="menuitem"
                  onClick={() => openContact(c)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ background: c.accentColor }}
                  >
                    {c.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {c.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{c.role}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {single ? (
        <a
          href={contactWhatsappLink(single)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with ${single.name} on WhatsApp`}
          className={`group flex items-center gap-2 rounded-full px-3.5 shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-all duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 active:scale-95 ${
            shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ background: wa.background, color: wa.iconColor, minHeight: 56 }}
        >
          <span className="relative grid h-9 w-9 place-items-center">
            {wa.pulse ? (
              <span
                className="absolute inset-[-6px] rounded-full opacity-40 motion-safe:animate-ping"
                style={{ background: wa.background }}
              />
            ) : null}
            <WhatsAppIcon className="relative h-7 w-7" />
          </span>
          <span className="hidden pr-1 text-sm font-semibold sm:inline">{wa.label}</span>
        </a>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={wa.tooltip}
          className={`group flex items-center gap-2 rounded-full px-3.5 shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-all duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 active:scale-95 ${
            shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ background: wa.background, color: wa.iconColor, minHeight: 56 }}
        >
          <span className="relative grid h-9 w-9 place-items-center">
            {wa.pulse && !open ? (
              <span
                className="absolute inset-[-6px] rounded-full opacity-40 motion-safe:animate-ping"
                style={{ background: wa.background }}
              />
            ) : null}
            <WhatsAppIcon className="relative h-7 w-7" />
          </span>
          <span className="hidden pr-1 text-sm font-semibold sm:inline">{wa.label}</span>
        </button>
      )}
    </div>
  );
}
