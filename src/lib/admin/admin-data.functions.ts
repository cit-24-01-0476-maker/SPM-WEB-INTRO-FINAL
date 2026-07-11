import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAdmin } from "@/lib/admin/admin-guard";
import type { VerifiedRole } from "@/lib/firebase/verify.server";

// ---------------------------------------------------------------------------
// Secure admin data gateway.
//
// The admin console authenticates with Firebase, so it has no Supabase session
// and cannot pass Supabase RLS. These server functions verify the Firebase ID
// token (requireFirebaseAdmin), then run the requested query with the Supabase
// service role. The public website continues to use its own RLS-protected
// paths and is unchanged.
// ---------------------------------------------------------------------------

const READ_TABLES = [
  "site_content",
  "content_versions",
  "contact_submissions",
  "inquiry_notes",
  "website_settings",
  "pages",
  "sections",
  "analytics_events",
  "analytics_sessions",
  "audit_logs",
  "profiles",
  "user_roles",
] as const;

const WRITE_ROLES: Record<string, VerifiedRole[]> = {
  site_content: ["super_admin", "content_editor"],
  content_versions: ["super_admin", "content_editor"],
  pages: ["super_admin", "content_editor"],
  sections: ["super_admin", "content_editor"],
  contact_submissions: ["super_admin", "inquiry_manager"],
  inquiry_notes: ["super_admin", "inquiry_manager"],
  website_settings: ["super_admin"],
  user_roles: ["super_admin"],
  audit_logs: ["super_admin", "content_editor", "analytics_viewer", "inquiry_manager"],
};

export interface ReadSpec {
  table: (typeof READ_TABLES)[number];
  select?: string;
  eq?: [string, unknown][];
  gte?: [string, unknown][];
  lte?: [string, unknown][];
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
  headCount?: boolean;
}

export type WriteSpec =
  | { op: "insert"; table: string; values: Record<string, unknown> | Record<string, unknown>[]; select?: string; single?: boolean }
  | { op: "update"; table: string; values: Record<string, unknown>; eq: [string, unknown][] }
  | { op: "upsert"; table: string; values: Record<string, unknown> | Record<string, unknown>[]; onConflict?: string }
  | { op: "delete"; table: string; eq: [string, unknown][] };

export const adminRead = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAdmin])
  .inputValidator((spec: ReadSpec) => spec)
  .handler(async ({ data }) => {
    if (!READ_TABLES.includes(data.table)) throw new Error(`Read not allowed for ${data.table}`);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from(data.table)
      .select(
        data.select ?? "*",
        data.headCount ? { count: "exact", head: true } : undefined,
      );

    for (const [col, val] of data.eq ?? []) query = query.eq(col, val as never);
    for (const [col, val] of data.gte ?? []) query = query.gte(col, val as never);
    for (const [col, val] of data.lte ?? []) query = query.lte(col, val as never);
    if (data.order) query = query.order(data.order.column, { ascending: data.order.ascending ?? true });
    if (data.limit) query = query.limit(data.limit);

    const res = data.single ? await query.maybeSingle() : await query;
    if (res.error) throw new Error(res.error.message);
    return { data: res.data ?? null, count: res.count ?? null };
  });

export const adminWrite = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAdmin])
  .inputValidator((spec: WriteSpec) => spec)
  .handler(async ({ data, context }) => {
    const allowed = WRITE_ROLES[data.table];
    if (!allowed) throw new Error(`Writes not allowed for ${data.table}`);
    if (!allowed.includes(context.admin.role)) throw new Error("Forbidden: insufficient role");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Table name is validated against WRITE_ROLES above; cast to a loose handle
    // because the table is resolved dynamically.
    const table = (supabaseAdmin.from as (t: string) => any)(data.table);

    if (data.op === "insert") {
      if (data.select) {
        const q = table.insert(data.values).select(data.select);
        const res = data.single ? await q.single() : await q;
        if (res.error) throw new Error(res.error.message);
        return { data: res.data ?? null };
      }
      const res = await table.insert(data.values);
      if (res.error) throw new Error(res.error.message);
      return { data: null };
    }

    if (data.op === "update") {
      let q = table.update(data.values);
      for (const [col, val] of data.eq) q = q.eq(col, val);
      const res = await q;
      if (res.error) throw new Error(res.error.message);
      return { data: null };
    }

    if (data.op === "upsert") {
      const res = await table.upsert(
        data.values,
        data.onConflict ? { onConflict: data.onConflict } : undefined,
      );
      if (res.error) throw new Error(res.error.message);
      return { data: null };
    }

    // delete
    let q = table.delete();
    for (const [col, val] of data.eq) q = q.eq(col, val);
    const res = await q;
    if (res.error) throw new Error(res.error.message);
    return { data: null };
  });
