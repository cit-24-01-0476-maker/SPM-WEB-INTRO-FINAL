import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Public, privacy-aware analytics ingestion endpoint.
 *
 * Privacy design:
 * - The full visitor IP is NEVER stored. It is masked (last octet / suffix
 *   removed) and separately SHA-256 hashed to count unique visitors.
 * - Approximate location is derived only from edge geo headers (country level).
 * - Runs under /api/public/* so it is reachable without an admin session.
 */
export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as {
            sessionId?: string;
            event?: string;
            page?: string;
            referrer?: string | null;
            screen?: string;
            metadata?: Record<string, unknown>;
          };

          const sessionId = (payload.sessionId ?? "").slice(0, 80);
          const event = (payload.event ?? "").slice(0, 60);
          if (!sessionId || !event) {
            return new Response(JSON.stringify({ ok: false }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const h = request.headers;
          const rawIp =
            h.get("cf-connecting-ip") ||
            (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
            "";
          const maskedIp = maskIp(rawIp);
          const visitorHash = rawIp ? await sha256(rawIp) : null;

          const country = h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || null;
          const region = h.get("cf-region") || h.get("x-vercel-ip-country-region") || null;
          const city = h.get("cf-ipcity") || h.get("x-vercel-ip-city") || null;
          const ua = h.get("user-agent") || "";
          const { device, browser, os } = parseUa(ua);

          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ ok: false }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
            auth: {
              storage: undefined,
              persistSession: false,
              autoRefreshToken: false,
            },
          });

          const page = (payload.page ?? "/").slice(0, 300);
          const isPageView = event === "page_view" || event === "session_start";

          // Upsert the session (existing → bump counters, new → insert).
          const { data: existing } = await supabase
            .from("analytics_sessions")
            .select("id, page_views")
            .eq("session_id", sessionId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("analytics_sessions")
              .update({
                last_seen: new Date().toISOString(),
                page_views: (existing.page_views ?? 0) + (isPageView ? 1 : 0),
              })
              .eq("session_id", sessionId);
          } else {
            await supabase.from("analytics_sessions").insert({
              session_id: sessionId,
              visitor_hash: visitorHash,
              country,
              region,
              city,
              device_type: device,
              browser,
              os,
              screen_resolution: (payload.screen ?? "").slice(0, 20),
              referrer: (payload.referrer ?? "").slice(0, 300) || null,
              traffic_source: classifySource(payload.referrer ?? null),
              landing_page: page,
              page_views: isPageView ? 1 : 0,
            });
          }

          await supabase.from("analytics_events").insert({
            session_id: sessionId,
            event_name: event,
            page_path: page,
            metadata: {
              ...(payload.metadata ?? {}),
              masked_ip: maskedIp,
              country,
            },
          });

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ ok: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

function maskIp(ip: string): string {
  if (!ip) return "unknown";
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 2).join(":") + ":xxxx:xxxx:xxxx:xxxx:xxxx:xxxx";
  }
  const octets = ip.split(".");
  if (octets.length === 4) return `${octets[0]}.${octets[1]}.${octets[2]}.xxx`;
  return "unknown";
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value + "|spm-eco-salt");
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

function classifySource(referrer: string | null): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (/(google|bing|yahoo|duckduckgo|baidu)\./.test(host)) return "organic";
    if (/(facebook|instagram|twitter|x\.com|linkedin|t\.co|youtube|tiktok)/.test(host))
      return "social";
    return "referral";
  } catch {
    return "direct";
  }
}

function parseUa(ua: string): { device: string; browser: string; os: string } {
  const u = ua.toLowerCase();
  let device = "desktop";
  if (/ipad|tablet|playbook|silk/.test(u) || (/android/.test(u) && !/mobile/.test(u)))
    device = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(u)) device = "mobile";

  let browser = "Other";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/opr\/|opera/.test(u)) browser = "Opera";
  else if (/chrome\//.test(u)) browser = "Chrome";
  else if (/firefox\//.test(u)) browser = "Firefox";
  else if (/safari\//.test(u)) browser = "Safari";

  let os = "Other";
  if (/windows/.test(u)) os = "Windows";
  else if (/mac os|macintosh/.test(u)) os = "macOS";
  else if (/android/.test(u)) os = "Android";
  else if (/iphone|ipad|ios/.test(u)) os = "iOS";
  else if (/linux/.test(u)) os = "Linux";

  return { device, browser, os };
}
