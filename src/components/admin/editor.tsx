// Shared premium admin editor primitives for the CMS Design Studio, Hero CMS
// and Contact settings. Fully responsive; controls never clip or overflow.

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Undo2,
  UploadCloud,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { contrastRating, contrastRatio } from "@/lib/cms/apply";

/* --- status badges --------------------------------------------------- */

export function DraftBadge({ dirty }: { dirty: boolean }) {
  return dirty ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/12 px-2.5 py-0.5 text-xs font-semibold text-amber-600 ring-1 ring-inset ring-amber-500/25">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Unsaved changes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/25">
      <Check className="h-3 w-3" /> Saved
    </span>
  );
}

export function PublishedBadge({ at }: { at: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
      {at ? `Published ${new Date(at).toLocaleDateString()}` : "Not published yet"}
    </span>
  );
}

/* --- sticky action bar ---------------------------------------------- */

export function ActionBar({
  dirty,
  saving,
  publishing,
  onSaveDraft,
  onPublish,
  onResetPublished,
  onResetDefault,
  changedCount,
  canPublish = true,
}: {
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onResetPublished: () => void;
  onResetDefault: () => void;
  changedCount: number;
  canPublish?: boolean;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-5 flex flex-wrap items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <DraftBadge dirty={dirty} />
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          onClick={onResetPublished}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Undo2 className="h-3.5 w-3.5" /> Restore Published
        </button>
        <button
          onClick={onResetDefault}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Default
        </button>
        <button
          onClick={onSaveDraft}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Draft"}
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={!canPublish || publishing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UploadCloud className="h-3.5 w-3.5" /> {publishing ? "Publishing…" : "Publish"}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish to the live website?</AlertDialogTitle>
              <AlertDialogDescription>
                This copies your current draft into the published settings. The public website will
                update immediately.{" "}
                {changedCount > 0 ? `${changedCount} field group(s) changed.` : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onPublish}>Publish now</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/* --- layout: settings panel + preview ------------------------------- */

export function EditorWorkspace({ panel, preview }: { panel: ReactNode; preview: ReactNode }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-5">{panel}</div>
      <div className="min-w-0">{preview}</div>
    </div>
  );
}

export function FieldCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/* --- individual field controls -------------------------------------- */

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-medium text-foreground">
        {label}
        {hint ? <span className="font-normal text-muted-foreground">{hint}</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <FieldRow label={label} hint={hint}>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldRow>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <FieldRow label={label}>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldRow>
  );
}

export function SelectField({
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
    <FieldRow label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldRow>
  );
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {description ? (
          <p className="truncate text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <FieldRow label={label} hint={`${value}${suffix}`}>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </FieldRow>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  onReset,
  contrastAgainst,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onReset?: () => void;
  contrastAgainst?: string;
}) {
  const [text, setText] = useState(value);
  // keep local text in sync when value changes externally
  if (
    text.toLowerCase() !== value.toLowerCase() &&
    document.activeElement?.getAttribute("data-color") !== label
  ) {
    // no-op guard; controlled below
  }
  const rating = contrastAgainst ? contrastRating(contrastRatio(value, contrastAgainst)) : null;
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={/^#([a-f\d]{6})$/i.test(value) ? value : "#000000"}
        onChange={(e) => {
          onChange(e.target.value);
          setText(e.target.value);
        }}
        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
        aria-label={`${label} color picker`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-xs font-medium text-foreground">{label}</span>
          {rating ? (
            <span
              className={cn(
                "ml-2 inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold",
                rating.tone === "good" && "text-emerald-600",
                rating.tone === "ok" && "text-amber-600",
                rating.tone === "bad" && "text-red-600",
              )}
            >
              {rating.tone === "bad" ? <AlertTriangle className="h-3 w-3" /> : null}
              {rating.label}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <Input
            data-color={label}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (/^#([a-f\d]{6})$/i.test(e.target.value)) onChange(e.target.value);
            }}
            className="h-7 font-mono text-xs"
          />
          {onReset ? (
            <button
              onClick={() => {
                onReset();
              }}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
              aria-label={`Reset ${label}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* --- gate: loading / not-initialized / permission states ------------- */

function CenteredState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}

/**
 * Wraps an editor body, rendering accurate states for loading, permission
 * errors and uninitialized settings. Only super_admins see the initialize CTA.
 */
export function SettingsGate({
  loading,
  loadError,
  initialized,
  canInitialize,
  initializing,
  onInitialize,
  onRetry,
  children,
}: {
  loading: boolean;
  loadError: "permission" | "network" | "unknown" | null;
  initialized: boolean;
  canInitialize: boolean;
  initializing: boolean;
  onInitialize: () => void;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  if (loadError === "permission") {
    return (
      <CenteredState
        icon={AlertTriangle}
        title="Firestore blocked access"
        description="Publish the updated security rules and confirm that your admin account is active, then retry."
      >
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:brightness-110"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </CenteredState>
    );
  }

  if (!initialized) {
    return (
      <CenteredState
        icon={Sparkles}
        title="Website settings have not been initialized"
        description={
          canInitialize
            ? "Create the default published and draft settings documents to start editing."
            : "A super admin must initialize the website settings before this section can be edited."
        }
      >
        {canInitialize ? (
          <button
            onClick={onInitialize}
            disabled={initializing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:brightness-110 disabled:opacity-50"
          >
            {initializing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {initializing ? "Initializing…" : "Initialize Website Settings"}
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        )}
      </CenteredState>
    );
  }

  return <>{children}</>;
}

export { AlertTriangle };
