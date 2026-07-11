import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLoadingScreen } from "@/components/admin/AdminLoadingScreen";
import { canAccessPath } from "@/lib/firebase/permissions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}

function AdminGate() {
  const { loading, authorized, profile } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !authorized) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [loading, authorized, navigate]);

  // Prevent the dashboard from flashing before the auth check completes.
  if (loading) return <AdminLoadingScreen />;
  if (!authorized) return <AdminLoadingScreen message="Redirecting to sign in…" />;

  // Role-based page protection (not just hidden navigation).
  if (profile && !canAccessPath(profile.role, pathname)) {
    return (
      <AdminShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-lg font-bold text-foreground">Access restricted</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your administrator role does not have permission to view this section.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
