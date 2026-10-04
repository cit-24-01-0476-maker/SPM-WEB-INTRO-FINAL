import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Users, MousePointerClick, Timer, TrendingUp, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageHeader, StatCard, AdminCard, EmptyState } from "@/components/admin/primitives";
import { useAnalytics, tally, RANGE_LABELS, type RangeKey } from "@/lib/admin/useAnalytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

const PIE_COLORS = ["#176bff", "#18c8ff", "#22c55e", "#f59e0b", "#a855f7", "#94a3b8"];

const FUNNEL_STEPS: { key: string; label: string }[] = [
  { key: "session_start", label: "Website Visit" },
  { key: "request_demo_click", label: "Hero CTA Click" },
  { key: "contact_form_started", label: "Contact Form Open" },
  { key: "contact_form_submitted", label: "Form Submitted" },
];

function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("7d");
  const { data, isLoading } = useAnalytics(range);

  const events = data?.events ?? [];
  const sessions = data?.sessions ?? [];
  const pageViews = events.filter((e) => e.event_name === "page_view");
  const uniqueVisitors = new Set(sessions.map((s) => s.session_id)).size;
  const ctaClicks = events.filter((e) =>
    ["request_demo_click", "explore_platform_click"].includes(e.event_name),
  ).length;
  const submissions = events.filter((e) => e.event_name === "contact_form_submitted").length;
  const avgPages = sessions.length
    ? (sessions.reduce((a, s) => a + (s.page_views || 0), 0) / sessions.length).toFixed(1)
    : "0.0";
  const conversion = sessions.length ? ((submissions / sessions.length) * 100).toFixed(1) : "0.0";

  // Daily series
  const byDay: Record<string, number> = {};
  for (const e of pageViews) {
    const d = new Date(e.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    byDay[d] = (byDay[d] ?? 0) + 1;
  }
  const series = Object.entries(byDay).map(([name, views]) => ({ name, views }));

  const topPages = tally(pageViews, (e) => e.page_path || "/").slice(0, 8);
  const sources = tally(sessions, (s) => s.traffic_source || "direct");

  const funnel = FUNNEL_STEPS.map((step) => {
    const count =
      step.key === "session_start"
        ? sessions.length
        : events.filter((e) => e.event_name === step.key).length;
    return { ...step, count };
  });
  const funnelMax = Math.max(1, ...funnel.map((f) => f.count));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Analytics"
        description="Privacy-aware traffic and engagement metrics. Locations are approximate; full IPs are never stored."
        actions={
          <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {RANGE_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Page Views"
          value={pageViews.length.toLocaleString()}
          icon={Eye}
          tone="primary"
        />
        <StatCard label="Unique Visitors" value={uniqueVisitors.toLocaleString()} icon={Users} />
        <StatCard label="Sessions" value={sessions.length.toLocaleString()} icon={BarChart3} />
        <StatCard label="Pages / Session" value={avgPages} icon={Timer} />
        <StatCard label="CTA Clicks" value={ctaClicks.toLocaleString()} icon={MousePointerClick} />
        <StatCard
          label="Conversion Rate"
          value={`${conversion}%`}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <AdminCard title={`Page views — ${RANGE_LABELS[range]}`}>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-secondary" />
        ) : series.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No data for this period"
            description="Try a wider date range."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#176bff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#176bff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#176bff"
                strokeWidth={2}
                fill="url(#pv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Conversion funnel">
          <ul className="space-y-3">
            {funnel.map((f, i) => {
              const prev = i === 0 ? f.count : funnel[i - 1].count;
              const rate = prev ? ((f.count / prev) * 100).toFixed(0) : "0";
              return (
                <li key={f.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{f.label}</span>
                    <span className="text-muted-foreground">
                      {f.count} {i > 0 && <span className="text-xs">({rate}%)</span>}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-primary"
                      style={{ width: `${(f.count / funnelMax) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </AdminCard>

        <AdminCard title="Traffic sources">
          {sources.length === 0 ? (
            <EmptyState icon={Users} title="No sessions yet" />
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={sources}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {sources.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-2 text-sm">
                {sources.slice(0, 6).map((s, i) => (
                  <li key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 capitalize text-foreground">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {s.name}
                    </span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AdminCard>
      </div>

      <AdminCard title="Top pages">
        {topPages.length === 0 ? (
          <EmptyState icon={Eye} title="No page views yet" />
        ) : (
          <ul className="space-y-2">
            {topPages.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate font-mono text-xs text-foreground">
                  {p.name}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${(p.value / topPages[0].value) * 100}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-semibold text-foreground">
                  {p.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
