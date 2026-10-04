import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/lib/admin/auth";
import { ALL_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/admin/roles";
import { PageHeader, AdminCard } from "@/components/admin/primitives";
export const Route = createFileRoute("/admin/users")({ component: UsersPage });
function UsersPage() {
  const { profile } = useAdminAuth();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Access is controlled by Firebase Authentication and the matching Firestore admin profile."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ALL_ROLES.map((role) => (
          <div key={role} className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {ROLE_LABELS[role]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>
      <AdminCard title="Your active administrator account">
        <dl className="grid gap-4 break-words sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd>{profile?.full_name ?? "Administrator"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd>{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Role</dt>
            <dd>{profile ? ROLE_LABELS[profile.role] : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="capitalize">{profile?.status}</dd>
          </div>
        </dl>
      </AdminCard>
      <AdminCard title="Manage administrator access">
        <p className="text-sm text-muted-foreground">
          Create accounts in Firebase Authentication. In Firestore, use the same account UID as the
          document ID under admins, with an approved role and status set to active. Passwords are
          managed in Firebase. This panel cannot list other admin profiles under the current
          security rules.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            href="https://console.firebase.google.com/project/spm-eco-system/authentication/users"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firebase accounts
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
            href="https://console.firebase.google.com/project/spm-eco-system/firestore"
            target="_blank"
            rel="noopener noreferrer"
          >
            Admin profiles
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </AdminCard>
    </div>
  );
}
