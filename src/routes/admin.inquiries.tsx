import { DataError } from "@/components/admin/DataError";
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Inbox,
  Search,
  Download,
  Trash2,
  Ban,
  X,
  Mail,
  Phone,
  Building2,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin/auth";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import {
  PageHeader,
  AdminCard,
  EmptyState,
  StatCard,
  TableSkeleton,
} from "@/components/admin/primitives";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS } from "@/lib/admin/roles";
import type { InquiryStatus } from "@/lib/admin/roles";
import {
  subscribeInquiries,
  appendInquiryNote,
  updateInquiry,
  deleteInquiry,
  type InquiryRecord,
  type InquiryPriority,
} from "@/lib/cms/inquiries";
import { visibleContacts } from "@/lib/cms/model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/inquiries")({
  component: InquiriesPage,
});

const PRIORITIES: InquiryPriority[] = ["low", "normal", "high", "urgent"];

function InquiriesPage() {
  const { hasAnyRole, user } = useAdminAuth();
  const canManage = hasAnyRole(["super_admin", "inquiry_manager"]);
  const canDelete = hasAnyRole(["super_admin"]);
  const { contact } = usePublicSettings();
  const contactPeople = useMemo(() => visibleContacts(contact.contacts), [contact.contacts]);

  const [rows, setRows] = useState<InquiryRecord[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [contactFilter, setContactFilter] = useState("all");
  const [selected, setSelected] = useState<InquiryRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const seenCount = useRef<number | null>(null);

  useEffect(() => {
    setLoadFailed(false);
    setRows(null);
    const unsub = subscribeInquiries(
      (data) => {
        setRows(data);
        // New-inquiry toast (skip the very first snapshot to avoid Strict Mode noise).
        if (seenCount.current !== null && data.length > seenCount.current) {
          toast.success("New inquiry received");
        }
        seenCount.current = data.length;
      },
      () => {
        setLoadFailed(true);
        toast.error("Could not load inquiries. Verify your admin role and security rules.");
      },
    );
    return () => unsub();
  }, [retry]);

  // Keep the open drawer in sync with live updates.
  useEffect(() => {
    if (!selected || !rows) return;
    const fresh = rows.find((r) => r.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [rows, selected]);

  const filtered = useMemo(() => {
    let r = rows ?? [];
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    if (priorityFilter !== "all") r = r.filter((x) => x.priority === priorityFilter);
    if (contactFilter !== "all") r = r.filter((x) => x.preferredContactId === contactFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.fullName.toLowerCase().includes(q) ||
          x.email.toLowerCase().includes(q) ||
          x.organization.toLowerCase().includes(q) ||
          x.phone.toLowerCase().includes(q),
      );
    }
    return r;
  }, [rows, statusFilter, priorityFilter, contactFilter, search]);

  const metrics = useMemo(() => {
    const r = rows ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const count = (s: InquiryStatus) => r.filter((x) => x.status === s).length;
    return {
      total: r.length,
      newToday: r.filter((x) => (x.createdAt ?? "").slice(0, 10) === today).length,
      contacted: count("contacted"),
      qualified: count("qualified"),
      completed: count("completed"),
      spam: count("spam"),
    };
  }, [rows]);

  async function setStatus(id: string, status: InquiryStatus) {
    if (!canManage) return;
    try {
      await updateInquiry(id, { status });
      toast.success("Status updated");
    } catch {
      toast.error("Update failed");
    }
  }
  async function setPriority(id: string, priority: InquiryPriority) {
    if (!canManage) return;
    try {
      await updateInquiry(id, { priority });
      toast.success("Priority updated");
    } catch {
      toast.error("Update failed");
    }
  }
  async function assign(id: string, contactId: string) {
    if (!canManage) return;
    const person = contactPeople.find((c) => c.id === contactId);
    try {
      await updateInquiry(id, {
        assignedTo: contactId === "none" ? null : contactId,
        assignedToName: person?.name ?? null,
      });
      toast.success("Assignment updated");
    } catch {
      toast.error("Update failed");
    }
  }
  async function addNote(rec: InquiryRecord) {
    if (!canManage || !note.trim()) return;
    try {
      await appendInquiryNote(rec.id, {
        text: note.trim(),
        by: user?.email ?? user?.uid ?? "admin",
        at: new Date().toISOString(),
      });
      setNote("");
      toast.success("Note added");
    } catch {
      toast.error("Could not add note");
    }
  }
  async function remove(id: string) {
    try {
      await deleteInquiry(id);
      setDeleteId(null);
      setSelected(null);
      toast.success("Inquiry deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  function exportCsv() {
    const headers = [
      "Reference",
      "Name",
      "Organization",
      "Email",
      "Phone",
      "Facility",
      "Capacity",
      "Locations",
      "Preferred Contact",
      "Method",
      "Status",
      "Priority",
      "Assigned",
      "Date",
      "Message",
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) =>
      [
        r.id,
        r.fullName,
        r.organization,
        r.email,
        r.phone,
        r.facilityType,
        r.parkingCapacity,
        r.numberOfLocations,
        r.preferredContactName,
        r.preferredContactMethod,
        INQUIRY_STATUS_LABELS[r.status],
        r.priority,
        r.assignedToName,
        r.createdAt ?? "",
        r.message,
      ]
        .map(esc)
        .join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} inquiries`);
  }

  const isLoading = rows === null;

  if (loadFailed) return <DataError onRetry={() => setRetry((value) => value + 1)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forms & Inquiries"
        description="Contact and consultation requests submitted through your website — updated in real time."
        actions={
          <button
            onClick={exportCsv}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="New today" value={metrics.newToday} icon={Inbox} />
        <StatCard label="Total" value={metrics.total} icon={Inbox} />
        <StatCard label="Contacted" value={metrics.contacted} icon={Phone} />
        <StatCard label="Qualified" value={metrics.qualified} icon={UserCheck} />
        <StatCard label="Completed" value={metrics.completed} icon={UserCheck} />
        <StatCard label="Spam" value={metrics.spam} icon={Ban} />
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, org, phone…"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {INQUIRY_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {INQUIRY_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={contactFilter} onValueChange={setContactFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contacts</SelectItem>
              {contactPeople.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No inquiries found"
            description="When visitors submit the contact form, their requests appear here instantly."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 pr-4 font-semibold">Organization</th>
                  <th className="pb-3 pr-4 font-semibold">Facility</th>
                  <th className="pb-3 pr-4 font-semibold">Preferred</th>
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/40">
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-left font-semibold text-foreground hover:text-primary"
                      >
                        {r.fullName}
                      </button>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.organization || "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.facilityType || "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {r.preferredContactName || "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <Select
                        value={r.status}
                        onValueChange={(v) => setStatus(r.id, v as InquiryStatus)}
                        disabled={!canManage}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INQUIRY_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {INQUIRY_STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canManage ? (
                          <button
                            onClick={() => setStatus(r.id, "spam")}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-amber-600"
                            title="Mark as spam"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            onClick={() => setDeleteId(r.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Details drawer */}
      {selected ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selected.fullName}</h3>
                <p className="text-xs text-muted-foreground">Ref: {selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <DetailRow icon={Mail} value={selected.email} href={`mailto:${selected.email}`} />
              <DetailRow icon={Phone} value={selected.phone} href={`tel:${selected.phone}`} />
              <DetailRow icon={Building2} value={selected.organization || "—"} />
              <DetailRow
                icon={MessageCircle}
                value={`${selected.facilityType || "—"} · ${selected.preferredContactMethod || "—"}`}
              />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Meta label="Capacity" value={selected.parkingCapacity ?? "—"} />
              <Meta label="Locations" value={selected.numberOfLocations ?? "—"} />
              <Meta label="Preferred" value={selected.preferredContactName || "—"} />
              <Meta label="Requirement" value={selected.projectRequirement || "—"} />
            </dl>

            {selected.message ? (
              <div className="mt-4 rounded-xl border border-border bg-background p-3 text-sm text-foreground">
                {selected.message}
              </div>
            ) : null}

            {canManage ? (
              <div className="mt-5 space-y-3">
                <LabeledSelect
                  label="Priority"
                  value={selected.priority}
                  options={PRIORITIES.map((p) => ({ value: p, label: p }))}
                  onChange={(v) => setPriority(selected.id, v as InquiryPriority)}
                />
                <LabeledSelect
                  label="Assign to"
                  value={selected.assignedTo ?? "none"}
                  options={[
                    { value: "none", label: "Unassigned" },
                    ...contactPeople.map((c) => ({ value: c.id, label: `${c.name} — ${c.role}` })),
                  ]}
                  onChange={(v) => assign(selected.id, v)}
                />

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-foreground">Internal notes</p>
                  <div className="space-y-1.5">
                    {selected.internalNotes.map((n, i) => (
                      <div key={i} className="rounded-lg bg-secondary px-3 py-2 text-xs">
                        <p className="text-foreground">{n.text}</p>
                        <p className="mt-0.5 text-muted-foreground">
                          {n.by} · {new Date(n.at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add an internal note…"
                      className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => addNote(selected)}
                      className="rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the inquiry record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && remove(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Mail;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2 text-foreground">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="break-all">{value}</span>
    </span>
  );
  return href ? (
    <a href={href} className="block hover:text-primary">
      {content}
    </a>
  ) : (
    content
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm capitalize">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="capitalize">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
