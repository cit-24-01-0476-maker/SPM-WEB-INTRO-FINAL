import { createFileRoute } from "@tanstack/react-router";

/**
 * Privacy-aware visitor context endpoint.
 *
 * Reads edge geolocation headers (Vercel / Cloudflare) on the SERVER and
 * returns ONLY approximate, privacy-safe metadata to the browser:
 *   - approximate country / region / city
 *   - approximate latitude / longitude (city-level, from the edge)
 *   - timezone
 *   - a MASKED ip (never the full address)
 *   - a salted, non-reversible visitor hash (for returning-visitor counts)
 *
 * The raw IP address is NEVER returned to the client and NEVER stored here.
 */
export const Route = createFileRoute("/api/public/visitor-context")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const h = request.headers;

        const rawIp =
          (h.get("x-vercel-forwarded-for") ?? "").split(",")[0].trim() ||
          (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
          h.get("x-real-ip") ||
          h.get("cf-connecting-ip") ||
          "";

        const salt = process.env.ANALYTICS_HASH_SALT || "spm-eco-default-salt";
        const visitorHash = rawIp ? (await sha256(`${salt}:${rawIp}`)).slice(0, 24) : null;

        const country = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null;
        const region = h.get("x-vercel-ip-country-region") || h.get("cf-region") || null;
        const cityRaw = h.get("x-vercel-ip-city") || h.get("cf-ipcity") || null;
        const city = cityRaw ? safeDecode(cityRaw) : null;
        const latitude = numOrNull(h.get("x-vercel-ip-latitude") || h.get("cf-iplatitude"));
        const longitude = numOrNull(h.get("x-vercel-ip-longitude") || h.get("cf-iplongitude"));
        const timezone = h.get("x-vercel-ip-timezone") || h.get("cf-timezone") || null;

        const body = {
          country,
          countryCode: country,
          region,
          city,
          // Round coordinates to ~city precision (2 dp ≈ 1.1km) — never exact.
          latitude: latitude !== null ? Math.round(latitude * 100) / 100 : null,
          longitude: longitude !== null ? Math.round(longitude * 100) / 100 : null,
          timezone,
          maskedIp: maskIp(rawIp),
          visitorHash,
        };

        return new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});

function numOrNull(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/** Masks an IP: keeps the network prefix, drops host-identifying suffix. */
function maskIp(ip: string): string {
  if (!ip) return "";
  if (ip.includes(":")) {
    // IPv6 — keep the first 3 hextets.
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + "::";
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return "";
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
