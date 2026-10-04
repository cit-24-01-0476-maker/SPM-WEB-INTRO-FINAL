// SPM ECO System — CMS data model.
//
// Central type definitions, safe default values, presets and field metadata
// for the Firestore-backed website customization layer (Phase 2).
//
// The public website reads ONLY the `published` object of each settings doc.
// The admin Design Studio edits the `draft` object. Publishing copies draft
// into published. Safe defaults below are used whenever a document or field is
// missing so the public website never renders undefined values or crashes.

import {
  DEFAULT_EF_INPUTS,
  DEFAULT_EF_SCENARIOS,
  DEFAULT_EF_THRESHOLDS,
  type EFInputs,
  type EFScenarios,
  type EFThresholds,
} from "@/lib/roi/calc";

/* ------------------------------------------------------------------ *
 * DESIGN — colors                                                     *
 * ------------------------------------------------------------------ */

export type ColorKey =
  | "primaryNavy"
  | "deepBlue"
  | "techBlue"
  | "cyanAccent"
  | "lightBackground"
  | "whiteSurface"
  | "mainText"
  | "secondaryText"
  | "border"
  | "success"
  | "warning"
  | "error"
  | "cardBackground"
  | "adminSidebar"
  | "buttonGradientStart"
  | "buttonGradientEnd"
  | "heroGlow"
  | "sectionGlow";

export type DesignColors = Record<ColorKey, string>;

export const COLOR_FIELDS: Array<{ key: ColorKey; label: string; group: string }> = [
  { key: "primaryNavy", label: "Primary Navy", group: "Brand" },
  { key: "deepBlue", label: "Deep Blue", group: "Brand" },
  { key: "techBlue", label: "Technology Blue", group: "Brand" },
  { key: "cyanAccent", label: "Cyan Accent", group: "Brand" },
  { key: "lightBackground", label: "Light Background", group: "Surfaces" },
  { key: "whiteSurface", label: "White Surface", group: "Surfaces" },
  { key: "cardBackground", label: "Card Background", group: "Surfaces" },
  { key: "adminSidebar", label: "Admin Sidebar", group: "Surfaces" },
  { key: "mainText", label: "Main Text", group: "Text" },
  { key: "secondaryText", label: "Secondary Text", group: "Text" },
  { key: "border", label: "Border", group: "Text" },
  { key: "success", label: "Success", group: "State" },
  { key: "warning", label: "Warning", group: "State" },
  { key: "error", label: "Error", group: "State" },
  { key: "buttonGradientStart", label: "Button Gradient Start", group: "Accents" },
  { key: "buttonGradientEnd", label: "Button Gradient End", group: "Accents" },
  { key: "heroGlow", label: "Hero Glow", group: "Accents" },
  { key: "sectionGlow", label: "Section Glow", group: "Accents" },
];

export const DEFAULT_COLORS: DesignColors = {
  primaryNavy: "#06182c",
  deepBlue: "#0b2d57",
  techBlue: "#176bff",
  cyanAccent: "#19c6f4",
  lightBackground: "#f4f7fb",
  whiteSurface: "#ffffff",
  mainText: "#0a1728",
  secondaryText: "#5e6c7e",
  border: "#dce5ef",
  success: "#16a66a",
  warning: "#f5a524",
  error: "#e5484d",
  cardBackground: "#ffffff",
  adminSidebar: "#06182c",
  buttonGradientStart: "#176bff",
  buttonGradientEnd: "#19c6f4",
  heroGlow: "#176bff",
  sectionGlow: "#19c6f4",
};

