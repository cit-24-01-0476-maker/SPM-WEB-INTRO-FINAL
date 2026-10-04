import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Eye, EyeOff, Pencil, Trash2, X, Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { dbRead, dbWrite } from "@/lib/admin/db";
import { useAdminAuth } from "@/lib/admin/auth";
import { PageHeader, AdminCard, EmptyState, TableSkeleton } from "@/components/admin/primitives";
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

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
});

interface Content {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  is_published: boolean;
  display_order: number;
  updated_at: string;
}

function ContentPage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const [editing, setEditing] = useState<Partial<Content> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<Content | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data } = await dbRead<Content[]>({
        table: "site_content",
        select: "*",
        order: { column: "display_order", ascending: true },
      });
      return (data ?? []) as Content[];
    },
  });

  const save = useMutation({
    mutationFn: async (c: Partial<Content>) => {
      const payload = {
        section_key: c.section_key ?? "",
        title: c.title ?? null,
        subtitle: c.subtitle ?? null,
        description: c.description ?? null,
        is_published: c.is_published ?? true,
        display_order: c.display_order ?? 0,
        updated_by: null,
      };
      if (c.id) {
        await dbWrite({ op: "update", table: "site_content", values: payload, eq: [["id", c.id]] });
        await dbWrite({
          op: "insert",
          table: "content_versions",
          values: {
            entity_type: "site_content",
            entity_id: c.id,
            snapshot: JSON.parse(JSON.stringify(payload)),
            changed_by: null,
          },
        });
      } else {
        await dbWrite({ op: "insert", table: "site_content", values: payload });
      }
      if (user) {
        await dbWrite({
          op: "insert",
          table: "audit_logs",
          values: {
            actor_id: null,
            actor_email: user.email ?? null,
            action: c.id ? "content_edit" : "content_publish",
            entity: "site_content",
            entity_id: c.id ?? null,
            metadata: { firebase_uid: user.uid },
          },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content"] });
      setEditing(null);
      toast.success("Content saved");
    },
    onError: (e) => toast.error("Save failed", { description: (e as Error).message }),
  });

  const togglePublish = useMutation({
    mutationFn: async (c: Content) => {
      await dbWrite({
        op: "update",
        table: "site_content",
        values: { is_published: !c.is_published },
        eq: [["id", c.id]],
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-content"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await dbWrite({ op: "delete", table: "site_content", eq: [["id", id]] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content"] });
      setDeleteId(null);
      toast.success("Content deleted");
    },
    onError: (e) => toast.error("Delete failed", { description: (e as Error).message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Content"
        description="Manage the editable text blocks that power your marketing sections. Publish, unpublish and version content."
        actions={
          <button
            onClick={() =>
              setEditing({
                section_key: "",
                title: "",
                is_published: true,
                display_order: (data?.length ?? 0) + 1,
              })
            }
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            <Plus className="h-4 w-4" /> New section
          </button>
        }
      />

      <AdminCard>
        {isLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={FileText}
            title="No content blocks yet"
            description="Create editable sections such as Hero, Problem, Solution, Features and Contact."
            action={
              <button
                onClick={() =>
                  setEditing({ section_key: "", is_published: true, display_order: 1 })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Create first section
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {data!.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
                  {c.display_order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-semibold text-foreground">
                    {c.title || c.section_key}
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {c.section_key}
                    </code>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.subtitle || c.description || "—"}
                  </p>
                </div>
                <span
                  className={`hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline ${
                    c.is_published
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {c.is_published ? "Published" : "Draft"}
                </span>
                <div className="flex items-center gap-1">
                  <IconBtn title="History" onClick={() => setHistoryFor(c)} icon={History} />
                  <IconBtn
                    title={c.is_published ? "Unpublish" : "Publish"}
                    onClick={() => togglePublish.mutate(c)}
                    icon={c.is_published ? EyeOff : Eye}
                  />
                  <IconBtn title="Edit" onClick={() => setEditing(c)} icon={Pencil} />
                  <IconBtn title="Delete" onClick={() => setDeleteId(c.id)} icon={Trash2} danger />
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {editing && (
        <EditDrawer
          value={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => save.mutate(editing)}
          saving={save.isPending}
        />
      )}

      {historyFor && <HistoryDrawer content={historyFor} onClose={() => setHistoryFor(null)} />}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this content block?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && del.mutate(deleteId)}
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

function IconBtn({
  icon: Icon,
  onClick,
  title,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary ${
        danger ? "hover:text-red-600" : "hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function EditDrawer({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: Partial<Content>;
  onChange: (v: Partial<Content>) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = (patch: Partial<Content>) => onChange({ ...value, ...patch });
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-border bg-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="text-base font-bold text-foreground">
            {value.id ? "Edit section" : "New section"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <L label="Section key (unique)">
            <I
              value={value.section_key ?? ""}
              onChange={(v) => set({ section_key: v.replace(/\s+/g, "_").toLowerCase() })}
              placeholder="hero, problem, solution…"
            />
          </L>
          <L label="Title">
            <I value={value.title ?? ""} onChange={(v) => set({ title: v })} />
          </L>
          <L label="Subtitle">
            <I value={value.subtitle ?? ""} onChange={(v) => set({ subtitle: v })} />
          </L>
          <L label="Description">
            <textarea
              value={value.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Display order">
              <I
                type="number"
                value={String(value.display_order ?? 0)}
                onChange={(v) => set({ display_order: Number(v) || 0 })}
              />
            </L>
            <L label="Status">
              <button
                onClick={() => set({ is_published: !value.is_published })}
                className={`h-[38px] w-full rounded-lg text-sm font-semibold ${
                  value.is_published
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {value.is_published ? "Published" : "Draft"}
              </button>
            </L>
          </div>
          <button
            onClick={onSave}
            disabled={!value.section_key || saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save section
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryDrawer({ content, onClose }: { content: Content; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ["content-versions", content.id],
    queryFn: async () => {
      const { data } = await dbRead<{ id: string; snapshot: unknown; created_at: string }[]>({
        table: "content_versions",
        select: "id, snapshot, created_at",
        eq: [["entity_id", content.id]],
        order: { column: "created_at", ascending: false },
        limit: 30,
      });
      return data ?? [];
    },
  });
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-border bg-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="text-base font-bold text-foreground">Version history</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          {(data ?? []).length === 0 ? (
            <EmptyState
              icon={History}
              title="No previous versions"
              description="Edits will be versioned here."
            />
          ) : (
            (data ?? []).map((v) => {
              const snap = v.snapshot as { title?: string; subtitle?: string };
              return (
                <div key={v.id} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {snap.title || "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground">{snap.subtitle || ""}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
function I({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
    />
  );
}
