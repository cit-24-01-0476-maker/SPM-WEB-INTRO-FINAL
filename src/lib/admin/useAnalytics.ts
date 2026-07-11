import { useQuery } from "@tanstack/react-query";
import { dbRead } from "@/lib/admin/db";

export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "month" | "prev_month";

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  month: "This month",
  prev_month: "Previous month",
};

export function rangeBounds(key: RangeKey): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  switch (key) {
    case "today":
      return { start, end };
    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      return { start, end };
    case "7d":
      start.setDate(start.getDate() - 6);
      return { start, end };
    case "30d":
      start.setDate(start.getDate() - 29);
      return { start, end };
    case "month":
      start.setDate(1);
      return { start, end };
    case "prev_month": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: s, end: e };
    }
  }
}

export interface AnalyticsEvent {
  id: string;
  session_id: string | null;
  event_name: string;
  page_path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsSession {
  id: string;
  session_id: string;
  country: string | null;
  region: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  traffic_source: string | null;
  referrer: string | null;
  landing_page: string | null;
  page_views: number;
  first_seen: string;
  last_seen: string;
}

export function useAnalytics(range: RangeKey) {
  return useQuery({
    queryKey: ["analytics", range],
    queryFn: async () => {
      const { start, end } = rangeBounds(range);
      const [events, sessions] = await Promise.all([
        dbRead<AnalyticsEvent[]>({
          table: "analytics_events",
          select: "*",
          gte: [["created_at", start.toISOString()]],
          lte: [["created_at", end.toISOString()]],
          order: { column: "created_at", ascending: true },
          limit: 20000,
        }),
        dbRead<AnalyticsSession[]>({
          table: "analytics_sessions",
          select: "*",
          gte: [["first_seen", start.toISOString()]],
          lte: [["first_seen", end.toISOString()]],
          limit: 20000,
        }),
      ]);
      return {
        events: (events.data ?? []) as AnalyticsEvent[],
        sessions: (sessions.data ?? []) as AnalyticsSession[],
        start,
        end,
      };
    },
  });
}

export function tally<T>(items: T[], key: (t: T) => string): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const i of items) {
    const k = key(i) || "unknown";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