export interface ColorPreset {
  id: string;
  name: string;
  colors: Partial<DesignColors>;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "enterprise-blue",
    name: "Enterprise Blue",
    colors: { ...DEFAULT_COLORS },
  },
  {
    id: "midnight-technology",
    name: "Midnight Technology",
    colors: {
      primaryNavy: "#050b1a",
      deepBlue: "#0d1b3a",
      techBlue: "#3d7bff",
      cyanAccent: "#22d3ee",
      lightBackground: "#f2f5fb",
      buttonGradientStart: "#3d7bff",
      buttonGradientEnd: "#22d3ee",
      heroGlow: "#3d7bff",
      sectionGlow: "#22d3ee",
    },
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    colors: {
      primaryNavy: "#04202b",
      deepBlue: "#0a3d4d",
      techBlue: "#0e8fb3",
      cyanAccent: "#2ee6c8",
      lightBackground: "#eef7f8",
      buttonGradientStart: "#0e8fb3",
      buttonGradientEnd: "#2ee6c8",
      heroGlow: "#0e8fb3",
      sectionGlow: "#2ee6c8",
    },
  },
  {
    id: "urban-intelligence",
    name: "Urban Intelligence",
    colors: {
      primaryNavy: "#181528",
      deepBlue: "#2a2450",
      techBlue: "#6d5efc",
      cyanAccent: "#42dcff",
      lightBackground: "#f5f4fb",
      buttonGradientStart: "#6d5efc",
      buttonGradientEnd: "#42dcff",
      heroGlow: "#6d5efc",
      sectionGlow: "#42dcff",
    },
  },
  {
    id: "arctic-mobility",
    name: "Arctic Mobility",
    colors: {
      primaryNavy: "#0b2233",
      deepBlue: "#124a63",
      techBlue: "#1e9bd7",
      cyanAccent: "#5fe3ff",
      lightBackground: "#f0f8fc",
      whiteSurface: "#ffffff",
      buttonGradientStart: "#1e9bd7",
      buttonGradientEnd: "#5fe3ff",
      heroGlow: "#1e9bd7",
      sectionGlow: "#5fe3ff",
    },
  },
  {
    id: "slate-professional",
    name: "Slate Professional",
    colors: {
      primaryNavy: "#1a2230",
      deepBlue: "#31404f",
      techBlue: "#4f7fa8",
      cyanAccent: "#78b7c9",
      lightBackground: "#f4f6f8",
      buttonGradientStart: "#4f7fa8",
      buttonGradientEnd: "#78b7c9",
      heroGlow: "#4f7fa8",
      sectionGlow: "#78b7c9",
    },
  },
  {
    id: "cyan-precision",
    name: "Cyan Precision",
    colors: {
      primaryNavy: "#032027",
      deepBlue: "#064e5c",
      techBlue: "#0aa6c2",
      cyanAccent: "#19f0e6",
      lightBackground: "#eefafb",
      buttonGradientStart: "#0aa6c2",
      buttonGradientEnd: "#19f0e6",
      heroGlow: "#0aa6c2",
      sectionGlow: "#19f0e6",
    },
  },
  {
    id: "navy-corporate",
    name: "Navy Corporate",
    colors: {
      primaryNavy: "#0a1a3a",
      deepBlue: "#12295c",
      techBlue: "#2455c4",
      cyanAccent: "#3aa0e8",
      lightBackground: "#f3f6fc",
      buttonGradientStart: "#2455c4",
      buttonGradientEnd: "#3aa0e8",
      heroGlow: "#2455c4",
      sectionGlow: "#3aa0e8",
    },
  },
];

/* ------------------------------------------------------------------ *
 * DESIGN — typography                                                 *
 * ------------------------------------------------------------------ */

export const SAFE_FONTS = [
  "Manrope",
  "Inter",
  "Geist",
  "Plus Jakarta Sans",
  "DM Sans",
  "Sora",
  "Urbanist",
  "Space Grotesk",
] as const;
export type SafeFont = (typeof SAFE_FONTS)[number];

// Google Fonts CSS2 hrefs for the fixed, safe font allow-list. Only these
// families can be loaded — no arbitrary URLs (prevents script/style injection).
export const FONT_HREFS: Record<SafeFont, string> = {
  Manrope: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  Geist: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap",
  "Plus Jakarta Sans":
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  "DM Sans":
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap",
  Sora: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap",
  Urbanist:
    "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap",
  "Space Grotesk":
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
};

export interface DesignTypography {
  headingFont: string;
  bodyFont: string;
  navFont: string;
  buttonFont: string;
  heroTitleSize: number; // px
  sectionTitleSize: number;
  subheadingSize: number;
  bodyTextSize: number;
  smallTextSize: number;
  headingWeight: number;
  bodyWeight: number;
  lineHeight: number;
  letterSpacing: number; // em
  mobileScale: number;
  tabletScale: number;
  desktopScale: number;
}

export const DEFAULT_TYPOGRAPHY: DesignTypography = {
  headingFont: "Manrope",
  bodyFont: "Inter",
  navFont: "Inter",
  buttonFont: "Inter",
  heroTitleSize: 72,
  sectionTitleSize: 40,
  subheadingSize: 22,
  bodyTextSize: 16,
  smallTextSize: 13,
  headingWeight: 800,
  bodyWeight: 400,
  lineHeight: 1.5,
  letterSpacing: -0.02,
  mobileScale: 0.85,
  tabletScale: 0.92,
  desktopScale: 1,
};

/* ------------------------------------------------------------------ *
 * DESIGN — buttons                                                    *
 * ------------------------------------------------------------------ */

export interface DesignButtons {
  primaryBg: string;
  primaryText: string;
  secondaryBg: string;
  secondaryText: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontWeight: number;
  shadow: number; // 0-100 intensity
  hoverElevation: number; // px
  disabledOpacity: number; // 0-1
  pressScale: number; // 0.8-1
  enableShine: boolean;
  enableHoverLift: boolean;
  enableGlow: boolean;
  enableArrow: boolean;
  enablePress: boolean;
}

