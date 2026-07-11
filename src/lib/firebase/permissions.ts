import type { AppRole } from "@/lib/admin/auth";

export const APPROVED_ROLES: AppRole[] = [
  "super_admin",
  "content_editor",
  "analytics_viewer",
  "inquiry_manager",
];

/**
 * Which roles may access each admin route. `null` = any active admin.
 * Used both to filter navigation and to block direct page access.
 */
const ROUTE_ROLES: Array<{ prefix: string; roles: AppRole[] | null }> = [
  { prefix: "/admin/dashboard", roles: null },
  { prefix: "/admin/content", roles: ["super_admin", "content_editor"] },
  { prefix: "/admin/pages", roles: ["super_admin", "content_editor"] },
  { prefix: "/admin/media", roles: ["super_admin", "content_editor"] },
  { prefix: "/admin/inquiries", roles: ["super_admin", "inquiry_manager"] },
  { prefix: "/admin/analytics", roles: ["super_admin", "analytics_viewer"] },
  { prefix: "/admin/live-visitors", roles: ["super_admin", "analytics_viewer"] },
  { prefix: "/admin/locations", roles: ["super_admin", "analytics_viewer"] },
  { prefix: "/admin/navigation", roles: ["super_admin"] },
  { prefix: "/admin/languages", roles: ["super_admin"] },
  { prefix: "/admin/economic-feasibility", roles: ["super_admin"] },
  { prefix: "/admin/hero", roles: ["super_admin"] },
  { prefix: "/admin/team", roles: ["super_admin"] },
  { prefix: "/admin/faq", roles: ["super_admin"] },
  { prefix: "/admin/contact-info", roles: ["super_admin"] },
  { prefix: "/admin/seo", roles: ["super_admin"] },
  { prefix: "/admin/design", roles: ["super_admin"] },
  { prefix: "/admin/integrations", roles: ["super_admin"] },
  { prefix: "/admin/backup", roles: ["super_admin"] },
  { prefix: "/admin/users", roles: ["super_admin"] },
  { prefix: "/admin/audit", roles: ["super_admin"] },
  { prefix: "/admin/settings", roles: ["super_admin"] },
];

/** Server-independent route authorization check for the given role. */
export function canAccessPath(role: AppRole | null, pathname: string): boolean {
  if (!role) return false;
  const match = ROUTE_ROLES.filter((r) => pathname.startsWith(r.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0];
  if (!match) return true; // e.g. "/admin" root redirect
  if (match.roles === null) return true;
  return match.roles.includes(role);
}
