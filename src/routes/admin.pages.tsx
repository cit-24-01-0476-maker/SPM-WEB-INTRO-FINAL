import { DataError } from "@/components/admin/DataError";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Layers,
  Plus,
  Copy,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { dbRead, dbWrite } from "@/lib/admin/db";
import { useAdminAuth } from "@/lib/admin/auth";
import { PageHeader, AdminCard, EmptyState } from "@/components/admin/primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/pages")({
  component: PagesPage,
});

const SECTION_TYPES = [
  "hero",
  "text_image",
  "feature_grid",
  "statistics",
  "video",
  "dashboard_preview",
  "mobile_preview",
  "timeline",
  "process_flow",
  "faq",
  "cta",
  "contact_form",
  "tech_stack",
  "team",
  "gallery",
] as const;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  text_image: "Text + Image Split",
  feature_grid: "Feature Card Grid",
  statistics: "Statistics",
  video: "Video Section",
  dashboard_preview: "Dashboard Preview",
  mobile_preview: "Mobile App Preview",
  timeline: "Timeline",
  process_flow: "Process Flow",
  faq: "FAQ",
  cta: "Call to Action",
  contact_form: "Contact Form",
  tech_stack: "Technology Stack",
  team: "Team",
  gallery: "Gallery",
};

interface Page {
  id: string;
  slug: string;
  title: string;
  status: string;
  display_order: number;
}
interface Section {
  id: string;
  page_id: string;
  type: string;
  content: { heading?: string; text?: string };
  display_order: number;
  is_visible: boolean;
}