export const DEFAULT_BUTTONS: DesignButtons = {
  primaryBg: "#176bff",
  primaryText: "#ffffff",
  secondaryBg: "#eef3fa",
  secondaryText: "#0b2d57",
  borderColor: "#dce5ef",
  borderWidth: 1,
  borderRadius: 10,
  paddingX: 24,
  paddingY: 14,
  fontWeight: 600,
  shadow: 45,
  hoverElevation: 2,
  disabledOpacity: 0.5,
  pressScale: 0.96,
  enableShine: true,
  enableHoverLift: true,
  enableGlow: true,
  enableArrow: true,
  enablePress: true,
};

/* ------------------------------------------------------------------ *
 * DESIGN — effects                                                    *
 * ------------------------------------------------------------------ */

export type EffectKey =
  | "heroGlow"
  | "backgroundGrid"
  | "cardGlass"
  | "cardBorderGlow"
  | "spotlightHover"
  | "imageReveal"
  | "sectionGradient"
  | "grainTexture"
  | "animatedCounters"
  | "floatingCards"
  | "dashboardTransitions"
  | "pageTransition";

export interface EffectConfig {
  enabled: boolean;
  intensity: number; // 0-100
  speed: number; // 0-100
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export const EFFECT_FIELDS: Array<{ key: EffectKey; label: string }> = [
  { key: "heroGlow", label: "Hero Glow" },
  { key: "backgroundGrid", label: "Background Grid" },
  { key: "cardGlass", label: "Card Glass Effect" },
  { key: "cardBorderGlow", label: "Card Border Glow" },
  { key: "spotlightHover", label: "Spotlight Hover" },
  { key: "imageReveal", label: "Image Reveal" },
  { key: "sectionGradient", label: "Section Gradient" },
  { key: "grainTexture", label: "Grain Texture" },
  { key: "animatedCounters", label: "Animated Counters" },
  { key: "floatingCards", label: "Floating Interface Cards" },
  { key: "dashboardTransitions", label: "Dashboard Number Transitions" },
  { key: "pageTransition", label: "Page Transition" },
];

function effect(enabled: boolean, intensity = 60, speed = 50): EffectConfig {
  return { enabled, intensity, speed, desktop: true, tablet: true, mobile: false };
}

export type DesignEffects = Record<EffectKey, EffectConfig>;

export const DEFAULT_EFFECTS: DesignEffects = {
  heroGlow: effect(true, 65, 40),
  backgroundGrid: effect(true, 30, 30),
  cardGlass: effect(true, 60, 40),
  cardBorderGlow: effect(true, 50, 40),
  spotlightHover: effect(true, 55, 50),
  imageReveal: effect(true, 60, 50),
  sectionGradient: effect(true, 45, 30),
  grainTexture: effect(false, 20, 20),
  animatedCounters: { ...effect(true, 60, 50), mobile: true },
  floatingCards: effect(true, 60, 40),
  dashboardTransitions: { ...effect(true, 60, 50), mobile: true },
  pageTransition: { ...effect(true, 50, 60), mobile: true },
};

/* ------------------------------------------------------------------ *
 * DESIGN — animations                                                 *
 * ------------------------------------------------------------------ */

export type AnimationPreset = "minimal" | "smooth" | "premium" | "cinematic" | "custom";

export interface DesignAnimations {
  preset: AnimationPreset;
  revealDuration: number; // ms
  revealDistance: number; // px
  staggerDelay: number; // ms
  buttonHoverDuration: number; // ms
  cardHoverDuration: number; // ms
  pageTransitionDuration: number; // ms
  counterDuration: number; // ms
  heroOverlayDuration: number; // ms
  floatingSpeed: number; // ms per cycle
  backgroundSpeed: number; // ms per cycle
}

export const DEFAULT_ANIMATIONS: DesignAnimations = {
  preset: "premium",
  revealDuration: 600,
  revealDistance: 24,
  staggerDelay: 80,
  buttonHoverDuration: 200,
  cardHoverDuration: 250,
  pageTransitionDuration: 300,
  counterDuration: 1600,
  heroOverlayDuration: 500,
  floatingSpeed: 6000,
  backgroundSpeed: 12000,
};

export const ANIMATION_PRESETS: Record<
  Exclude<AnimationPreset, "custom">,
  Partial<DesignAnimations>
> = {
  minimal: {
    revealDuration: 300,
    revealDistance: 10,
    staggerDelay: 40,
    buttonHoverDuration: 120,
    cardHoverDuration: 150,
    pageTransitionDuration: 180,
    counterDuration: 900,
    heroOverlayDuration: 300,
    floatingSpeed: 9000,
    backgroundSpeed: 18000,
  },
  smooth: {
    revealDuration: 450,
    revealDistance: 18,
    staggerDelay: 60,
    buttonHoverDuration: 160,
    cardHoverDuration: 200,
    pageTransitionDuration: 240,
    counterDuration: 1200,
    heroOverlayDuration: 400,
    floatingSpeed: 7000,
    backgroundSpeed: 14000,
  },
  premium: {
    revealDuration: 600,
    revealDistance: 24,
    staggerDelay: 80,
    buttonHoverDuration: 200,
    cardHoverDuration: 250,
    pageTransitionDuration: 300,
    counterDuration: 1600,
    heroOverlayDuration: 500,
    floatingSpeed: 6000,
    backgroundSpeed: 12000,
  },
  cinematic: {
    revealDuration: 850,
    revealDistance: 32,
    staggerDelay: 120,
    buttonHoverDuration: 260,
    cardHoverDuration: 320,
    pageTransitionDuration: 420,
    counterDuration: 2200,
    heroOverlayDuration: 700,
    floatingSpeed: 5000,
    backgroundSpeed: 9000,
  },
};

/* ------------------------------------------------------------------ *
 * DESIGN — section backgrounds                                        *
 * ------------------------------------------------------------------ */

export type BackgroundSection =
  | "hero"
  | "problem"
  | "solution"
  | "anpr"
  | "retail"
  | "dashboard"
  | "technology"
  | "contact"
  | "footer"
  | "adminLogin";

export type BackgroundType = "solid" | "gradient" | "image" | "video";

export interface BackgroundConfig {
  type: BackgroundType;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  imageUrl: string;
  videoUrl: string;
  posterUrl: string;
  overlayColor: string;
  overlayOpacity: number; // 0-1
  blur: number; // px
  position: string; // object-position
  enableMedia: boolean;
}

export const BACKGROUND_FIELDS: Array<{ key: BackgroundSection; label: string }> = [
  { key: "hero", label: "Home Hero" },
  { key: "problem", label: "Problem Section" },
  { key: "solution", label: "Solution Section" },
  { key: "anpr", label: "ANPR Section" },
  { key: "retail", label: "Retail Parking Section" },
  { key: "dashboard", label: "Dashboard Section" },
  { key: "technology", label: "Technology Section" },
  { key: "contact", label: "Contact Section" },
  { key: "footer", label: "Footer" },
  { key: "adminLogin", label: "Admin Login Page" },
];

function bg(color: string, gs: string, ge: string): BackgroundConfig {
  return {
    type: "gradient",
    color,
    gradientStart: gs,
    gradientEnd: ge,
    imageUrl: "",
    videoUrl: "",
    posterUrl: "",
    overlayColor: "#06182c",
    overlayOpacity: 0.45,
    blur: 0,
    position: "center",
    enableMedia: false,
  };
}

export type DesignBackgrounds = Record<BackgroundSection, BackgroundConfig>;

export const DEFAULT_BACKGROUNDS: DesignBackgrounds = {
  hero: bg("#06182c", "#06182c", "#0b2d57"),
  problem: bg("#f4f7fb", "#f4f7fb", "#eef3fa"),
  solution: bg("#ffffff", "#ffffff", "#f4f7fb"),
  anpr: bg("#06182c", "#0b2d57", "#06182c"),
  retail: bg("#f4f7fb", "#f4f7fb", "#eef3fa"),
  dashboard: bg("#ffffff", "#ffffff", "#f4f7fb"),
  technology: bg("#06182c", "#06182c", "#0b2d57"),
  contact: bg("#f4f7fb", "#f4f7fb", "#eef3fa"),
  footer: bg("#06182c", "#06182c", "#0b2d57"),
  adminLogin: bg("#06182c", "#06182c", "#0b2d57"),
};

/* ------------------------------------------------------------------ *
 * DESIGN — combined                                                   *
 * ------------------------------------------------------------------ */

export interface DesignSettings {
  colors: DesignColors;
  typography: DesignTypography;
  buttons: DesignButtons;
  effects: DesignEffects;
  animations: DesignAnimations;
  backgrounds: DesignBackgrounds;
}

export const DEFAULT_DESIGN: DesignSettings = {
  colors: DEFAULT_COLORS,
  typography: DEFAULT_TYPOGRAPHY,
  buttons: DEFAULT_BUTTONS,
  effects: DEFAULT_EFFECTS,
  animations: DEFAULT_ANIMATIONS,
  backgrounds: DEFAULT_BACKGROUNDS,
};

/* ------------------------------------------------------------------ *
 * CONTACT settings                                                    *
 * ------------------------------------------------------------------ */

export interface WhatsAppSettings {
  enabled: boolean;
  number: string;
  message: string;
  label: string;
  tooltip: string;
  desktopPosition: "right" | "left";
  mobilePosition: "right" | "left";
  background: string;
  iconColor: string;
  pulse: boolean;
  onlineLabel: string;
  offlineLabel: string;
}

export type AvailabilityStatus = "available" | "busy" | "offline";

/** A single admin-editable contact person shown as a public contact card and
 *  as a WhatsApp/assignee option. Never hardcoded in UI components. */
export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  description: string;
  phoneDisplay: string;
  phoneRaw: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  profileImage: string;
  callEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  visible: boolean;
  desktopVisible: boolean;
  tabletVisible: boolean;
  mobileVisible: boolean;
  availabilityStatus: AvailabilityStatus;
  availabilityText: string;
  order: number;
  accentColor: string;
}

