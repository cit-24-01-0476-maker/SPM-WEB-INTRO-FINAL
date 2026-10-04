import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/primitives";
import {
  ActionBar,
  FieldCard,
  SettingsGate,
  TextField,
  ToggleField,
} from "@/components/admin/editor";
import { DEFAULT_SITE, type SiteSettings } from "@/lib/cms/model";
import { useSettingsEditor } from "@/lib/cms/useEditor";
import { useAdminAuth } from "@/lib/admin/auth";
import { useState } from "react";
import { ApkReleaseEditor } from "@/components/admin/ApkReleaseEditor";
export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });
function SettingsPage() {
  const editor = useSettingsEditor<SiteSettings>("site", DEFAULT_SITE);
  const { isSuperAdmin } = useAdminAuth();
  const [uploadingApk, setUploadingApk] = useState(false);
  const set = (patch: Partial<SiteSettings>) => editor.setDraft((prev) => ({ ...prev, ...patch }));
  return (
    <div className="space-y-5">
      <PageHeader
        title="Website Settings"
        description="Edit the published website identity. Save a draft, then publish when ready."
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
          saving={editor.saving || uploadingApk}
          publishing={editor.publishing || uploadingApk}
          onSaveDraft={editor.saveDraft}
          onPublish={editor.publish}
          onResetPublished={editor.resetToPublished}
          onResetDefault={editor.resetToDefault}
          changedCount={editor.dirty ? 1 : 0}
          canPublish={isSuperAdmin}
        />
        <ApkReleaseEditor
          value={editor.draft}
          onChange={set}
          canUpload={isSuperAdmin}
          disabled={editor.saving || editor.publishing}
          onBusyChange={setUploadingApk}
        />
        <FieldCard title="Site identity">
          <TextField
            label="Site name"
            value={editor.draft.siteName}
            onChange={(siteName) => set({ siteName })}
          />
          <TextField
            label="Site tagline"
            value={editor.draft.siteTagline}
            onChange={(siteTagline) => set({ siteTagline })}
          />
          <TextField
            label="Fallback logo URL"
            value={editor.draft.logoUrl}
            onChange={(logoUrl) => set({ logoUrl })}
            hint="Navigation logo takes priority"
          />
          <TextField
            label="Favicon URL"
            value={editor.draft.faviconUrl}
            onChange={(faviconUrl) => set({ faviconUrl })}
          />
          <ToggleField
            label="Maintenance mode"
            description="Show a maintenance notice on marketing pages after publishing"
            checked={editor.draft.maintenanceMode}
            onChange={(maintenanceMode) => set({ maintenanceMode })}
          />
        </FieldCard>
        <FieldCard title="Related settings">
          <div className="flex flex-wrap gap-4 text-sm text-primary">
            <Link to="/admin/navigation">Header & navigation</Link>
            <Link to="/admin/languages">Languages</Link>
            <Link to="/admin/contact-info">Contact information</Link>
          </div>
        </FieldCard>
      </SettingsGate>
    </div>
  );
}
