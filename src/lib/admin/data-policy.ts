// Shared, server-enforced permissions for the legacy SQL CMS and analytics.
export const READ_ROLES: Record<string, readonly string[]> = {
  site_content: ["super_admin", "content_editor"],
  content_versions: ["super_admin", "content_editor"],
  pages: ["super_admin", "content_editor"],
  sections: ["super_admin", "content_editor"],
  contact_submissions: ["super_admin", "inquiry_manager"],
  inquiry_notes: ["super_admin", "inquiry_manager"],
  website_settings: ["super_admin"],
  analytics_events: ["super_admin", "analytics_viewer"],
  analytics_sessions: ["super_admin", "analytics_viewer"],
  audit_logs: ["super_admin"],
  profiles: ["super_admin"],
  user_roles: ["super_admin"],
};

export function assertReadAccess(table: string, role: string) {
  if (!Object.hasOwn(READ_ROLES, table) || !READ_ROLES[table].includes(role)) {
    throw new Error("Forbidden: insufficient role for this data");
  }
}

export function assertScopedMutation(op: string, filters?: [string, unknown][]) {
  if (
    (op === "update" || op === "delete") &&
    (!filters?.length || filters.some(([key, value]) => !key || value === undefined))
  ) {
    throw new Error("An update or deletion must target specific records");
  }
}