/** Server-driven email notification preferences. Provider API keys live ONLY in
 *  server environment variables — never in Firestore. */
export interface NotificationSettings {
  enabled: boolean;
  recipientEmails: string; // comma separated, informational + used by server route
  ccEmails: string;
  subjectTemplate: string;
  autoReplyEnabled: boolean;
  autoReplySubject: string;
  autoReplyMessage: string;
}

export interface ContactSettings {
  primaryEmail: string;
  secondaryEmail: string;
  primaryPhone: string;
  secondaryPhone: string;
  address: string;
  mapsUrl: string;
  businessHours: string;
  sectionHeading: string;
  sectionDescription: string;
  sectionEyebrow: string;
  formRecipientEmail: string;
  privacyText: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  ctaLabel: string;
  ctaLink: string;
  contacts: ContactPerson[];
  notifications: NotificationSettings;
  whatsapp: WhatsAppSettings;
}

export const DEFAULT_CONTACTS: ContactPerson[] = [
  {
    id: "oshadha-agent",
    name: "Oshadha",
    role: "Agent",
    description: "Smart parking solutions consultant",
    phoneDisplay: "+94 75 456 5755",
    phoneRaw: "94754565755",
    whatsappNumber: "94754565755",
    whatsappMessage:
      "Hello Oshadha, I would like to learn more about the SPM ECO Smart Parking System.",
    email: "",
    profileImage: "",
    callEnabled: true,
    whatsappEnabled: true,
    emailEnabled: false,
    visible: true,
    desktopVisible: true,
    tabletVisible: true,
    mobileVisible: true,
    availabilityStatus: "available",
    availabilityText: "Available now",
    order: 1,
    accentColor: "#176bff",
  },
  {
    id: "ayesh-admin",
    name: "Ayesh",
    role: "Admin",
    description: "Operations & account management",
    phoneDisplay: "+94 74 329 6108",
    phoneRaw: "94743296108",
    whatsappNumber: "94743296108",
    whatsappMessage: "Hello Ayesh, I would like to discuss the SPM ECO Smart Parking System.",
    email: "",
    profileImage: "",
    callEnabled: true,
    whatsappEnabled: true,
    emailEnabled: false,
    visible: true,
    desktopVisible: true,
    tabletVisible: true,
    mobileVisible: true,
    availabilityStatus: "available",
    availabilityText: "Available now",
    order: 2,
    accentColor: "#19c6f4",
  },
];

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: true,
  recipientEmails: "",
  ccEmails: "",
  subjectTemplate: "New SPM ECO Inquiry — {organization}",
  autoReplyEnabled: false,
  autoReplySubject: "We received your inquiry — SPM ECO System",
  autoReplyMessage:
    "Thank you for contacting SPM ECO System. Our team has received your inquiry and will reach out shortly.",
};

