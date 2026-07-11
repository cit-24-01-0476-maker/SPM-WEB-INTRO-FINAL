import { adminRead, adminWrite, type ReadSpec, type WriteSpec } from "./admin-data.functions";

// Thin client helpers over the secure admin data gateway. Admin pages use these
// instead of the Supabase browser client (which has no session under Firebase auth).
export async function dbRead<T = unknown>(
  spec: ReadSpec,
): Promise<{ data: T; count: number | null }> {
  return (await adminRead({ data: spec })) as { data: T; count: number | null };
}

export async function dbWrite<T = unknown>(spec: WriteSpec): Promise<{ data: T }> {
  return (await adminWrite({ data: spec })) as { data: T };
}
