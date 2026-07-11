// Admin-side live presence subscription + derived metrics.
// Reads the Realtime Database `presence` node and exposes only ACTIVE sessions
// (seen within the active window). Never fabricates data.
import { ref, onValue } from "firebase/database";
import {
  getRealtimeDatabase,
  PRESENCE_ROOT,
  PRESENCE_ACTIVE_WINDOW_MS,
  realtimeConfigured,
} from "@/lib/firebase/realtime";

export interface LiveSession {
  tabId: string;
  visitorId: string;
  sessionId: string;
  pagePath: string;
  pageTitle: string;
  entryPath: string;
  startedAt: number | null;
  lastSeenAt: number | null;
  status: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  language: string;
  referrer: string;
  trafficSource: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  maskedIp: string;
  isReturning: boolean;
  contactFormStarted: boolean;
  contactFormSubmitted: boolean;
  lastEvent: string;
}

export interface LiveMetrics {
  visitorsOnline: number;
  activeSessions: number;
  openTabs: number;
  pagesBeingViewed: number;
  countriesOnline: number;
  contactFormsInProgress: number;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function normalize(tabId: string, raw: Record<string, unknown>): LiveSession {
  return {
    tabId,
    visitorId: str(raw.visitorId),
    sessionId: str(raw.sessionId),
    pagePath: str(raw.pagePath, "/"),
    pageTitle: str(raw.pageTitle),
    entryPath: str(raw.entryPath),
    startedAt: num(raw.startedAt),
    lastSeenAt: num(raw.lastSeenAt),
    status: str(raw.status, "online"),
    deviceType: str(raw.deviceType, "desktop"),
    browser: str(raw.browser, "Other"),
    operatingSystem: str(raw.operatingSystem, "Other"),
    language: str(raw.language),
    referrer: str(raw.referrer),
    trafficSource: str(raw.trafficSource, "direct"),
    utmSource: raw.utmSource ? str(raw.utmSource) : null,
    utmMedium: raw.utmMedium ? str(raw.utmMedium) : null,
    utmCampaign: raw.utmCampaign ? str(raw.utmCampaign) : null,
    country: raw.country ? str(raw.country) : null,
    countryCode: raw.countryCode ? str(raw.countryCode) : null,
    region: raw.region ? str(raw.region) : null,
    city: raw.city ? str(raw.city) : null,
    latitude: num(raw.latitude),
    longitude: num(raw.longitude),
    timezone: raw.timezone ? str(raw.timezone) : null,
    maskedIp: str(raw.maskedIp),
    isReturning: raw.isReturning === true,
    contactFormStarted: raw.contactFormStarted === true,
    contactFormSubmitted: raw.contactFormSubmitted === true,
    lastEvent: str(raw.lastEvent),
  };
}

/**
 * Subscribes to live presence. Calls `cb` with the currently ACTIVE sessions.
 * Returns an unsubscribe function. If the Realtime Database is not configured
 * the callback is invoked once with an empty list and an unavailable flag.
 */
export function subscribeLivePresence(
  cb: (sessions: LiveSession[], meta: { available: boolean }) => void,
): () => void {
  const db = getRealtimeDatabase();
  if (!db || !realtimeConfigured) {
    cb([], { available: false });
    return () => {};
  }

  const presenceRef = ref(db, PRESENCE_ROOT);
  const unsub = onValue(
    presenceRef,
    (snap) => {
      const val = (snap.val() ?? {}) as Record<string, Record<string, unknown>>;
      const now = Date.now();
      const sessions = Object.entries(val)
        .map(([tabId, raw]) => normalize(tabId, raw ?? {}))
        .filter(
          (s) =>
            s.lastSeenAt !== null && now - (s.lastSeenAt as number) < PRESENCE_ACTIVE_WINDOW_MS,
        )
        .sort((a, b) => (b.lastSeenAt ?? 0) - (a.lastSeenAt ?? 0));
      cb(sessions, { available: true });
    },
    () => cb([], { available: true }),
  );

  return () => unsub();
}

export function computeLiveMetrics(sessions: LiveSession[]): LiveMetrics {
  const visitors = new Set<string>();
  const sess = new Set<string>();
  const pages = new Set<string>();
  const countries = new Set<string>();
  let forms = 0;
  for (const s of sessions) {
    if (s.visitorId) visitors.add(s.visitorId);
    if (s.sessionId) sess.add(s.sessionId);
    if (s.pagePath) pages.add(s.pagePath);
    if (s.country) countries.add(s.country);
    if (s.contactFormStarted && !s.contactFormSubmitted) forms += 1;
  }
  return {
    visitorsOnline: visitors.size,
    activeSessions: sess.size,
    openTabs: sessions.length,
    pagesBeingViewed: pages.size,
    countriesOnline: countries.size,
    contactFormsInProgress: forms,
  };
}

export function shortVisitorLabel(id: string): string {
  if (!id) return "anon";
  const clean = id.replace(/^v_?/, "");
  return clean.slice(0, 6).toUpperCase();
}

export function durationSeconds(startedAt: number | null): number {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
