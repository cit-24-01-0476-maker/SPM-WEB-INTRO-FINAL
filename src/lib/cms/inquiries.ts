// Inquiries data layer — real Firestore storage for public contact submissions.
//
//   inquiries/{autoId}  — created by the public contact form (create-only for
//                         anonymous users, enforced by security rules).
//
// The public website NEVER reads inquiries. The admin panel reads/updates them
// (super_admin + inquiry_manager) via onSnapshot for real-time updates.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/client";
import type { InquiryStatus } from "@/lib/admin/roles";

export const SUBMISSION_VERSION = 1;

export type InquiryPriority = "low" | "normal" | "high" | "urgent";

export interface InquiryInput {
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  facilityType: string;
  parkingCapacity: number | null;
  numberOfLocations: number | null;
  preferredContactId: string | null;
  preferredContactName: string | null;
  preferredContactMethod: string;
  projectRequirement: string;
  message: string;
  privacyConsent: boolean;
  sourcePage: string;
  sourceUrl: string;
  referrer: string;
  
}

export interface InquiryRecord extends InquiryInput {
  id: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  assignedTo: string | null;
  assignedToName: string | null;
  internalNotes: Array<{ text: string; by: string; at: string }>;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Map a raw Firebase error code into an accurate, user-facing message. */
export function mapInquiryError(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  if (code.includes("permission-denied"))
    return "Firestore blocked this inquiry. Verify the deployed security rules.";
  if (code.includes("unavailable"))
    return "The inquiry service is temporarily unavailable. Please try again.";
  if (code.includes("failed-precondition"))
    return "The inquiry data configuration is incomplete.";
  if (code.includes("invalid-argument"))
    return "Some form information is invalid. Please review the form and try again.";
  return "Unable to submit your inquiry. Please try again.";
}

/** Coerce a numeric-or-null input to a whole integer or null (never NaN). */
function toIntOrNull(v: number | null): number | null {
  if (v === null || Number.isNaN(v) || !Number.isFinite(v)) return null;
  return Math.trunc(v);
}

/** Trim to a non-empty string capped at `max`, or null when empty. */
function toStrOrNull(v: string | null | undefined, max: number): string | null {
  if (v === null || v === undefined) return null;
  const t = v.trim();
  return t === "" ? null : t.slice(0, max);
}

/** Constrain the preferred contact method to the three allowed lowercase values. */
function normalizeContactMethod(raw: string): "whatsapp" | "phone" | "email" {
  const k = raw.trim().toLowerCase();
  if (k.includes("email")) return "email";
  if (k.includes("phone") || k.includes("call")) return "phone";
  return "whatsapp";
}

/**
 * Write a valid inquiry to Firestore and return the generated document id.
 *
 * The payload is normalized to EXACTLY the keys the public security rule allows
 * (`validPublicInquiry`) — no extra fields, no `undefined`, numeric fields as
 * integers or null, and `submissionVersion === 1`. Admin-only fields are never
 * sent from the public form.
 */
export async function submitInquiry(input: InquiryInput): Promise<string> {
  const payload = {
    fullName: input.fullName.trim().slice(0, 100),
    organization: toStrOrNull(input.organization, 200),
    email: input.email.trim().toLowerCase().slice(0, 254),
    phone: input.phone.trim().slice(0, 30),
    facilityType: input.facilityType.trim().slice(0, 60),
    parkingCapacity: toIntOrNull(input.parkingCapacity),
    numberOfLocations: toIntOrNull(input.numberOfLocations),
    preferredContactId: toStrOrNull(input.preferredContactId, 100),
    preferredContactName: toStrOrNull(input.preferredContactName, 100),
    preferredContactMethod: normalizeContactMethod(input.preferredContactMethod),
    projectRequirement: toStrOrNull(input.projectRequirement, 3000),
    message: input.message.trim().slice(0, 5000),
    privacyConsent: input.privacyConsent === true,
    sourcePage: toStrOrNull(input.sourcePage, 300),
    sourceUrl: toStrOrNull(input.sourceUrl, 1500),
    referrer: toStrOrNull(input.referrer, 1500),
    status: "new" as const,
    priority: "normal" as const,
    assignedTo: null,
    internalNotes: [] as never[],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    submissionVersion: SUBMISSION_VERSION,
  };

  try {
    const ref = await addDoc(collection(firestore, "inquiries"), payload);
    return ref.id;
  } catch (err) {
    // Development-only diagnostics. Logs field NAMES and TYPES only — never the
    // submitted values, personal message, tokens, or keys.
    if (import.meta.env.DEV) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "unknown";
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      console.error("[inquiry] Firestore write failed", {
        code,
        message,
        collectionPath: "inquiries",
        fieldNames: Object.keys(payload),
        fieldTypes: Object.fromEntries(
          Object.entries(payload).map(([k, v]) => [
            k,
            v === null ? "null" : Array.isArray(v) ? "array" : typeof v,
          ]),
        ),
      });
    }
    throw err;
  }
}


function tsToIso(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (
    typeof v === "object" &&
    v !== null &&
    "toDate" in v &&
    typeof (v as { toDate: unknown }).toDate === "function"
  ) {
    try {
      return (v as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

/** Real-time subscription to all inquiries (admin only). Returns unsubscribe. */
export function subscribeInquiries(
  onData: (rows: InquiryRecord[]) => void,
  onError: (err: unknown) => void,
): () => void {
  const q = query(collection(firestore, "inquiries"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const rows: InquiryRecord[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          fullName: String(data.fullName ?? ""),
          organization: String(data.organization ?? ""),
          email: String(data.email ?? ""),
          phone: String(data.phone ?? ""),
          facilityType: String(data.facilityType ?? ""),
          parkingCapacity: (data.parkingCapacity as number | null) ?? null,
          numberOfLocations: (data.numberOfLocations as number | null) ?? null,
          preferredContactId: (data.preferredContactId as string | null) ?? null,
          preferredContactName: (data.preferredContactName as string | null) ?? null,
          preferredContactMethod: String(data.preferredContactMethod ?? ""),
          projectRequirement: String(data.projectRequirement ?? ""),
          message: String(data.message ?? ""),
          privacyConsent: Boolean(data.privacyConsent),
          sourcePage: String(data.sourcePage ?? ""),
          sourceUrl: String(data.sourceUrl ?? ""),
          referrer: String(data.referrer ?? ""),
          userAgentCategory: String(data.userAgentCategory ?? ""),
          status: (data.status as InquiryStatus) ?? "new",
          priority: (data.priority as InquiryPriority) ?? "normal",
          assignedTo: (data.assignedTo as string | null) ?? null,
          assignedToName: (data.assignedToName as string | null) ?? null,
          internalNotes: Array.isArray(data.internalNotes)
            ? (data.internalNotes as InquiryRecord["internalNotes"])
            : [],
          createdAt: tsToIso(data.createdAt),
          updatedAt: tsToIso(data.updatedAt),
        };
      });
      onData(rows);
    },
    onError,
  );
}

export async function updateInquiry(
  id: string,
  patch: Partial<
    Pick<InquiryRecord, "status" | "priority" | "assignedTo" | "assignedToName" | "internalNotes">
  >,
): Promise<void> {
  await updateDoc(doc(firestore, "inquiries", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteInquiry(id: string): Promise<void> {
  await deleteDoc(doc(firestore, "inquiries", id));
}
