// Shared UI-string dictionary for the public website.
//
// These are interface strings (buttons, form labels, validation, empty/loading
// states) that are the same across the whole site and are NOT part of the
// CMS-editable marketing content. Each entry has a real English and Sinhala
// translation. Marketing/section content is translated through the CMS
// (Localized fields) instead.
//
// Add keys here rather than hardcoding English strings in components so the
// language switcher covers the entire interface, not just headings.

import type { LanguageCode } from "@/lib/cms/model";

export type UIStringKey =
  // Navigation / header
  | "nav.requestDemo"
  | "nav.demoShort"
  | "nav.openMenu"
  | "nav.closeMenu"
  | "nav.language"
  | "nav.selectLanguage"
  // Generic actions
  | "action.submit"
  | "action.sending"
  | "action.learnMore"
  | "action.readMore"
  | "action.getStarted"
  | "action.contactUs"
  | "action.explore"
  // Contact form labels
  | "form.fullName"
  | "form.organization"
  | "form.email"
  | "form.phone"
  | "form.facilityType"
  | "form.parkingCapacity"
  | "form.numberOfLocations"
  | "form.preferredContact"
  | "form.preferredMethod"
  | "form.projectRequirement"
  | "form.message"
  | "form.privacyConsent"
  | "form.submit"
  | "form.optional"
  // Contact form states
  | "form.sending"
  | "form.success"
  | "form.successBody"
  | "form.error"
  | "form.errorBody"
  // Validation
  | "validate.required"
  | "validate.nameShort"
  | "validate.emailInvalid"
  | "validate.phoneInvalid"
  | "validate.messageShort"
  | "validate.consent"
  // Contact methods
  | "method.whatsapp"
  | "method.phone"
  | "method.email"
  // WhatsApp / misc
  | "whatsapp.label"
  | "whatsapp.chooseContact"
  // States
  | "state.loading"
  | "state.empty";

type Dictionary = Record<UIStringKey, Record<LanguageCode, string>>;

export const UI_STRINGS: Dictionary = {
  "nav.requestDemo": { en: "Request Demo", si: "ඩෙමෝවක් ඉල්ලන්න" },
  "nav.demoShort": { en: "Demo", si: "ඩෙමෝ" },
  "nav.openMenu": { en: "Open menu", si: "මෙනුව විවෘත කරන්න" },
  "nav.closeMenu": { en: "Close menu", si: "මෙනුව වසන්න" },
  "nav.language": { en: "Language", si: "භාෂාව" },
  "nav.selectLanguage": { en: "Select language", si: "භාෂාව තෝරන්න" },

  "action.submit": { en: "Submit", si: "යොමු කරන්න" },
  "action.sending": { en: "Sending…", si: "යවමින්…" },
  "action.learnMore": { en: "Learn more", si: "වැඩිදුර බලන්න" },
  "action.readMore": { en: "Read more", si: "තවත් කියවන්න" },
  "action.getStarted": { en: "Get started", si: "ආරම්භ කරන්න" },
  "action.contactUs": { en: "Contact us", si: "අප හා සම්බන්ධ වන්න" },
  "action.explore": { en: "Explore the platform", si: "වේදිකාව ගවේෂණය කරන්න" },

  "form.fullName": { en: "Full Name", si: "සම්පූර්ණ නම" },
  "form.organization": { en: "Organization", si: "ආයතනය" },
  "form.email": { en: "Business Email", si: "ව්‍යාපාරික විද්‍යුත් තැපෑල" },
  "form.phone": { en: "Phone / WhatsApp", si: "දුරකථනය / WhatsApp" },
  "form.facilityType": { en: "Facility Type", si: "පහසුකම් වර්ගය" },
  "form.parkingCapacity": { en: "Estimated Parking Capacity", si: "ඇස්තමේන්තුගත රථගාල ධාරිතාව" },
  "form.numberOfLocations": { en: "Number of Locations", si: "ස්ථාන ගණන" },
  "form.preferredContact": { en: "Preferred Contact Person", si: "කැමති සම්බන්ධතා පුද්ගලයා" },
  "form.preferredMethod": { en: "Preferred Contact Method", si: "කැමති සම්බන්ධතා ක්‍රමය" },
  "form.projectRequirement": { en: "Project Requirement", si: "ව්‍යාපෘති අවශ්‍යතාව" },
  "form.message": { en: "Message", si: "පණිවිඩය" },
  "form.privacyConsent": {
    en: "I agree to be contacted about my inquiry.",
    si: "මගේ විමසීම සම්බන්ධයෙන් සම්බන්ධ වීමට මම එකඟ වෙමි.",
  },
  "form.submit": { en: "Send Inquiry", si: "විමසීම යවන්න" },
  "form.optional": { en: "Optional", si: "අත්‍යවශ්‍ය නොවේ" },

  "form.sending": { en: "Sending your inquiry…", si: "ඔබගේ විමසීම යවමින්…" },
  "form.success": { en: "Inquiry sent", si: "විමසීම යවන ලදී" },
  "form.successBody": {
    en: "Thank you. Our team will contact you shortly.",
    si: "ස්තූතියි. අපගේ කණ්ඩායම ඉක්මනින් ඔබ හා සම්බන්ධ වනු ඇත.",
  },
  "form.error": { en: "Could not submit inquiry", si: "විමසීම යැවිය නොහැකි විය" },
  "form.errorBody": {
    en: "Please try again in a moment.",
    si: "කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.",
  },

  "validate.required": { en: "This field is required.", si: "මෙම ක්ෂේත්‍රය අවශ්‍යයි." },
  "validate.nameShort": {
    en: "Please enter your full name.",
    si: "කරුණාකර ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න.",
  },
  "validate.emailInvalid": {
    en: "Please enter a valid email address.",
    si: "කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.",
  },
  "validate.phoneInvalid": {
    en: "Please enter a valid phone number.",
    si: "කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.",
  },
  "validate.messageShort": {
    en: "Please enter a short message.",
    si: "කරුණාකර කෙටි පණිවිඩයක් ඇතුළත් කරන්න.",
  },
  "validate.consent": {
    en: "Please accept the privacy consent to continue.",
    si: "ඉදිරියට යාමට කරුණාකර පෞද්ගලිකත්ව එකඟතාව පිළිගන්න.",
  },

  "method.whatsapp": { en: "WhatsApp", si: "WhatsApp" },
  "method.phone": { en: "Phone", si: "දුරකථනය" },
  "method.email": { en: "Email", si: "විද්‍යුත් තැපෑල" },

  "whatsapp.label": { en: "Chat on WhatsApp", si: "WhatsApp හි කතාබස් කරන්න" },
  "whatsapp.chooseContact": { en: "Choose a contact", si: "සම්බන්ධතාවක් තෝරන්න" },

  "state.loading": { en: "Loading…", si: "පූරණය වෙමින්…" },
  "state.empty": { en: "Nothing to show yet.", si: "තවම පෙන්වීමට කිසිවක් නැත." },
};

export function translateUI(key: UIStringKey, lang: LanguageCode): string {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  const active = entry[lang];
  if (active && active.trim() !== "") return active;
  return entry.en ?? key;
}
