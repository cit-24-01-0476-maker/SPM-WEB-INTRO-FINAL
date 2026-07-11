import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/primitives";
import {
  ActionBar,
  EditorWorkspace,
  FieldCard,
  PublishedBadge,
  SelectField,
  SettingsGate,
  TextField,
  ToggleField,
} from "@/components/admin/editor";
import { DevicePreview } from "@/components/admin/DevicePreview";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin/auth";
import { useSettingsEditor } from "@/lib/cms/useEditor";
import {
  DEFAULT_NAVIGATION,
  safeNavHref,
  type NavItem,
  type NavLinkType,
  type NavigationSettings,
} from "@/lib/cms/model";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/navigation")({
  component: NavigationCms,
});

const linkTypeOptions: Array<{ value: NavLinkType; label: string }> = [
  { value: "internal", label: "Internal page" },
  { value: "anchor", label: "Section anchor" },
  { value: "external", label: "External URL" },
];

function newNavItem(): NavItem {
  return {
    id: `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "New link",
    shortLabel: "",
    linkType: "internal",
    to: "/",
    enabled: true,
    desktopVisible: true,
    mobileVisible: true,
    newTab: false,
  };
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function NavPreview({ nav }: { nav: NavigationSettings }) {
  const items = (nav.items ?? []).filter((i) => i.enabled && i.desktopVisible);
  return (
    <div className="min-h-full bg-gradient-hero p-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          {nav.logoUrl ? (
            <img
              src={nav.logoUrl}
              alt={nav.logoText}
              className="h-8 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-xs font-bold text-white">
                S
              </span>
              <span className="flex flex-col leading-none text-white">
                <span className="text-sm font-bold">{nav.logoText || "SPM ECO System"}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">
                  {nav.logoSubtitle || "Smart Parking"}
                </span>
              </span>
            </>
          )}
        </div>
        <div className="hidden items-center gap-1 rounded-full bg-white/10 p-1 md:flex">
          {items.map((i) => (
            <span
              key={i.id}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/85"
            >
              {i.label}
            </span>
          ))}
        </div>
        {nav.ctaEnabled ? (
          <span className="rounded-lg bg-gradient-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white">
            {nav.ctaLabel || "Request Demo"}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-center text-[11px] text-white/60">
        Draft preview — publish to update the live website.
      </p>
    </div>
  );
}

function NavItemCard({
  item,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  item: NavItem;
  index: number;
  total: number;
  onChange: (patch: Partial<NavItem>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const hrefWarn = safeNavHref(item.to) === "#" && item.to.trim() !== "";
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm font-semibold text-foreground">
          {item.label || "Untitled"}
        </span>
        <button
          onClick={() => onChange({ enabled: !item.enabled })}
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
          aria-label={item.enabled ? "Disable link" : "Enable link"}
          title={item.enabled ? "Enabled" : "Disabled"}
        >
          {item.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40"
          aria-label="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40"
          aria-label="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          onClick={onRemove}
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-red-600 hover:bg-red-500/10"
          aria-label="Remove link"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TextField label="Label" value={item.label} onChange={(v) => onChange({ label: v })} />
        <TextField
          label="Mobile label (optional)"
          value={item.shortLabel}
          onChange={(v) => onChange({ shortLabel: v })}
          placeholder="Same as label"
        />
        <SelectField
          label="Link type"
          value={item.linkType}
          options={linkTypeOptions}
          onChange={(v) => onChange({ linkType: v as NavLinkType })}
        />
        <TextField
          label="Target"
          value={item.to}
          onChange={(v) => onChange({ to: v })}
          placeholder={
            item.linkType === "anchor"
              ? "#pricing"
              : item.linkType === "external"
                ? "https://…"
                : "/features"
          }
          hint={hrefWarn ? "Unsafe link blocked" : undefined}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <ToggleField
          label="Desktop"
          checked={item.desktopVisible}
          onChange={(v) => onChange({ desktopVisible: v })}
        />
        <ToggleField
          label="Mobile"
          checked={item.mobileVisible}
          onChange={(v) => onChange({ mobileVisible: v })}
        />
        <ToggleField
          label="New tab"
          checked={item.newTab}
          onChange={(v) => onChange({ newTab: v })}
        />
      </div>
      {hrefWarn ? (
        <p className={cn("mt-2 text-[11px] font-medium text-red-600")}>
          This target uses an unsafe scheme and will be blocked on the live site.
        </p>
      ) : null}
    </div>
  );
}

function NavigationCms() {
  const editor = useSettingsEditor<NavigationSettings>("navigation", DEFAULT_NAVIGATION);
  const { draft, setDraft } = editor;
  const { hasAnyRole } = useAdminAuth();
  const isSuperAdmin = hasAnyRole(["super_admin"]);
  const set = (patch: Partial<NavigationSettings>) => setDraft((d) => ({ ...d, ...patch }));

  const updateItem = (id: string, patch: Partial<NavItem>) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  const removeItem = (id: string) =>
    setDraft((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));
  const moveItem = (index: number, dir: -1 | 1) =>
    setDraft((d) => ({ ...d, items: move(d.items, index, index + dir) }));
  const addItem = () => setDraft((d) => ({ ...d, items: [...d.items, newNavItem()] }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Navigation & Header"
        description="Manage the header logo, every navigation link and the Request Demo CTA. One published source controls both the desktop and mobile menus of the public website."
        actions={<PublishedBadge at={editor.meta?.publishedAt ?? null} />}
      />
      <SettingsGate
        loading={editor.loading}
        loadError={editor.loadError}
        initialized={editor.initialized}
        canInitialize={isSuperAdmin}
        initializing={editor.initializing}
        onInitialize={editor.initialize}
        onRetry={editor.reload}
      >
        <ActionBar
          dirty={editor.dirty}
          saving={editor.saving}
          publishing={editor.publishing}
          onSaveDraft={editor.saveDraft}
          onPublish={editor.publish}
          onResetPublished={editor.resetToPublished}
          onResetDefault={editor.resetToDefault}
          changedCount={0}
          canPublish={isSuperAdmin}
        />

        <EditorWorkspace
          preview={
            <DevicePreview height={280}>
              <NavPreview nav={draft} />
            </DevicePreview>
          }
          panel={
            <>
              <FieldCard title="Logo & branding">
                <TextField
                  label="Logo text"
                  value={draft.logoText}
                  onChange={(v) => set({ logoText: v })}
                />
                <TextField
                  label="Logo subtitle"
                  value={draft.logoSubtitle}
                  onChange={(v) => set({ logoSubtitle: v })}
                />
                <TextField
                  label="Logo image URL (optional)"
                  value={draft.logoUrl}
                  onChange={(v) => set({ logoUrl: v })}
                  placeholder="https://… (replaces the icon + text)"
                />
              </FieldCard>

              <FieldCard
                title="Navigation links"
                description="Reorder, rename, hide or add links. Changes apply to desktop and mobile."
              >
                <div className="space-y-3">
                  {draft.items.map((item, i) => (
                    <NavItemCard
                      key={item.id}
                      item={item}
                      index={i}
                      total={draft.items.length}
                      onChange={(patch) => updateItem(item.id, patch)}
                      onRemove={() => removeItem(item.id)}
                      onMove={(dir) => moveItem(i, dir)}
                    />
                  ))}
                  {draft.items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                      No navigation links. Add one below.
                    </p>
                  ) : null}
                  <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add navigation link
                  </Button>
                </div>
              </FieldCard>

              <FieldCard title="Request Demo CTA">
                <ToggleField
                  label="Show CTA button"
                  checked={draft.ctaEnabled}
                  onChange={(v) => set({ ctaEnabled: v })}
                />
                <TextField
                  label="CTA label"
                  value={draft.ctaLabel}
                  onChange={(v) => set({ ctaLabel: v })}
                />
                <TextField
                  label="CTA link"
                  value={draft.ctaLink}
                  onChange={(v) => set({ ctaLink: v })}
                />
                <ToggleField
                  label="Open CTA in new tab"
                  checked={draft.ctaNewTab}
                  onChange={(v) => set({ ctaNewTab: v })}
                />
              </FieldCard>

              <FieldCard title="Header behaviour">
                <ToggleField
                  label="Show theme toggle"
                  checked={draft.showThemeToggle}
                  onChange={(v) => set({ showThemeToggle: v })}
                />
                <ToggleField
                  label="Sticky header"
                  checked={draft.sticky}
                  onChange={(v) => set({ sticky: v })}
                />
              </FieldCard>
            </>
          }
        />
      </SettingsGate>
    </div>
  );
}
