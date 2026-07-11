import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Cloud,
  CloudOff,
  Copy,
  FileText,
  Film,
  Grid2x2,
  Image as ImageIcon,
  Link2,
  List,
  Loader2,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/admin/auth";
import {
  categoryFolder,
  categoryLabel,
  formatBytes,
  isImage,
  isVideo,
  MEDIA_CATEGORIES,
  validateFile,
  type MediaAsset,
  type MediaCategory,
  type MediaStatus,
} from "@/lib/media/types";
import {
  createMedia,
  deleteMedia,
  listMedia,
  setMediaStatus,
  updateMediaMeta,
} from "@/lib/media/store";
import { checkDriveConfigured, uploadToDrive } from "@/lib/media/upload-client";

export const Route = createFileRoute("/admin/media")({
  component: MediaLibrary,
});

interface UploadJob {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

const STATUS_FILTERS: { value: MediaStatus | "all"; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

function MediaLibrary() {
  const { user, isSuperAdmin } = useAdminAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MediaCategory | "all">("all");
  const [status, setStatus] = useState<MediaStatus | "all">("active");

  const [driveConfigured, setDriveConfigured] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>("sections");
  const fileInput = useRef<HTMLInputElement>(null);

  const [urlOpen, setUrlOpen] = useState(false);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setAssets(await listMedia());
    } catch {
      toast.error("Could not load media. Check your connection and admin permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    void checkDriveConfigured().then((r) => setDriveConfigured(r.configured));
  }, [reload]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assets.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (category !== "all" && a.category !== category) return false;
      if (term) {
        const hay = `${a.title} ${a.fileName} ${a.altText} ${a.caption}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [assets, search, category, status]);

  const runUpload = useCallback(
    async (files: File[]) => {
      if (!user) {
        toast.error("You must be signed in.");
        return;
      }
      if (driveConfigured === false) {
        toast.error("Google Drive isn't configured. Add media by URL instead.");
        return;
      }
      for (const file of files) {
        const invalid = validateFile(file);
        if (invalid) {
          toast.error(`${file.name}: ${invalid}`);
          continue;
        }
        const jobId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setJobs((j) => [...j, { id: jobId, name: file.name, progress: 0, status: "uploading" }]);
        try {
          const res = await uploadToDrive(file, categoryFolder(uploadCategory), (pct) =>
            setJobs((j) => j.map((x) => (x.id === jobId ? { ...x, progress: pct } : x))),
          );
          if (!res.asset) throw new Error(res.error ?? "Upload failed");
          await createMedia(
            {
              sourceType: "google_drive",
              driveFileId: res.asset.driveFileId,
              driveFolderId: res.asset.driveFolderId,
              fileName: res.asset.fileName,
              originalFileName: file.name,
              mimeType: res.asset.mimeType,
              fileSize: res.asset.fileSize,
              category: uploadCategory,
              title: file.name.replace(/\.[^.]+$/, ""),
              publicUrl: res.asset.publicUrl,
              previewUrl: res.asset.previewUrl,
              thumbnailUrl: res.asset.thumbnailUrl,
            },
            user.uid,
          );
          setJobs((j) =>
            j.map((x) => (x.id === jobId ? { ...x, progress: 100, status: "done" } : x)),
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setJobs((j) =>
            j.map((x) => (x.id === jobId ? { ...x, status: "error", error: msg } : x)),
          );
          toast.error(`${file.name}: ${msg}`);
        }
      }
      await reload();
      // Clear completed jobs after a short delay.
      setTimeout(() => setJobs((j) => j.filter((x) => x.status === "uploading")), 2500);
    },
    [user, driveConfigured, uploadCategory, reload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files ?? []);
      if (files.length) void runUpload(files);
    },
    [runUpload],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Upload, organize and reuse every image and video used across the website."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setUrlOpen(true)}>
              <Link2 className="mr-1.5 h-4 w-4" /> Add by URL
            </Button>
            <Button
              size="sm"
              onClick={() => fileInput.current?.click()}
              disabled={driveConfigured === false}
            >
              <UploadCloud className="mr-1.5 h-4 w-4" /> Upload
            </Button>
          </div>
        }
      />

      {/* Drive status banner */}
      <DriveBanner configured={driveConfigured} />

      {/* Upload dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-secondary/30",
          driveConfigured === false && "opacity-60",
        )}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,.svg,.pdf"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) void runUpload(files);
            e.target.value = "";
          }}
        />
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-white">
            <UploadCloud className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {driveConfigured === false
                ? "Google Drive upload not available"
                : "Drag & drop files here, or click Upload"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WebP, AVIF, SVG, GIF, MP4, WebM, MOV, PDF — up to 20MB each.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Upload to</span>
            <Select
              value={uploadCategory}
              onValueChange={(v) => setUploadCategory(v as MediaCategory)}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {jobs.length > 0 && (
          <div className="mx-auto mt-5 max-w-xl space-y-2 text-left">
            {jobs.map((j) => (
              <div key={j.id} className="rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-center gap-2 text-xs">
                  {j.status === "uploading" && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  )}
                  {j.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  {j.status === "error" && <X className="h-3.5 w-3.5 text-red-500" />}
                  <span className="truncate font-medium text-foreground">{j.name}</span>
                  <span className="ml-auto text-muted-foreground">
                    {j.status === "error" ? "Failed" : `${j.progress}%`}
                  </span>
                </div>
                {j.status === "uploading" && <Progress value={j.progress} className="mt-1.5 h-1" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={(v) => setCategory(v as MediaCategory | "all")}>
            <SelectTrigger className="h-10 w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {MEDIA_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as MediaStatus | "all")}>
            <SelectTrigger className="h-10 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-md",
                view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
              aria-label="Grid view"
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-md",
                view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media yet"
          description="Upload files from your device or add media by URL to get started."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => (
            <MediaCardGrid
              key={a.id}
              asset={a}
              canDelete={isSuperAdmin}
              onEdit={() => setEditing(a)}
              onCopy={() => copyUrl(a.publicUrl)}
              onArchive={() => void toggleArchive(a, user?.uid)}
              onDelete={() => setDeleting(a)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          {filtered.map((a) => (
            <MediaRow
              key={a.id}
              asset={a}
              canDelete={isSuperAdmin}
              onEdit={() => setEditing(a)}
              onCopy={() => copyUrl(a.publicUrl)}
              onArchive={() => void toggleArchive(a, user?.uid)}
              onDelete={() => setDeleting(a)}
            />
          ))}
        </div>
      )}

      {/* URL add dialog */}
      <UrlAddDialog open={urlOpen} onOpenChange={setUrlOpen} uid={user?.uid} onCreated={reload} />

      {/* Edit dialog */}
      <EditDialog
        asset={editing}
        onOpenChange={(o) => !o && setEditing(null)}
        uid={user?.uid}
        onSaved={reload}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this media?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes “{deleting?.title}” from the library. The file in Google Drive is not
              deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleting) return;
                try {
                  await deleteMedia(deleting.id);
                  toast.success("Media deleted");
                  setDeleting(null);
                  await reload();
                } catch {
                  toast.error("Could not delete. Super admin permission required.");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  async function toggleArchive(a: MediaAsset, uid?: string) {
    if (!uid) return;
    try {
      await setMediaStatus(a.id, a.status === "archived" ? "active" : "archived", uid);
      toast.success(a.status === "archived" ? "Restored" : "Archived");
      await reload();
    } catch {
      toast.error("Could not update media status.");
    }
  }
}

function copyUrl(url: string) {
  navigator.clipboard
    .writeText(url)
    .then(() => toast.success("Public URL copied"))
    .catch(() => toast.error("Could not copy URL"));
}

function DriveBanner({ configured }: { configured: boolean | null }) {
  if (configured === null || configured) {
    return configured ? (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
        <Cloud className="h-4 w-4" /> Google Drive is connected. Uploads are stored in the shared
        SPM-ECO-Media folder.
      </div>
    ) : null;
  }
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300">
      <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Google Drive is <strong>not configured</strong>. URL media mode is fully available. To
        enable drag-and-drop uploads, set the Google Drive server credentials (see SETUP.md).
      </span>
    </div>
  );
}

function MediaThumb({ asset, className }: { asset: MediaAsset; className?: string }) {
  if (isImage(asset)) {
    return (
      <img
        src={asset.thumbnailUrl || asset.publicUrl}
        alt={asset.altText || asset.title}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  const Icon = isVideo(asset) ? Film : FileText;
  return (
    <div className={cn("grid h-full w-full place-items-center bg-secondary", className)}>
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}

function MediaCardGrid({
  asset,
  canDelete,
  onEdit,
  onCopy,
  onArchive,
  onDelete,
}: {
  asset: MediaAsset;
  canDelete: boolean;
  onEdit: () => void;
  onCopy: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden">
        <MediaThumb asset={asset} />
        {asset.status === "archived" && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            Archived
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <IconBtn label="Edit" onClick={onEdit} icon={Pencil} />
          <IconBtn label="Copy URL" onClick={onCopy} icon={Copy} />
          <IconBtn
            label={asset.status === "archived" ? "Restore" : "Archive"}
            onClick={onArchive}
            icon={asset.status === "archived" ? ArchiveRestore : Archive}
          />
          {canDelete && <IconBtn label="Delete" onClick={onDelete} icon={Trash2} danger />}
        </div>
      </div>
      <div className="p-2.5">
        <p className="truncate text-sm font-medium text-foreground">{asset.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{categoryLabel(asset.category)}</span>
          <span>·</span>
          <span>
            {asset.fileSize
              ? formatBytes(asset.fileSize)
              : asset.sourceType === "external_url"
                ? "URL"
                : "—"}
          </span>
        </p>
      </div>
    </div>
  );
}

function MediaRow({
  asset,
  canDelete,
  onEdit,
  onCopy,
  onArchive,
  onDelete,
}: {
  asset: MediaAsset;
  canDelete: boolean;
  onEdit: () => void;
  onCopy: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5 last:border-b-0">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
        <MediaThumb asset={asset} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{asset.title}</p>
        <p className="truncate text-xs text-muted-foreground">{asset.fileName}</p>
      </div>
      <div className="hidden w-28 shrink-0 text-xs text-muted-foreground sm:block">
        {categoryLabel(asset.category)}
      </div>
      <div className="hidden w-20 shrink-0 text-xs text-muted-foreground md:block">
        {asset.fileSize ? formatBytes(asset.fileSize) : "—"}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <IconBtn label="Edit" onClick={onEdit} icon={Pencil} subtle />
        <IconBtn label="Copy URL" onClick={onCopy} icon={Copy} subtle />
        <IconBtn
          label={asset.status === "archived" ? "Restore" : "Archive"}
          onClick={onArchive}
          icon={asset.status === "archived" ? ArchiveRestore : Archive}
          subtle
        />
        {canDelete && <IconBtn label="Delete" onClick={onDelete} icon={Trash2} subtle danger />}
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  icon: Icon,
  danger,
  subtle,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Pencil;
  danger?: boolean;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg transition-colors",
        subtle
          ? "text-muted-foreground hover:bg-secondary"
          : "bg-white/90 text-foreground hover:bg-white",
        danger && "hover:text-red-600",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function UrlAddDialog({
  open,
  onOpenChange,
  uid,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  uid?: string;
  onCreated: () => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [category, setCategory] = useState<MediaCategory>("sections");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setUrl("");
      setTitle("");
      setAltText("");
      setCategory("sections");
    }
  }, [open]);

  function guessMime(u: string): string {
    const ext = u.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
    const map: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      avif: "image/avif",
      gif: "image/gif",
      svg: "image/svg+xml",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      pdf: "application/pdf",
    };
    return map[ext] ?? "image/jpeg";
  }

  async function save() {
    if (!uid) {
      toast.error("You must be signed in.");
      return;
    }
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error("Enter a valid http(s) URL.");
      return;
    }
    setSaving(true);
    try {
      const fileName = trimmed.split("/").pop()?.split("?")[0] || "external-media";
      await createMedia(
        {
          sourceType: "external_url",
          fileName,
          mimeType: guessMime(trimmed),
          category,
          title: title || fileName,
          altText,
          publicUrl: trimmed,
          previewUrl: trimmed,
          thumbnailUrl: trimmed,
        },
        uid,
      );
      toast.success("Media added");
      onOpenChange(false);
      await onCreated();
    } catch {
      toast.error("Could not add media. Check your admin permissions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add media by URL</DialogTitle>
          <DialogDescription>
            Reference an image or video hosted anywhere. Works even when Google Drive is not
            configured.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Media URL">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…/image.jpg"
            />
          </Field>
          {/^https?:\/\//i.test(url) && guessMime(url).startsWith("image/") && (
            <div className="overflow-hidden rounded-lg border border-border">
              <img
                src={url}
                alt="preview"
                className="max-h-40 w-full object-contain bg-secondary"
              />
            </div>
          )}
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          </Field>
          <Field label="Alt text">
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the media for accessibility"
            />
          </Field>
          <Field label="Category">
            <Select value={category} onValueChange={(v) => setCategory(v as MediaCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Add media
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  asset,
  onOpenChange,
  uid,
  onSaved,
}: {
  asset: MediaAsset | null;
  onOpenChange: (o: boolean) => void;
  uid?: string;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<MediaCategory>("sections");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (asset) {
      setTitle(asset.title);
      setAltText(asset.altText);
      setCaption(asset.caption);
      setCategory(asset.category);
    }
  }, [asset]);

  async function save() {
    if (!asset || !uid) return;
    setSaving(true);
    try {
      await updateMediaMeta(asset.id, { title, altText, caption, category }, uid);
      toast.success("Media updated");
      onOpenChange(false);
      await onSaved();
    } catch {
      toast.error("Could not update media.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!asset} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit media</DialogTitle>
          <DialogDescription>Update the metadata used across the website.</DialogDescription>
        </DialogHeader>
        {asset && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="aspect-video">
                <MediaThumb asset={asset} />
              </div>
            </div>
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Alt text">
              <Input value={altText} onChange={(e) => setAltText(e.target.value)} />
            </Field>
            <Field label="Caption">
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} />
            </Field>
            <Field label="Category">
              <Select value={category} onValueChange={(v) => setCategory(v as MediaCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              <span className="truncate">{asset.publicUrl}</span>
              <button
                className="ml-auto shrink-0 text-primary hover:underline"
                onClick={() => copyUrl(asset.publicUrl)}
              >
                Copy
              </button>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