export const DEFAULT_CONTACT: ContactSettings = {
  primaryEmail: "spmeco@spm.com",
  secondaryEmail: "",
  primaryPhone: "+94 75 456 5755",
  secondaryPhone: "+94 74 329 6108",
  address: "Colombo, Sri Lanka",
  mapsUrl: "",
  businessHours: "Mon – Fri, 9:00 AM – 6:00 PM",
  sectionEyebrow: "Contact",
  sectionHeading: "Let's Modernize Your Parking Operations",
  sectionDescription:
    "Speak with the SPM ECO System team to discuss smart parking automation, ANPR access, booking, payments, and multi-location parking management.",
  formRecipientEmail: "spmeco@spm.com",
  privacyText:
    "I agree to be contacted by SPM ECO System regarding my inquiry and consent to my details being stored for this purpose.",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  ctaLabel: "Request a System Demo",
  ctaLink: "/contact",
  contacts: DEFAULT_CONTACTS,
  notifications: DEFAULT_NOTIFICATIONS,
  whatsapp: {
    enabled: true,
    number: "94754565755",
    message: "Hello, I would like to learn more about the SPM ECO System.",
    label: "Chat with us",
    tooltip: "Chat on WhatsApp",
    desktopPosition: "right",
    mobilePosition: "right",
    background: "#25D366",
    iconColor: "#ffffff",
    pulse: true,
    onlineLabel: "We're online",
    offlineLabel: "Leave a message",
  },
};

