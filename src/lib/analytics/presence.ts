// Real live-visitor presence tracker backed by Firebase Realtime Database.
//
// Design goals (production, not simulated):
//  - Each browser tab writes ONE presence node keyed by a unique tabId.
//  - A persistent `visitorId` (localStorage) identifies an anonymous browser.
//  - A per-session `sessionId` (sessionStorage) is shared across a session's tabs.
//  - Presence uses the Realtime Database `.info/connected` signal and
//    `onDisconnect().remove()` so crashed/closed tabs clean themselves up.
//  - A heartbeat refreshes `lastSeenAt` so the dashboard can drop stale nodes.
//  - No personal identity is stored — only anonymous ids + approximate geo.
//
// When the Realtime Database is not configured, every function is a safe no-op.
import {
  ref,
  set,
  update,
  onValue,
  onDisconnect,
  serverTimestamp,
  type Database,
} from "firebase/database";
import { getRealtimeDatabase, PRESENCE_ROOT } from "@/lib/firebase/realtime";

const VID_KEY = "spm_vid";
const PSID_KEY = "spm_psid";
const RETURN_KEY = "spm_returning";

export interface VisitorContext {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  maskedIp: string;
  visitorHash: string | null;
}

function randomId(prefix: string): string {
  const rnd =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${rnd}`.replace(/[^a-zA-Z0-9_-]/g, "");
}

function safeLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage may be blocked */
  }
}

/** Persistent anonymous browser id. */
export function getVisitorId(): string {
  let id = safeLocal(VID_KEY);
  if (!id) {
    id = randomId("v");
    safeSetLocal(VID_KEY, id);
  }
  return id;
}

/** Per-session id shared across tabs of the same session. */
function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(PSID_KEY);
    if (!id) {
      id = randomId("s");
      sessionStorage.setItem(PSID_KEY, id);
    }
    return id;
  } catch {
    return randomId("s");
  }
}

function isReturningVisitor(): boolean {
  const seen = safeLocal(RETURN_KEY);
  safeSetLocal(RETURN_KEY, "1");
  return Boolean(seen);
}

function parseUa(ua: string): { deviceType: string; browser: string; operatingSystem: string } {
  const s = ua.toLowerCase();
  const deviceType = /mobile|iphone|android.+mobile/.test(s)
    ? "mobile"
    : /ipad|tablet|android(?!.+mobile)/.test(s)
      ? "tablet"
      : "desktop";
  const browser = /edg\//.test(s)
    ? "Edge"
    : /opr\/|opera/.test(s)
      ? "Opera"
      : /chrome|crios/.test(s)
        ? "Chrome"
        : /firefox|fxios/.test(s)
          ? "Firefox"
          : /safari/.test(s)
            ? "Safari"
            : "Other";
  const operatingSystem = /windows/.test(s)
    ? "Windows"
    : /android/.test(s)
      ? "Android"
      : /iphone|ipad|ios/.test(s)
        ? "iOS"
        : /mac os|macintosh/.test(s)
          ? "macOS"
          : /linux/.test(s)
            ? "Linux"
            : "Other";
  return { deviceType, browser, operatingSystem };
}

function classifyTraffic(referrer: string): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (/google|bing|yahoo|duckduckgo|baidu/.test(host)) return "search";
    if (/facebook|instagram|twitter|x\.com|linkedin|t\.co|youtube|tiktok/.test(host))
      return "social";
    if (typeof window !== "undefined" && host === window.location.hostname.replace(/^www\./, ""))
      return "internal";
    return "referral";
  } catch {
    return "referral";
  }
}

function utm(param: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(param);
  } catch {
    return null;
  }
}

async function fetchVisitorContext(): Promise<VisitorContext> {
  const empty: VisitorContext = {
    country: null,
    countryCode: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null,
    timezone: null,
    maskedIp: "",
    visitorHash: null,
  };
  try {
    const res = await fetch("/api/public/visitor-context", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return empty;
    return { ...empty, ...((await res.json()) as Partial<VisitorContext>) };
  } catch {
    return empty;
  }
}

export interface PresenceHandle {
  updatePage: (pagePath: string, pageTitle: string) => void;
  markEvent: (event: string) => void;
  markContactFormStarted: () => void;
  markContactFormSubmitted: () => void;
  stop: () => void;
}

const NOOP: PresenceHandle = {
  updatePage: () => {},
  markEvent: () => {},
  markContactFormStarted: () => {},
  markContactFormSubmitted: () => {},
  stop: () => {},
};

/**
 * Starts presence tracking for the current tab. Returns a handle to update the
 * current page and conversion flags, and to stop tracking. Safe no-op on the
 * server or when the Realtime Database is not configured.
 */
export function startPresence(initialPath: string, initialTitle: string): PresenceHandle {
  if (typeof window === "undefined") return NOOP;
  const db: Database | null = getRealtimeDatabase();
  if (!db) return NOOP;

  const tabId = randomId("t");
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const nodeRef = ref(db, `${PRESENCE_ROOT}/${tabId}`);
  const connectedRef = ref(db, ".info/connected");

  const { deviceType, browser, operatingSystem } = parseUa(navigator.userAgent || "");
  const referrer = document.referrer || "";

  let stopped = false;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let offConnected: (() => void) | null = null;

  const base = {
    tabId,
    visitorId,
    sessionId,
    entryPath: initialPath,
    deviceType,
    browser,
    operatingSystem,
    screenWidth: window.screen?.width ?? 0,
    screenHeight: window.screen?.height ?? 0,
    language: navigator.language || "",
    referrer,
    trafficSource: classifyTraffic(referrer),
    utmSource: utm("utm_source"),
    utmMedium: utm("utm_medium"),
    utmCampaign: utm("utm_campaign"),
    isReturning: isReturningVisitor(),
    contactFormStarted: false,
    contactFormSubmitted: false,
  };

  const current = {
    pagePath: initialPath,
    pageTitle: initialTitle,
    status: "online" as "online" | "hidden",
    lastEvent: "session_start",
    contactFormStarted: false,
    contactFormSubmitted: false,
  };

  const writeFull = (ctx: VisitorContext) => {
    if (stopped) return;
    void set(nodeRef, {
      ...base,
      country: ctx.country,
      countryCode: ctx.countryCode,
      region: ctx.region,
      city: ctx.city,
      latitude: ctx.latitude,
      longitude: ctx.longitude,
      timezone: ctx.timezone,
      maskedIp: ctx.maskedIp,
      visitorHash: ctx.visitorHash,
      pagePath: current.pagePath,
      pageTitle: current.pageTitle,
      status: current.status,
      lastEvent: current.lastEvent,
      contactFormStarted: current.contactFormStarted,
      contactFormSubmitted: current.contactFormSubmitted,
      startedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    });
  };

  const patch = (fields: Record<string, unknown>) => {
    if (stopped) return;
    void update(nodeRef, { ...fields, lastSeenAt: serverTimestamp() });
  };

  // Register onDisconnect BEFORE marking online, then write the full node once
  // we are connected. Enrich with approximate geo asynchronously.
  offConnected = onValue(connectedRef, (snap) => {
    if (snap.val() !== true || stopped) return;
    void onDisconnect(nodeRef)
      .remove()
      .then(() => {
        void fetchVisitorContext().then(writeFull);
      })
      .catch(() => {
        void fetchVisitorContext().then(writeFull);
      });
  });

  heartbeat = setInterval(() => patch({}), 25_000);

  const onVisibility = () => {
    current.status = document.visibilityState === "hidden" ? "hidden" : "online";
    patch({ status: current.status });
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    updatePage: (pagePath, pageTitle) => {
      current.pagePath = pagePath;
      current.pageTitle = pageTitle;
      current.lastEvent = "page_view";
      patch({ pagePath, pageTitle, lastEvent: "page_view" });
    },
    markEvent: (event) => {
      current.lastEvent = event;
      patch({ lastEvent: event });
    },
    markContactFormStarted: () => {
      current.contactFormStarted = true;
      current.lastEvent = "contact_form_started";
      patch({ contactFormStarted: true, lastEvent: "contact_form_started" });
    },
    markContactFormSubmitted: () => {
      current.contactFormSubmitted = true;
      current.lastEvent = "contact_form_submitted";
      patch({ contactFormSubmitted: true, lastEvent: "contact_form_submitted" });
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      if (heartbeat) clearInterval(heartbeat);
      if (offConnected) offConnected();
      document.removeEventListener("visibilitychange", onVisibility);
      void set(nodeRef, null).catch(() => {});
    },
  };
}
