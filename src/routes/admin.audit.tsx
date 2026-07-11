import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { dbRead } from "@/lib/admin/db";
import { PageHeader, AdminCard, EmptyState, TableSkeleton } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/audit")({
  component: AuditPage,
});

interface Log {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  masked_ip: string | null;
  location: string | null;
  device: string | null;
  browser: string | null;
  created_at: string;
}

const ACTION_STYLES: Record<string, string> = {
  admin_login: "bg-blue-500/10 text-blue-600",
  role_granted: "bg-emerald-500/10 text-emerald-600",
  role_revoked: "bg-amber-500/10 text-amber-600",
  content_edit: "bg-indigo-500/10 text-indigo-600",
  content_publish: "bg-cyan-500/10 text-cyan-600",
  content_delete: "bg-red-500/10 text-red-600",
  settings_change: "bg-purple-500/10 text-purple-600",
};

function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await dbRead<Log[]>({
        table: "audit_logs",
        select: "*",
        order: { column: "created_at", ascending: false },
        limit: 300,
      });
      return (data ?? []) as Log[];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="A record of important administrative activity, with masked IPs and approximate location."
      />
      <AdminCard>
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No activity logged yet"
            description="Admin logins, role changes, content edits and settings changes will be recorded here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Admin</th>
                  <th className="pb-3 pr-4 font-semibold">Action</th>
                  <th className="pb-3 pr-4 font-semibold">Item</th>
                  <th className="pb-3 pr-4 font-semibold">Device</th>
                  <th className="pb-3 pr-4 font-semibold">Masked IP</th>
                  <th className="pb-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data!.map((l) => (
                  <tr key={l.id} className="hover:bg-secondary/40">
                    <td className="py-3 pr-4 font-medium text-foreground">{l.actor_email || "—"}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          ACTION_STYLES[l.action] ?? "bg-secondary text-foreground"
                        }`}
                      >
                        {l.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {l.entity || "—"}
                      {l.entity_id ? <span className="ml-1 text-xs">#{l.entity_id.slice(0, 8)}</span> : null}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{l.device || "—"}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{l.masked_ip || "—"}</td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