/** Sanitize a phone number to bare international digits (no +, spaces, dashes). */
export function sanitizeDigits(value: string): string {
  return (value || "").replace(/[^\d]/g, "");
}

/** Build a wa.me link for a specific contact person. */
export function contactWhatsappLink(
  c: Pick<ContactPerson, "whatsappNumber" | "whatsappMessage">,
): string {
  const digits = sanitizeDigits(c.whatsappNumber);
  return `https://wa.me/${digits}?text=${encodeURIComponent(c.whatsappMessage || "")}`;
}

/** Build a tel: link from a raw or display phone number. */
export function telLink(phone: string): string {
  const digits = sanitizeDigits(phone);
  return `tel:+${digits}`;
}

/** Contacts that should be shown publicly, sorted by order. */
export function visibleContacts(contacts: ContactPerson[]): ContactPerson[] {
  return [...(contacts ?? [])]
    .filter((c) => c.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/* ------------------------------------------------------------------ *
 * HERO settings                                                       *
 * ------------------------------------------------------------------ */

export interface HeroOverlayCard {
  enabled: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  transparency: number; // 0-1
  animation: boolean;
}

export interface AnprCard extends HeroOverlayCard {
  plate: string;
  category: string;
  bookingStatus: string;
  accessStatus: string;
  barrierStatus: string;
}

export interface OccupancyCard extends HeroOverlayCard {
  location: string;
  available: number;
  capacity: number;
  occupied: number;
  reserved: number;
  progress: number; // 0-100
  disclaimer: string;
}

export interface HeroSettings {
  eyebrow: string;
  headline: string;
  supporting: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  trustStatement: string;
  mediaType: "image" | "video";
  backgroundImage: string;
  backgroundVideo: string;
  posterImage: string;
  mobileImage: string;
  mobileVideo: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  darkOverlay: boolean;
  overlayOpacity: number; // 0-1
  objectPosition: string;
  backgroundBlur: number; // px
  visualHeight: number; // px
  borderRadius: number; // px
  anpr: AnprCard;
  occupancy: OccupancyCard;
}

export const DEFAULT_HERO: HeroSettings = {
  eyebrow: "SMART PARKING FOR SRI LANKA",
  headline: "Find. Navigate. Park Smarter.",
  supporting:
    "Meet SPM ECO: a connected parking ecosystem for Sri Lanka. Discover the driver app, reservations, exact-bay navigation, web administration and explainable intelligence.",
  primaryCtaLabel: "Explore the ecosystem",
  primaryCtaLink: "/features",
  secondaryCtaLabel: "See how it works",
  secondaryCtaLink: "/solution",
  trustStatement: "Flutter driver app · Admin Web · One connected backend",
  mediaType: "image",
  backgroundImage: "",
  backgroundVideo: "",
  posterImage: "",
  mobileImage: "",
  mobileVideo: "",
  autoplay: true,
  loop: true,
  muted: true,
  darkOverlay: true,
  overlayOpacity: 0.5,
  objectPosition: "center",
  backgroundBlur: 0,
  visualHeight: 520,
  borderRadius: 24,
  anpr: {
    enabled: true,
    position: "top-left",
    transparency: 0.85,
    animation: true,
    plate: "CAA-4582",
    category: "Pre-Booked",
    bookingStatus: "Verified",
    accessStatus: "Approved",
    barrierStatus: "Demo entry approved",
  },
  occupancy: {
    enabled: true,
    position: "bottom-right",
    transparency: 0.85,
    animation: true,
    location: "Colombo City Center",
    available: 138,
    capacity: 420,
    occupied: 246,
    reserved: 36,
    progress: 59,
    disclaimer: "Demonstration data — not live parking availability.",
  },
};

/* ------------------------------------------------------------------ *
 * SITE settings                                                       *
 * ------------------------------------------------------------------ */

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
}

export const DEFAULT_SITE: SiteSettings = {
  siteName: "SPM ECO System",
  siteTagline: "Smart Parking Management",
  logoUrl: "",
  faviconUrl: "",
  defaultLanguage: "en",
  maintenanceMode: false,
};

/* ------------------------------------------------------------------ *
 * NAVIGATION settings — header logo, menu items and Request Demo CTA. *
 * These drive the public Navbar (desktop AND mobile) from one source. *
 * ------------------------------------------------------------------ */

export type NavLinkType = "internal" | "external" | "anchor";

export interface NavItem {
  id: string;
  label: string;
  /** Optional shorter label used on small screens if provided. */
  shortLabel: string;
  linkType: NavLinkType;
  /** Internal path ("/features"), anchor ("#pricing") or external URL. */
  to: string;
  enabled: boolean;
  desktopVisible: boolean;
  mobileVisible: boolean;
  newTab: boolean;
}

export interface NavigationSettings {
  logoText: string;
  logoSubtitle: string;
  logoUrl: string;
  items: NavItem[];
  ctaEnabled: boolean;
  ctaLabel: string;
  ctaLink: string;
  ctaNewTab: boolean;
  showThemeToggle: boolean;
  sticky: boolean;
}

let navSeq = 0;
function navItem(label: string, to: string, linkType: NavLinkType = "internal"): NavItem {
  navSeq += 1;
  return {
    id: `nav-${navSeq}`,
    label,
    shortLabel: "",
    linkType,
    to,
    enabled: true,
    desktopVisible: true,
    mobileVisible: true,
    newTab: false,
  };
}

export const DEFAULT_NAVIGATION: NavigationSettings = {
  logoText: "SPM ECO System",
  logoSubtitle: "Smart Parking",
  logoUrl: "",
  items: [
    navItem("Home", "/"),
    navItem("Problem", "/problem"),
    navItem("Solution", "/solution"),
    navItem("Features", "/features"),
    navItem("Technology", "/technology"),
    navItem("Dashboard", "/dashboard"),
    navItem("Contact", "/contact"),
  ],
  ctaEnabled: true,
  ctaLabel: "Request Demo",
  ctaLink: "/contact",
  ctaNewTab: false,
  showThemeToggle: true,
  sticky: true,
};

/** Safe link resolver for navigation targets. Rejects unsafe schemes. */
export function safeNavHref(to: string): string {
  const value = (to ?? "").trim();
  if (!value) return "#";
  const lower = value.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return "#";
  }
  return value;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function mergeDefaults<T>(defaults: T, incoming: unknown): T {
  if (!isPlainObject(defaults)) {
    return incoming === undefined ? defaults : (incoming as T);
  }
  if (!isPlainObject(incoming)) return defaults;
  const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const key of Object.keys(defaults as Record<string, unknown>)) {
    const d = (defaults as Record<string, unknown>)[key];
    const i = incoming[key];
    if (isPlainObject(d)) {
      out[key] = mergeDefaults(d, i);
    } else if (i !== undefined && i !== null) {
      out[key] = i;
    }
  }
  return out as T;
}

