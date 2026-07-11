// Centralized public contact configuration.
//
// This is the single source of truth for contact details used across the public
// website (footer, contact section, floating WhatsApp button). Admin-editable
// values should override these defaults once wired to Firestore; until then the
// site reads from here so contact info is never hardcoded across components.
export interface SiteContact {
  primaryEmail: string;
  secondaryEmail?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber: string; // digits only, international format, no "+"
  whatsappMessage: string;
  whatsappLabel: string;
  whatsappTooltip: string;
  whatsappEnabled: boolean;
  address: string;
  mapsLink?: string;
  businessHours: string;
}

export const siteContact: SiteContact = {
  primaryEmail: "spmeco@spm.com",
  primaryPhone: "+94 70 000 0000",
  whatsappNumber: "94700000000",
  whatsappMessage: "Hello, I would like to learn more about the SPM ECO Smart Parking System.",
  whatsappLabel: "Chat with Us",
  whatsappTooltip: "Chat with Us",
  whatsappEnabled: true,
  address: "Colombo, Sri Lanka",
  businessHours: "Mon – Fri, 9:00 AM – 6:00 PM",
};

export function whatsappHref(contact: SiteContact = siteContact): string {
  const number = contact.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(contact.whatsappMessage)}`;
}
