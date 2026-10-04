import { DataError } from "@/components/admin/DataError";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe2, MapPin, Users } from "lucide-react";
import { dbRead } from "@/lib/admin/db";
import { PageHeader, StatCard, AdminCard, EmptyState } from "@/components/admin/primitives";
import type { AnalyticsSession } from "@/lib/admin/useAnalytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/locations")({
  component: LocationsPage,
});

const FLAG: Record<string, string> = {};
function flag(cc: string) {
  if (FLAG[cc]) return FLAG[cc];
  if (!/^[A-Z]{2}$/.test(cc)) return "🌐";
  const emoji = String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
  FLAG[cc] = emoji;
  return emoji;
}

function LocationsPage() {
  const [device, setDevice] = useState("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data } = await dbRead<AnalyticsSession[]>({
        table: "analytics_sessions",
        select: "*",
        order: { column: "last_seen", ascending: false },
        limit: 20000,
      });
      return (data ?? []) as AnalyticsSession[];
    },
  });

  const sessions = useMemo(() => {
    let s = data ?? [];
    if (device !== "all") s = s.filter((x) => x.device_type === device);
    return s;
  }, [data, device]);

  const countries = useMemo(() => {
    const map: Record<string, { sessions: number; views: number; last: string }> = {};
    for (const s of sessions) {
      const c = s.country || "Unknown";
      if (!map[c]) map[c] = { sessions: 0, views: 0, last: s.last_seen };
      map[c].sessions += 1;
      map[c].views += s.page_views || 0;
      if (s.last_seen > map[c].last) map[c].last = s.last_seen;
    }
    return Object.entries(map)
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [sessions]);

  const cities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of sessions) {
      if (!s.city) continue;
      const key = `${s.city}, ${s.country ?? ""}`;
      map[key] = (map[key] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [sessions]);

  const maxCountry = Math.max(1, ...countries.map((c) => c.sessions));

  if (isError) return <DataError onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Locations"
        description="Approximate, country-level visitor geography derived from masked IP data. Not exact physical locations."
        actions={
          <Select value={device} onValueChange={setDevice}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All devices</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Countries"
          value={countries.filter((c) => c.code !== "Unknown").length}
          icon={Globe2}
          tone="primary"
        />
        <StatCard label="Total Sessions" value={sessions.length.toLocaleString()} icon={Users} />
        <StatCard label="Tracked Cities" value={cities.length} icon={MapPin} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard title="Country ranking" className="lg:col-span-2">
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-secondary" />
          ) : countries.length === 0 ? (
            <EmptyState
              icon={Globe2}
              title="No location data yet"
              description="Approximate visitor countries will appear once your published site receives traffic through the edge network."
            />
          ) : (
            <ul className="space-y-3">
              {countries.slice(0, 12).map((c) => (
                <li key={c.code} className="flex items-center gap-3">
                  <span className="w-8 text-lg">{flag(c.code)}</span>
                  <span className="w-16 shrink-0 text-sm font-semibold text-foreground">
                    {c.code}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-primary"
                      style={{ width: `${(c.sessions / maxCountry) * 100}%` }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-sm text-muted-foreground">
                    {c.sessions} · {c.views} views
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Top cities" description="Approximate">
          {cities.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No city data"
              description="City-level data is only available when the edge network provides it."
            />
          ) : (
            <ul className="divide-y divide-border">
              {cities.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs font-bold">
                      {i + 1}
                    </span>
                    {c.name}
                  </span>
                  <span className="font-semibold text-foreground">{c.value}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Privacy note:</strong> Visitor IP addresses are masked
        (e.g. <code className="rounded bg-secondary px-1">192.168.10.xxx</code>) and hashed for
        unique counting. Location is IP-approximate at the country level and must not be treated as
        an exact user address.
      </div>
    </div>
  );
}
