import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { dbRead, dbWrite } from "@/lib/admin/db";
import { useAdminAuth } from "@/lib/admin/auth";
import type { AppRole } from "@/lib/admin/auth";
import { ALL_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/admin/roles";
import { PageHeader, AdminCard, EmptyState, TableSkeleton } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  last_login_at: string | null;
}

function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useAdminAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        dbRead<ProfileRow[]>({ table: "profiles", select: "id, email, full_name, last_login_at" }),
        dbRead<{ user_id: string; role: string }[]>({ table: "user_roles", select: "user_id, role" }),
      ]);
      const roleMap: Record<string, AppRole[]> = {};
      for (const r of roles.data ?? []) {
        (roleMap[r.user_id] ??= []).push(r.role as AppRole);
      }
      return { profiles: (profiles.data ?? []) as ProfileRow[], roleMap };
    },
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role, has }: { userId: string; role: AppRole; has: boolean }) => {
      if (has) {
        await dbWrite({
          op: "delete",
          table: "user_roles",
          eq: [["user_id", userId], ["role", role]],
        });
      } else {
        await dbWrite({ op: "insert", table: "user_roles", values: { user_id: userId, role } });
      }
      if (me) {
        await dbWrite({
          op: "insert",
          table: "audit_logs",
          values: {
            actor_id: null,
            actor_email: me.email ?? null,
            action: has ? "role_revoked" : "role_granted",
            entity: "user_roles",
            entity_id: userId,
            metadata: { role, firebase_uid: me.uid },
          },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
    onError: (e) => toast.error("Could not update role", { description: (e as Error).message }),
  });

  const users = useMemo(() => data?.profiles ?? [], [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Assign role-based access. New admins register at the sign-in page, then you grant them a role here."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ALL_ROLES.map((r) => (
          <div key={r} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> {ROLE_LABELS[r]}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</p>
          </div>
        ))}
      </div>

      <AdminCard title="Administrators">
        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : users.length === 0 ? (
          <EmptyState icon={UserPlus} title="No users yet" description="Register the first admin account from the sign-in page." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">User</th>
                  {ALL_ROLES.map((r) => (
                    <th key={r} className="pb-3 px-2 text-center font-semibold">
                      {ROLE_LABELS[r].split(" ")[0]}
                    </th>
                  ))}
                  <th className="pb-3 pl-4 font-semibold">Last login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const roles = data!.roleMap[u.id] ?? [];
                  return (
                    <tr key={u.id} className="hover:bg-secondary/40">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-foreground">
                          {u.full_name || "—"}
                          {u.id === me?.uid && <span className="ml-2 text-xs text-primary">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      {ALL_ROLES.map((r) => {
                        const has = roles.includes(r);
                        return (
                          <td key={r} className="px-2 text-center">
                            <input
                              type="checkbox"
                              checked={has}
                              onChange={() => toggleRole.mutate({ userId: u.id, role: r, has })}
                              className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                            />
                          </td>
                        );
                      })}
                      <td className="py-3 pl-4 text-xs text-muted-foreground">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "Never"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