/* ------------------------------------------------------------------ *
 * Preview device sizes                                                *
 * ------------------------------------------------------------------ */

export const PREVIEW_DEVICES = [
  { id: "desktop", label: "Desktop", width: 1440 },
  { id: "laptop", label: "Laptop", width: 1280 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "mobile", label: "Mobile", width: 390 },
  { id: "small", label: "Small Mobile", width: 320 },
] as const;
export type PreviewDeviceId = (typeof PREVIEW_DEVICES)[number]["id"];

/* ------------------------------------------------------------------ *
 * LANGUAGES — bilingual (English / Sinhala) public language system.   *
 * The public website reads publicSettings/languages; the admin edits  *
 * adminDrafts/languages via the standard draft/publish lifecycle.     *
 * ------------------------------------------------------------------ */

export type LanguageCode = "en" | "si";

export const LANGUAGE_CODES: LanguageCode[] = ["en", "si"];

/**
 * A localized text value. `en` is required and is the final fallback; `si`
 * (Sinhala) is optional so drafts can be saved before translation is complete.
 * A plain string is also accepted anywhere a Localized value is expected and is
 * treated as English (used for backward compatibility with existing content).
 */
export interface Localized {
  en: string;
  si?: string;
}

export type MaybeLocalized = Localized | string | null | undefined;

export type LanguageSwitcherVariant = "compact" | "full" | "pill";

export interface LanguageStyle {
  variant: LanguageSwitcherVariant;
  showIcon: boolean;
  showLanguageCode: boolean;
  showLanguageName: boolean;
}

export interface LanguageSettings {
  languageSwitcherEnabled: boolean;
  defaultLanguage: LanguageCode;
  enabledLanguages: LanguageCode[];
  labels: Record<LanguageCode, string>;
  shortLabels: Record<LanguageCode, string>;
  rememberPreference: boolean;
  autoDetectBrowserLanguage: boolean;
  showInHeader: boolean;
  showInMobileMenu: boolean;
  showInFooter: boolean;
  style: LanguageStyle;
}

export const DEFAULT_LANGUAGES: LanguageSettings = {
  languageSwitcherEnabled: true,
  defaultLanguage: "en",
  enabledLanguages: ["en", "si"],
  labels: { en: "English", si: "සිංහල" },
  shortLabels: { en: "EN", si: "සිං" },
  rememberPreference: true,
  autoDetectBrowserLanguage: false,
  showInHeader: true,
  showInMobileMenu: true,
  showInFooter: false,
  style: {
    variant: "compact",
    showIcon: true,
    showLanguageCode: true,
    showLanguageName: false,
  },
};

