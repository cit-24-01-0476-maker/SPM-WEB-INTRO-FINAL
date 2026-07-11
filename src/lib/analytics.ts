// Privacy-aware client-side analytics for the public marketing site.
// Sends minimal event data to a server route that enriches with an approximate
// (country-level) location and a MASKED IP — full IP addresses are never stored.

const SID_KEY = "spm_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        (crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export type AnalyticsEventName =
  | "page_view"
  | "session_start"
  | "request_demo_click"
  | "explore_platform_click"
  | "contact_form_started"
  | "contact_form_submitted"
  | "whatsapp_click"
  | "email_click"
  | "phone_click"
  | "hero_video_play"
  | "hero_video_complete"
  | "navigation_click"
  | "section_view"
  | "scroll_50_percent"
  | "scroll_90_percent";

export async function trackEvent(
  event: AnalyticsEventName,
  metadata: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      sessionId: getSessionId(),
      event,
      page: window.location.pathname,
      referrer: document.referrer || null,
      screen: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
      metadata,
    });
    // keepalive so events still send during navigation/unload.
    await fetch("/api/public/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // analytics must never break the site
  }
}

export function trackPageView(path?: string) {
  return trackEvent("page_view", { path: path ?? window.location.pathname });
}

let scroll50 = false;
let scroll90 = false;

export function initScrollTracking() {
  if (typeof window === "undefined") return () => {};
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    if (max <= 0) return;
    const pct = (window.scrollY / max) * 100;
    if (!scroll50 && pct >= 50) {
      scroll50 = true;
      void trackEvent("scroll_50_percent");
    }
    if (!scroll90 && pct >= 90) {
      scroll90 = true;
      void trackEvent("scroll_90_percent");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

export function resetScrollTracking() {
  scroll50 = false;
  scroll90 = false;
}