function PagesPage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const [activeId, setActiveId] = useState<string | null>(null);

  const pages = useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data } = await dbRead<Page[]>({
        table: "pages",
        select: "id, slug, title, status, display_order",
        order: { column: "display_order", ascending: true },
      });
      return (data ?? []) as Page[];
    },
  });

  useEffect(() => {
    if (!activeId && pages.data && pages.data.length) setActiveId(pages.data[0].id);
  }, [pages.data, activeId]);

  const createPage = useMutation({
    mutationFn: async () => {
      const n = (pages.data?.length ?? 0) + 1;
      const { data } = await dbWrite<{ id: string }>({
        op: "insert",
        table: "pages",
        values: {
          slug: `new-page-${crypto.randomUUID().slice(0, 8)}`,
          title: `New Page ${n}`,
          status: "draft",
          display_order: n,
        },
        select: "id",
        single: true,
      });
      return data.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      setActiveId(id);
      toast.success("Page created");
    },
    onError: (e) => toast.error("Could not create page", { description: (e as Error).message }),
  });

  const duplicatePage = useMutation({
    mutationFn: async (page: Page) => {
      const { data: newPage } = await dbWrite<{ id: string }>({
        op: "insert",
        table: "pages",
        values: {
          slug: `${page.slug}-copy-${crypto.randomUUID().slice(0, 8)}`,
          title: `${page.title} (Copy)`,
          status: "draft",
          display_order: (pages.data?.length ?? 0) + 1,
        },
        select: "id",
        single: true,
      });
      const { data: secs } = await dbRead<
        { type: string; content: unknown; display_order: number; is_visible: boolean }[]
      >({
        table: "sections",
        select: "*",
        eq: [["page_id", page.id]],
      });
      if (secs?.length) {
        await dbWrite({
          op: "insert",
          table: "sections",
          values: secs.map((s) => ({
            page_id: newPage.id,
            type: s.type,
            content: s.content,
            display_order: s.display_order,
            is_visible: s.is_visible,
          })),
        });
      }
      return newPage.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      setActiveId(id);
      toast.success("Page duplicated");
    },
    onError: (e) => toast.error("Could not duplicate page", { description: (e as Error).message }),
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      await dbWrite({ op: "delete", table: "pages", eq: [["id", id]] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      setActiveId(null);
      toast.success("Page deleted");
    },
    onError: (e) => toast.error("Could not delete page", { description: (e as Error).message }),
  });

  if (pages.isError) return <DataError onRetry={() => void pages.refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages & Builder"
        description="Create pages and assemble them from reusable sections. Drag to reorder, toggle visibility, save drafts and publish."
        actions={
          <button
            onClick={() => createPage.mutate()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            <Plus className="h-4 w-4" /> New page
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminCard title="Pages">
          {pages.isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
              ))}
            </div>
          ) : (pages.data?.length ?? 0) === 0 ? (
            <EmptyState icon={FileText} title="No pages" description="Create your first page." />
          ) : (
            <ul className="space-y-1">
              {pages.data!.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setActiveId(p.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      activeId === p.id
                        ? "bg-secondary font-semibold text-foreground"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-foreground">{p.title}</span>
                      <span className="block truncate font-mono text-[11px] text-muted-foreground">
                        /{p.slug}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        p.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        {activeId ? (
          <PageEditor
            key={activeId}
            page={pages.data?.find((p) => p.id === activeId)}
            userId={user?.uid ?? null}
            onDuplicate={(p) => duplicatePage.mutate(p)}
            onDelete={(id) => deletePage.mutate(id)}
          />
        ) : (
          <AdminCard>
            <EmptyState
              icon={Layers}
              title="Select a page"
              description="Choose a page to edit its sections."
            />
          </AdminCard>
        )}
      </div>
    </div>
  );
}

function PageEditor({
  page,
  userId,
  onDuplicate,
  onDelete,
}: {
  page?: Page;
  userId: string | null;
  onDuplicate: (p: Page) => void;
  onDelete: (id: string) => void;
}) {
  const qc = useQueryClient();
  const [meta, setMeta] = useState<Page | null>(page ?? null);
  const [sections, setSections] = useState<Section[]>([]);
  const [addType, setAddType] = useState<string>("hero");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => setMeta(page ?? null), [page]);

  const sectionsQuery = useQuery({
    queryKey: ["sections", page?.id],
    enabled: !!page,
    queryFn: async () => {
      const { data } = await dbRead<Section[]>({
        table: "sections",
        select: "*",
        eq: [["page_id", page!.id]],
        order: { column: "display_order", ascending: true },
      });
      return (data ?? []) as Section[];
    },
  });

  useEffect(() => {
    if (sectionsQuery.data) setSections(sectionsQuery.data);
  }, [sectionsQuery.data]);

  const saveMeta = useMutation({
    mutationFn: async () => {
      if (!meta) return;
      await dbWrite({
        op: "update",
        table: "pages",
        values: {
          title: meta.title,
          slug: meta.slug,
          status: meta.status,
          published_at: meta.status === "published" ? new Date().toISOString() : null,
        },
        eq: [["id", meta.id]],
      });
      if (userId) {
        await dbWrite({
          op: "insert",
          table: "audit_logs",
          values: {
            actor_id: null,
            action: meta.status === "published" ? "content_publish" : "content_edit",
            entity: "pages",
            entity_id: meta.id,
            metadata: { firebase_uid: userId },
          },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page saved");
    },
    onError: (e) => toast.error("Save failed", { description: (e as Error).message }),
  });

  async function persistOrder(next: Section[]) {
    await Promise.all(
      next.map((s, i) =>
        dbWrite({
          op: "update",
          table: "sections",
          values: { display_order: i + 1 },
          eq: [["id", s.id]],
        }),
      ),
    );
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const next = arrayMove(sections, oldIndex, newIndex);
    setSections(next);
    void persistOrder(next).catch(() => {
      setSections(sectionsQuery.data ?? []);
      void sectionsQuery.refetch();
      toast.error("Order could not be saved. Reloaded the saved order.");
    });
  }

  const addSection = useMutation({
    mutationFn: async () => {
      await dbWrite({
        op: "insert",
        table: "sections",
        values: {
          page_id: page!.id,
          type: addType,
          content: { heading: SECTION_LABELS[addType], text: "" },
          display_order: sections.length + 1,
          is_visible: true,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sections", page?.id] });
      toast.success("Section added");
    },
    onError: (e) => toast.error("Could not add section", { description: (e as Error).message }),
  });

  if (sectionsQuery.isError) return <DataError onRetry={() => void sectionsQuery.refetch()} />;
  if (!meta) return null;

  return (
    <div className="space-y-6">
      <AdminCard
        title="Page settings"
        actions={
          <div className="flex items-center gap-1">
            <button
              onClick={() => page && onDuplicate(page)}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(meta.id)}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-red-600"
              title="Delete page"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">Title</span>
            <input
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">URL slug</span>
            <input
              value={meta.slug}
              onChange={(e) =>
                setMeta({ ...meta, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">Status</span>
            <Select value={meta.status} onValueChange={(v) => setMeta({ ...meta, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <div className="flex items-end">
            <button
              onClick={() => saveMeta.mutate()}
              disabled={saveMeta.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {saveMeta.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save page
            </button>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Sections"
        description="Drag to reorder. Toggle visibility per section."
        actions={
          <div className="flex items-center gap-2">
            <Select value={addType} onValueChange={setAddType}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {SECTION_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={() => addSection.mutate()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        }
      >
        {sections.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No sections yet"
            description="Add reusable sections to build this page."
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((s) => (
                  <SortableSection
                    key={s.id}
                    section={s}
                    pageId={page!.id}
                    onChanged={() => qc.invalidateQueries({ queryKey: ["sections", page?.id] })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </AdminCard>
    </div>
  );
}

function SortableSection({
  section,
  pageId,
  onChanged,
}: {
  section: Section;
  pageId: string;
  onChanged: () => void;
}) {
  const qc = useQueryClient();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const [open, setOpen] = useState(false);
  const [heading, setHeading] = useState(section.content?.heading ?? "");
  const [text, setText] = useState(section.content?.text ?? "");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  async function toggleVisible() {
    try {
      await dbWrite({
        op: "update",
        table: "sections",
        values: { is_visible: !section.is_visible },
        eq: [["id", section.id]],
      });
      onChanged();
    } catch (error) {
      toast.error("Section change failed", { description: (error as Error).message });
    }
  }
  async function remove() {
    try {
      await dbWrite({ op: "delete", table: "sections", eq: [["id", section.id]] });
      qc.invalidateQueries({ queryKey: ["sections", pageId] });
      toast.success("Section removed");
    } catch (error) {
      toast.error("Section change failed", { description: (error as Error).message });
    }
  }
  async function saveContent() {
    try {
      await dbWrite({
        op: "update",
        table: "sections",
        values: { content: { heading, text } },
        eq: [["id", section.id]],
      });
      onChanged();
      setOpen(false);
      toast.success("Section updated");
    } catch (error) {
      toast.error("Section change failed", { description: (error as Error).message });
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
          {section.display_order}
        </span>
        <button onClick={() => setOpen((v) => !v)} className="flex-1 text-left">
          <span className="text-sm font-semibold text-foreground">
            {SECTION_LABELS[section.type] ?? section.type}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {section.content?.heading || "Untitled"}
          </span>
        </button>
        <button
          onClick={toggleVisible}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
          title={section.is_visible ? "Hide" : "Show"}
        >
          {section.is_visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4 text-amber-600" />
          )}
        </button>
        <button
          onClick={remove}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-red-600"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-border p-3">
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Heading"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Content text"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={saveContent}
            className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
          >
            Save section
          </button>
        </div>
      )}
    </div>
  );
}
