import { createFileRoute } from "@tanstack/react-router";
import { Check, Globe } from "lucide-react";
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
import { useAdminAuth } from "@/lib/admin/auth";
import { useSettingsEditor } from "@/lib/cms/useEditor";
import {
  DEFAULT_LANGUAGES,
  type LanguageCode,
  type LanguageSettings,
  type LanguageSwitcherVariant,
} from "@/lib/cms/model";

export const Route = createFileRoute("/admin/languages")({
  component: LanguagesPage,
});

function LanguagesPage() {
  const editor = useSettingsEditor<LanguageSettings>("languages", DEFAULT_LANGUAGES);
  const { draft, setDraft } = editor;
  const { hasAnyRole } = useAdminAuth();
  const isSuperAdmin = hasAnyRole(["super_admin"]);

  const set = (patch: Partial<LanguageSettings>) => setDraft((d) => ({ ...d, ...patch }));
  const setStyle = (patch: Partial<LanguageSettings["style"]>) =>
    setDraft((d) => ({ ...d, style: { ...d.style, ...patch } }));
  const setLabel = (code: LanguageCode, value: string) =>
    setDraft((d) => ({ ...d, labels: { ...d.labels, [code]: value } }));
  const setShort = (code: LanguageCode, value: string) =>
    setDraft((d) => ({ ...d, shortLabels: { ...d.shortLabels, [code]: value } }));

  const toggleEnabled = (code: LanguageCode, on: boolean) =>
    setDraft((d) => {
      const others = d.enabledLanguages.filter((c) => c !== code && c !== "en");
      const next: LanguageCode[] = on && code !== "en" ? [...others, code] : others;
      // English can never be disabled — it is the default and fallback.
      const ordered: LanguageCode[] = ["en", ...next];
      return { ...d, enabledLanguages: ordered };
    });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Languages"
        description="Control the public English / Sinhala language switcher. English is always the default and fallback. Publishing updates the live website instantly — no redeploy."
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
            <DevicePreview height={220}>
              <SwitcherPreview settings={draft} />
            </DevicePreview>
          }
          panel={
            <>
              <FieldCard
                title="Language switcher"
                description="Turn the public language button on or off. When off, the website stays in English and the button is hidden everywhere — Sinhala translations are preserved."
              >
                <ToggleField
                  label="Enable language switcher"
                  description="Show the EN / සිංහල selector on the public website"
                  checked={draft.languageSwitcherEnabled}
                  onChange={(v) => set({ languageSwitcherEnabled: v })}
                />
                <SelectField
                  label="Default language"
                  value={draft.defaultLanguage}
                  options={[
                    { value: "en", label: "English" },
                    { value: "si", label: "සිංහල (Sinhala)" },
                  ]}
                  onChange={(v) => set({ defaultLanguage: v as LanguageCode })}
                />
              </FieldCard>

              <FieldCard
                title="Enabled languages"
                description="English is always enabled as the default and fallback."
              >
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">English</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Always enabled — default & fallback
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <ToggleField
                  label="සිංහල (Sinhala)"
                  description="Allow visitors to switch to Sinhala"
                  checked={draft.enabledLanguages.includes("si")}
                  onChange={(v) => toggleEnabled("si", v)}
                />
              </FieldCard>

              <FieldCard title="Labels">
                <TextField
                  label="English label"
                  value={draft.labels.en}
                  onChange={(v) => setLabel("en", v)}
                />
                <TextField
                  label="Sinhala label"
                  value={draft.labels.si}
                  onChange={(v) => setLabel("si", v)}
                />
                <TextField
                  label="English short label"
                  value={draft.shortLabels.en}
                  onChange={(v) => setShort("en", v)}
                />
                <TextField
                  label="Sinhala short label"
                  value={draft.shortLabels.si}
                  onChange={(v) => setShort("si", v)}
                />
              </FieldCard>

              <FieldCard title="Placement">
                <ToggleField
                  label="Show in header"
                  checked={draft.showInHeader}
                  onChange={(v) => set({ showInHeader: v })}
                />
                <ToggleField
                  label="Show in mobile menu"
                  checked={draft.showInMobileMenu}
                  onChange={(v) => set({ showInMobileMenu: v })}
                />
                <ToggleField
                  label="Show in footer"
                  checked={draft.showInFooter}
                  onChange={(v) => set({ showInFooter: v })}
                />
              </FieldCard>

              <FieldCard title="Behaviour">
                <ToggleField
                  label="Remember visitor preference"
                  description="Store only the chosen language code on the visitor's device"
                  checked={draft.rememberPreference}
                  onChange={(v) => set({ rememberPreference: v })}
                />
                <ToggleField
                  label="Auto-detect browser language"
                  description="Use the browser language on first visit (English stays the fallback)"
                  checked={draft.autoDetectBrowserLanguage}
                  onChange={(v) => set({ autoDetectBrowserLanguage: v })}
                />
              </FieldCard>

              <FieldCard title="Button style">
                <SelectField
                  label="Variant"
                  value={draft.style.variant}
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "pill", label: "Pill" },
                    { value: "full", label: "Full" },
                  ]}
                  onChange={(v) => setStyle({ variant: v as LanguageSwitcherVariant })}
                />
                <ToggleField
                  label="Show globe icon"
                  checked={draft.style.showIcon}
                  onChange={(v) => setStyle({ showIcon: v })}
                />
                <ToggleField
                  label="Show language code"
                  checked={draft.style.showLanguageCode}
                  onChange={(v) => setStyle({ showLanguageCode: v })}
                />
                <ToggleField
                  label="Show language name"
                  checked={draft.style.showLanguageName}
                  onChange={(v) => setStyle({ showLanguageName: v })}
                />
              </FieldCard>
            </>
          }
        />
      </SettingsGate>
    </div>
  );
}

function SwitcherPreview({ settings }: { settings: LanguageSettings }) {
  const enabled = settings.languageSwitcherEnabled && settings.enabledLanguages.length >= 2;
  const active = settings.defaultLanguage;
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-background p-6">
      {enabled ? (
        <div className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm">
          {settings.style.showIcon ? <Globe className="h-4 w-4" /> : null}
          {settings.style.showLanguageCode ? (
            <span lang={active}>{settings.shortLabels[active]}</span>
          ) : null}
          {settings.style.showLanguageName ? (
            <span lang={active}>{settings.labels[active]}</span>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Switcher hidden — public website stays in English.
        </p>
      )}
      {enabled ? (
        <div className="w-full max-w-[12rem] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-sm">
          {settings.enabledLanguages.map((c) => (
            <div
              key={c}
              lang={c}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                c === active ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              {settings.labels[c]}
              {c === active ? <Check className="h-4 w-4 text-primary" /> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
