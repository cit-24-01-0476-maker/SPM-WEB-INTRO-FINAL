import { useEffect, useState } from "react";
import { subscribeInquiries, type InquiryRecord } from "@/lib/cms/inquiries";
import { DataError } from "@/components/admin/DataError";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Users,
  Radio,
  Inbox,
  TrendingUp,
  Globe2,
  Compass,
  Smartphone,
  Monitor,
  FileClock,
  Activity,
} from "lucide-react";
import { dbRead } from "@/lib/admin/db";
import { useAdminAuth } from "@/lib/admin/auth";
import {
  PageHeader,
  StatCard,
  AdminCard,
  EmptyState,
  StatusBadge,
} from "@/components/admin/primitives";
import type { InquiryStatus } from "@/lib/admin/roles";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function startOf(period: "day" | "week" | "month") {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "week") d.setDate(d.getDate() - 6);
  if (period === "month") d.setDate(1);
  return d;
}

function DashboardPage() {
  const { profile, hasAnyRole } = useAdminAuth();
  const canAnalytics = hasAnyRole(["super_admin", "analytics_viewer"]);
  const canInquiries = hasAnyRole(["super_admin", "inquiry_manager"]);

  const analytics = useQuery({
    queryKey: ["dash-analytics"],
    enabled: canAnalytics,
    refetchInterval: 30_000,
    queryFn: async () => {
      const [events, sessions] = await Promise.all([
        dbRead<{ event_name: string; page_path: string | null; created_at: string }[]>({
          table: "analytics_events",
          select: "event_name, page_path, created_at",
          order: { column: "created_at", ascending: false },
          limit: 5000,
        }),
        dbRead<
          {
            session_id: string;
            country: string | null;
            device_type: string | null;
            traffic_source: string | null;
            last_seen: string;
          }[]
        >({
          table: "analytics_sessions",
          select: "session_id, country, device_type, traffic_source, last_seen",
          limit: 5000,
        }),
      ]);
      return { events: events.data ?? [], sessions: sessions.data ?? [] };
    },
  });

  const [inquiryRows, setInquiryRows] = useState<InquiryRecord[]>([]);
  const [inquiryError, setInquiryError] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [inquiryRetry, setInquiryRetry] = useState(0);
  useEffect(() => {
    if (!canInquiries) return;
    setInquiryLoading(true);
    setInquiryError(false);
    return subscribeInquiries(
      (rows) => {
        setInquiryRows(rows);
        setInquiryLoading(false);
      },
      () => {
        setInquiryError(true);
        setInquiryLoading(false);
      },
    );
  }, [canInquiries, inquiryRetry]);
  const inquiries = {
    data: {
      newCount: inquiryRows.filter((row) => row.status === "new").length,
      recent: inquiryRows
        .slice(0, 6)
        .map((row) => ({
          id: row.id,
          name: row.fullName,
          organization: row.organization,
          email: row.email,
          status: row.status,
          created_at: row.createdAt,
        })),
    },
  };

  const ev = analytics.data?.events ?? [];
  const sess = analytics.data?.sessions ?? [];
  const pageViews = ev.filter((e) => e.event_name === "page_view");
  const dayStart = startOf("day").getTime();
  const weekStart = startOf("week").getTime();
  const monthStart = startOf("month").getTime();

  const viewsToday = pageViews.filter((e) => new Date(e.created_at).getTime() >= dayStart).length;
  const viewsWeek = pageViews.filter((e) => new Date(e.created_at).getTime() >= weekStart).length;
  const viewsMonth = pageViews.filter((e) => new Date(e.created_at).getTime() >= monthStart).length;
  const liveCutoff = Date.now() - 5 * 60 * 1000;
  const liveVisitors = sess.filter((s) => new Date(s.last_seen).getTime() >= liveCutoff).length;

  const submissions = ev.filter((e) => e.event_name === "contact_form_submitted").length;
  const conversion = sess.length ? ((submissions / sess.length) * 100).toFixed(1) : "0.0";

  const topPage = topOf(pageViews.map((e) => e.page_path || "/"));
  const topCountry = topOf(sess.map((s) => s.country || "Unknown"));
  const topSource = topOf(sess.map((s) => s.traffic_source || "direct"));
  const mobile = sess.filter((s) => s.device_type === "mobile").length;
  const desktop = sess.filter((s) => s.device_type === "desktop").length;

  // 7-day sparkline
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    const next = d.getTime() + 86400000;
    const count = pageViews.filter((e) => {
      const t = new Date(e.created_at).getTime();
      return t >= d.getTime() && t < next;
    }).length;
    return { label: d.toLocaleDateString(undefined, { weekday: "short" }), count };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(" ")[0] ?? "Admin"}`}
        description="A live overview of your SPM ECO System marketing website."
      />

      {analytics.isError && <DataError onRetry={() => void analytics.refetch()} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Page Views"
          value={
            !canAnalytics || analytics.isError
              ? "—"
              : analytics.isLoading
                ? "…"
                : pageViews.length.toLocaleString()
          }
          icon={Eye}
          tone="primary"
        />
        <StatCard
          label="Unique Visitors"
          value={
            !canAnalytics || analytics.isError
              ? "—"
              : analytics.isLoading
                ? "…"
                : sess.length.toLocaleString()
          }
          icon={Users}
        />
        <StatCard
          label="Live Visitors"
          value={
            !canAnalytics || analytics.isError ? "—" : analytics.isLoading ? "…" : liveVisitors
          }
          icon={Radio}
          tone="success"
          hint="Active in the last 5 minutes"
        />
        <StatCard
          label="New Inquiries"
          value={
            !canInquiries || inquiryError ? "—" : inquiryLoading ? "…" : inquiries.data.newCount
          }
          icon={Inbox}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Views Today"
          value={
            !canAnalytics || analytics.isError
              ? "—"
              : analytics.isLoading
                ? "…"
                : viewsToday.toLocaleString()
          }
        />
        <StatCard
          label="Views This Week"
          value={
            !canAnalytics || analytics.isError
              ? "—"
              : analytics.isLoading
                ? "…"
                : viewsWeek.toLocaleString()
          }
        />
        <StatCard
          label="Views This Month"
          value={
            !canAnalytics || analytics.isError
              ? "—"
              : analytics.isLoading
                ? "…"
                : viewsMonth.toLocaleString()
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard title="Traffic — last 7 days" className="lg:col-span-2">
          {!canAnalytics ? (
            <p className="text-sm text-muted-foreground">
              Your role does not include analytics access.
            </p>
          ) : analytics.isLoading ? (
            <p>Loading traffic…</p>
          ) : analytics.isError ? (
            <DataError onRetry={() => void analytics.refetch()} />
          ) : pageViews.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No traffic data yet"
              description="Visitor analytics will appear here as people browse your public website."
            />
          ) : (
            <div className="flex h-48 items-end gap-3">
              {days.map((d) => (
                <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-primary transition-all"
                      style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 6 : 2 }}
                      title={`${d.count} views`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                  <span className="text-xs font-semibold text-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard title="At a glance">
          <ul className="space-y-4 text-sm">
            <GlanceRow icon={TrendingUp} label="Conversion rate" value={`${conversion}%`} />
            <GlanceRow icon={Compass} label="Most visited" value={topPage} />
            <GlanceRow icon={Globe2} label="Top country" value={topCountry} />
            <GlanceRow icon={Radio} label="Top source" value={cap(topSource)} />
            <GlanceRow
              icon={Smartphone}
              label="Mobile vs Desktop"
              value={
                <span className="flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5" />
                  {mobile}
                  <span className="text-muted-foreground">/</span>
                  <Monitor className="h-3.5 w-3.5" />
                  {desktop}
                </span>
              }
            />
          </ul>
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard
          title="Recent inquiries"
          actions={
            canInquiries ? (
              <Link
                to="/admin/inquiries"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            ) : null
          }
        >
          {!canInquiries ? (
            <EmptyState
              icon={Inbox}
              title="No access"
              description="You don't have permission to view inquiries."
            />
          ) : inquiryError ? (
            <DataError onRetry={() => setInquiryRetry((v) => v + 1)} />
          ) : inquiryLoading ? (
            <p>Loading inquiries…</p>
          ) : (inquiries.data?.recent.length ?? 0) === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No inquiries yet"
              description="Contact form submissions will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {inquiries.data!.recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.organization || r.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status as InquiryStatus} />
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="System status">
          <ul className="space-y-3 text-sm">
            <StatusLine label="Administrator session" status="Connected" />
            <StatusLine
              label="Analytics data"
              status={
                !canAnalytics
                  ? "No access"
                  : analytics.isError
                    ? "Unavailable"
                    : analytics.isLoading
                      ? "Checking"
                      : "Connected"
              }
            />
            <StatusLine
              label="Inquiry data"
              status={
                !canInquiries
                  ? "No access"
                  : inquiryError
                    ? "Unavailable"
                    : inquiryLoading
                      ? "Checking"
                      : "Connected"
              }
            />
          </ul>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
            <FileClock className="h-4 w-4" />
            Inquiries update live. Analytics refresh every 30 seconds; figures cover the most recent
            5,000 records.
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

function GlanceRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="max-w-[55%] truncate text-right font-semibold text-foreground">{value}</span>
    </li>
  );
}

function StatusLine({ label, status }: { label: string; status: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-foreground">{label}</span>
      <span
        className={`flex items-center gap-1.5 text-xs font-semibold ${status === "Connected" ? "text-emerald-600" : "text-muted-foreground"}`}
      >
        <span
          className={`h-2 w-2 rounded-full ${status === "Connected" ? "bg-emerald-500" : "bg-muted-foreground"}`}
        />
        {status}
      </span>
    </li>
  );
}

function topOf(arr: string[]): string {
  if (!arr.length) return "—";
  const counts: Record<string, number> = {};
  for (const a of arr) counts[a] = (counts[a] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