/**
 * Resolve a localized value for the active language with safe English fallback.
 * Never returns undefined and never throws:
 *   1. Sinhala value when active language is "si" and it is non-empty
 *   2. English value
 *   3. the provided fallback (default "")
 * A plain string is treated as English.
 */
export function getLocalizedText(value: MaybeLocalized, lang: LanguageCode, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const active = value[lang];
    if (typeof active === "string" && active.trim() !== "") return active;
    if (typeof value.en === "string" && value.en.trim() !== "") return value.en;
  }
  return fallback;
}

/** True when a localized value has a non-empty translation for `lang`. */
export function hasTranslation(value: MaybeLocalized, lang: LanguageCode): boolean {
  if (value == null) return false;
  if (typeof value === "string") return lang === "en" && value.trim() !== "";
  const v = value[lang];
  return typeof v === "string" && v.trim() !== "";
}

/** Normalize any value into a Localized object. */
export function toLocalized(value: MaybeLocalized): Localized {
  if (value == null) return { en: "", si: "" };
  if (typeof value === "string") return { en: value, si: "" };
  return { en: value.en ?? "", si: value.si ?? "" };
}

/* ------------------------------------------------------------------ *
 * ECONOMIC FEASIBILITY & ROI CALCULATOR settings.                     *
 * Published:  publicSettings/economicFeasibility                       *
 * Draft:      adminDrafts/economicFeasibility                          *
 * The public /roi-calculator page reads ONLY the published document.   *
 * ------------------------------------------------------------------ */

export interface EconomicFeasibilitySettings {
  /** Master switch: when off, the public /roi-calculator page shows a notice. */
  enabled: boolean;
  /** Show the ROI Calculator navigation item. */
  navEnabled: boolean;
  navLabel: Localized;
  navOrder: number;
  navDesktopVisible: boolean;
  navMobileVisible: boolean;
  navFooterVisible: boolean;

  title: Localized;
  description: Localized;

  defaultCurrency: string;
  defaults: EFInputs;
  scenarios: EFScenarios;
  thresholds: EFThresholds;

  disclaimer: Localized;
  ctaLabel: Localized;
  ctaLink: string;

  showCharts: boolean;
  showScenarios: boolean;
  showSensitivity: boolean;
  showExport: boolean;
  showLeadForm: boolean;

  seoTitle: string;
  seoDescription: string;
}

export const DEFAULT_ECONOMIC: EconomicFeasibilitySettings = {
  enabled: true,
  navEnabled: true,
  navLabel: { en: "ROI Calculator", si: "ආයෝජන ප්‍රතිලාභ ගණකය" },
  navOrder: 60,
  navDesktopVisible: true,
  navMobileVisible: true,
  navFooterVisible: true,

  title: {
    en: "Economic Feasibility & ROI Calculator",
    si: "ආර්ථික ශක්‍යතා සහ ආයෝජන ප්‍රතිලාභ ගණකය",
  },
  description: {
    en: "Estimate how quickly the SPM ECO System pays back your investment from parking revenue and automation savings.",
    si: "රථගාල ආදායම සහ ස්වයංක්‍රීයකරණ ඉතිරිකිරීම් මගින් SPM ECO පද්ධතිය ඔබගේ ආයෝජනය කෙතරම් ඉක්මනින් නැවත ලබාදෙයිද යන්න ඇස්තමේන්තු කරන්න.",
  },

  defaultCurrency: "LKR",
  defaults: DEFAULT_EF_INPUTS,
  scenarios: DEFAULT_EF_SCENARIOS,
  thresholds: DEFAULT_EF_THRESHOLDS,

  disclaimer: {
    en: "Results are estimates based on the values you enter. Actual outcomes vary by facility, pricing, and usage.",
    si: "ප්‍රතිඵල ඔබ ඇතුළත් කරන අගයන් මත පදනම් ඇස්තමේන්තු වේ. සැබෑ ප්‍රතිඵල පහසුකම, මිලකරණය සහ භාවිතය අනුව වෙනස් වේ.",
  },
  ctaLabel: {
    en: "Request a Detailed Feasibility Study",
    si: "විස්තරාත්මක ශක්‍යතා අධ්‍යයනයක් ඉල්ලන්න",
  },
  ctaLink: "/contact",

  showCharts: true,
  showScenarios: true,
  showSensitivity: true,
  showExport: true,
  showLeadForm: true,

  seoTitle: "ROI Calculator | SPM ECO System",
  seoDescription:
    "Calculate the return on investment and payback period for the SPM ECO smart parking system based on your facility's revenue and automation savings.",
};
