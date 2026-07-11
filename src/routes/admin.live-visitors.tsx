import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Radio,
  AppWindow,
  FileText,
  Globe2,
  MailCheck,
  Pause,
  Play,
  Search,
  RefreshCw,
} from "lucide-react";
import { PageHeader, StatCard, AdminCard, EmptyState } from "@/components/admin/primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  subscribeLivePresence,
  computeLiveMetrics,
  shortVisitorLabel,
  durationSeconds,
  formatDuration,
  type LiveSession,
} from "@/lib/analytics/live";
import { realtimeConfigured } from "@/lib/firebase/realtime";

export const Route = createFileRoute("/admin/live-visitors")({
  component: LiveVisitorsPage,
});

function countryFlag(cc: string | null): string {
  if (!cc || !/^[A-Z]{2}$/.test(cc)) return "🌐";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function LiveVisitorsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [available, setAvailable] = useState(true);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const unsub = subscribeLivePresence((s, meta) => {
      setAvailable(meta.available);
      if (!pausedRef.current) setSessions(s);
    });
    // Re-render every 10s so live durations advance.
    const t = setInterval(() => setTick((v) => v + 1), 10_000);
    return () => {
      unsub();
      clearInterval(t);
    };
  }, []);

  const metrics = useMemo(() => computeLiveMetrics(sessions), [sessions]);

  const countries = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.country).filter(Boolean))) as string[],
    [sessions],
  );
  const sources = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.trafficSource).filter(Boolean))),
    [sessions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (countryFilter !== "all" && s.country !== countryFilter) return false;
      if (deviceFilter !== "all" && s.deviceType !== deviceFilter) return false;
      if (sourceFilter !== "all" && s.trafficSource !== sourceFilter) return false;
      if (q) {
        const hay =
          `${s.pagePath} ${s.city ?? ""} ${s.country ?? ""} ${s.browser} ${s.visitorId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sessions, query, countryFilter, deviceFilter, sourceFilter]);

  // touch tick so the memoized durations refresh visually
  void tick;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Visitors"
        description="Real-time anonymous visitor presence from Firebase Realtime Database. Location is estimated from network information and may not be exact."
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span
                className={`h-2 w-2 rounded-full ${paused ? "bg-amber-500" : "animate-pulse bg-emerald-500"}`}
              />
              {paused ? "Paused" : "Live"}
            </span>
            <button
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        }
      />

      {!realtimeConfigured || !available ? (
        <AdminCard title="Realtime Database not configured">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Live presence is unavailable.</p>
              <p className="mt-1">
                Set <code className="rounded bg-secondary px-1">VITE_FIREBASE_DATABASE_URL</code> in
                your environment (Vercel → Settings → Environment Variables), enable the Realtime
                Database in the Firebase Console, publish <code>database.rules.json</code>, then
                redeploy. Historical Firestore analytics continue to work without it.
              </p>
            </div>
          </div>
        </AdminCard>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label="Visitors Online"
              value={metrics.visitorsOnline}
              icon={Users}
              tone="primary"
            />
            <StatCard label="Active Sessions" value={metrics.activeSessions} icon={Radio} />
            <StatCard label="Open Tabs" value={metrics.openTabs} icon={AppWindow} />
            <StatCard label="Pages Viewed" value={metrics.pagesBeingViewed} icon={FileText} />
            <StatCard label="Countries" value={metrics.countriesOnline} icon={Globe2} />
            <StatCard
              label="Forms in Progress"
              value={metrics.contactFormsInProgress}
              icon={MailCheck}
              tone="warning"
            />
          </div>

          <AdminCard>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search page, city, country, visitor…"
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <FilterSelect
                value={countryFilter}
                onChange={setCountryFilter}
                placeholder="Country"
                options={countries}
              />
              <FilterSelect
                value={deviceFilter}
                onChange={setDeviceFilter}
                placeholder="Device"
                options={["desktop", "mobile", "tablet"]}
              />
              <FilterSelect
                value={sourceFilter}
                onChange={setSourceFilter}
                placeholder="Source"
                options={sources}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No live visitors at the moment."
                description="Active anonymous sessions will appear here in real time as people browse the public website."
              />
            ) : (
              <div className="-mx-5 overflow-x-auto sm:mx-0">
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-semibold">Visitor</th>
                      <th className="px-3 py-2 font-semibold">Current Page</th>
                      <th className="px-3 py-2 font-semibold">Duration</th>
                      <th className="px-3 py-2 font-semibold">Location</th>
                      <th className="px-3 py-2 font-semibold">Device</th>
                      <th className="px-3 py-2 font-semibold">Source</th>
                      <th className="px-3 py-2 font-semibold">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.tabId} className="border-b border-border/60 hover:bg-secondary/40">
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {shortVisitorLabel(s.visitorId)}
                          </span>
                          {s.isReturning ? (
                            <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              returning
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="block max-w-[200px] truncate text-foreground">
                            {s.pagePath}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            entry {s.entryPath || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                          {formatDuration(durationSeconds(s.startedAt))}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-foreground">
                            {countryFlag(s.countryCode)} {s.country ?? "Unknown"}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {[s.city, s.region].filter(Boolean).join(", ") || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 capitalize text-muted-foreground">
                          {s.deviceType}
                          <span className="block text-xs">
                            {s.browser} · {s.operatingSystem}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 capitalize text-muted-foreground">
                          {s.trafficSource}
                        </td>
                        <td className="px-3 py-2.5">
                          {s.contactFormSubmitted ? (
                            <Badge tone="success">Converted</Badge>
                          ) : s.contactFormStarted ? (
                            <Badge tone="warning">Form started</Badge>
                          ) : s.status === "hidden" ? (
                            <Badge tone="muted">Idle</Badge>
                          ) : (
                            <Badge tone="primary">Browsing</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[150px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "primary" | "muted";
  children: React.ReactNode;
}) {
  const map = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    primary: "bg-primary/10 text-primary",
    muted: "bg-secondary text-muted-foreground",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}
