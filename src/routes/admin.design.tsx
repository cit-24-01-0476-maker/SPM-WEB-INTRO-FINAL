import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/primitives";
import {
  ActionBar,
  ColorField,
  EditorWorkspace,
  FieldCard,
  PublishedBadge,
  SelectField,
  SettingsGate,
  SliderField,
  TextField,
  ToggleField,
} from "@/components/admin/editor";
import { useAdminAuth } from "@/lib/admin/auth";
import { DevicePreview } from "@/components/admin/DevicePreview";
import { DesignPreviewMock } from "@/components/admin/DesignPreviewMock";
import { useSettingsEditor } from "@/lib/cms/useEditor";
import {
  ANIMATION_PRESETS,
  BACKGROUND_FIELDS,
  COLOR_FIELDS,
  COLOR_PRESETS,
  DEFAULT_COLORS,
  DEFAULT_DESIGN,
  EFFECT_FIELDS,
  SAFE_FONTS,
  type AnimationPreset,
  type BackgroundType,
  type ColorKey,
  type DesignSettings,
} from "@/lib/cms/model";

export const Route = createFileRoute("/admin/design")({
  component: DesignStudio,
});

const fontOptions = SAFE_FONTS.map((f) => ({ value: f, label: f }));

function DesignStudio() {
  const editor = useSettingsEditor<DesignSettings>("design", DEFAULT_DESIGN);
  const { draft, setDraft } = editor;
  const { hasAnyRole } = useAdminAuth();
  const isSuperAdmin = hasAnyRole(["super_admin"]);
  const [tab, setTab] = useState("colors");

  const changedCount = useMemo(() => {
    let n = 0;
    for (const key of Object.keys(draft) as Array<keyof DesignSettings>) {
      if (JSON.stringify(draft[key]) !== JSON.stringify(editor.published[key])) n++;
    }
    return n;
  }, [draft, editor.published]);

  const setColor = (key: ColorKey, v: string) =>
    setDraft((d) => ({ ...d, colors: { ...d.colors, [key]: v } }));

  const applyPreset = (id: string) => {
    const preset = COLOR_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setDraft((d) => ({ ...d, colors: { ...d.colors, ...preset.colors } }));
  };

  const applyAnimationPreset = (preset: AnimationPreset) => {
    setDraft((d) => ({
      ...d,
      animations: {
        ...d.animations,
        preset,
        ...(preset !== "custom" ? ANIMATION_PRESETS[preset] : {}),
      },
    }));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Design Studio"
        description="Control the SPM ECO visual system — colours, typography, buttons, effects, animations and backgrounds. Edit a draft, preview it, then publish."
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
          changedCount={changedCount}
          canPublish={isSuperAdmin}
        />

        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto">
            <TabsList className="flex w-max min-w-full">
              <TabsTrigger value="colors">Brand Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
              <TabsTrigger value="animations">Animations</TabsTrigger>
              <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
              <TabsTrigger value="presets">Saved Presets</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-5">
            <EditorWorkspace
              preview={
                <DevicePreview height={640}>
                  <DesignPreviewMock design={draft} />
                </DevicePreview>
              }
              panel={
                <>
                  <TabsContent value="colors" className="m-0 space-y-4">
                    <ColorsPanel draft={draft} setColor={setColor} />
                  </TabsContent>
                  <TabsContent value="typography" className="m-0 space-y-4">
                    <TypographyPanel draft={draft} setDraft={setDraft} />
                  </TabsContent>
                  <TabsContent value="buttons" className="m-0 space-y-4">
                    <ButtonsPanel draft={draft} setDraft={setDraft} />
                  </TabsContent>
                  <TabsContent value="effects" className="m-0 space-y-4">
                    <EffectsPanel draft={draft} setDraft={setDraft} />
                  </TabsContent>
                  <TabsContent value="animations" className="m-0 space-y-4">
                    <AnimationsPanel
                      draft={draft}
                      setDraft={setDraft}
                      applyPreset={applyAnimationPreset}
                    />
                  </TabsContent>
                  <TabsContent value="backgrounds" className="m-0 space-y-4">
                    <BackgroundsPanel draft={draft} setDraft={setDraft} />
                  </TabsContent>
                  <TabsContent value="presets" className="m-0 space-y-4">
                    <PresetsPanel applyPreset={applyPreset} />
                  </TabsContent>
                </>
              }
            />
          </div>
        </Tabs>
      </SettingsGate>
    </div>
  );
}

/* --- panels ---------------------------------------------------------- */

function ColorsPanel({
  draft,
  setColor,
}: {
  draft: DesignSettings;
  setColor: (k: ColorKey, v: string) => void;
}) {
  const groups = Array.from(new Set(COLOR_FIELDS.map((f) => f.group)));
  const contrastMap: Partial<Record<ColorKey, string>> = {
    mainText: draft.colors.lightBackground,
    secondaryText: draft.colors.lightBackground,
    primaryNavy: "#ffffff",
    techBlue: draft.colors.buttonGradientStart ? "#ffffff" : "#ffffff",
  };
  return (
    <>
      {groups.map((group) => (
        <FieldCard key={group} title={group}>
          {COLOR_FIELDS.filter((f) => f.group === group).map((f) => (
            <ColorField
              key={f.key}
              label={f.label}
              value={draft.colors[f.key]}
              onChange={(v) => setColor(f.key, v)}
              onReset={() => setColor(f.key, DEFAULT_COLORS[f.key])}
              contrastAgainst={contrastMap[f.key]}
            />
          ))}
        </FieldCard>
      ))}
    </>
  );
}

function TypographyPanel({
  draft,
  setDraft,
}: {
  draft: DesignSettings;
  setDraft: (u: (d: DesignSettings) => DesignSettings) => void;
}) {
  const t = draft.typography;
  const set = (patch: Partial<DesignSettings["typography"]>) =>
    setDraft((d) => ({ ...d, typography: { ...d.typography, ...patch } }));
  return (
    <>
      <FieldCard title="Font Families" description="Safe font allow-list only.">
        <SelectField
          label="Heading font"
          value={t.headingFont}
          options={fontOptions}
          onChange={(v) => set({ headingFont: v })}
        />
        <SelectField
          label="Body font"
          value={t.bodyFont}
          options={fontOptions}
          onChange={(v) => set({ bodyFont: v })}
        />
        <SelectField
          label="Navigation font"
          value={t.navFont}
          options={fontOptions}
          onChange={(v) => set({ navFont: v })}
        />
        <SelectField
          label="Button font"
          value={t.buttonFont}
          options={fontOptions}
          onChange={(v) => set({ buttonFont: v })}
        />
      </FieldCard>
      <FieldCard title="Sizes & Weight">
        <SliderField
          label="Hero title"
          value={t.heroTitleSize}
          min={36}
          max={96}
          suffix="px"
          onChange={(v) => set({ heroTitleSize: v })}
        />
        <SliderField
          label="Section title"
          value={t.sectionTitleSize}
          min={24}
          max={64}
          suffix="px"
          onChange={(v) => set({ sectionTitleSize: v })}
        />
        <SliderField
          label="Subheading"
          value={t.subheadingSize}
          min={16}
          max={32}
          suffix="px"
          onChange={(v) => set({ subheadingSize: v })}
        />
        <SliderField
          label="Body text"
          value={t.bodyTextSize}
          min={13}
          max={20}
          suffix="px"
          onChange={(v) => set({ bodyTextSize: v })}
        />
        <SliderField
          label="Small text"
          value={t.smallTextSize}
          min={11}
          max={16}
          suffix="px"
          onChange={(v) => set({ smallTextSize: v })}
        />
        <SliderField
          label="Heading weight"
          value={t.headingWeight}
          min={500}
          max={900}
          step={100}
          onChange={(v) => set({ headingWeight: v })}
        />
        <SliderField
          label="Body weight"
          value={t.bodyWeight}
          min={300}
          max={600}
          step={100}
          onChange={(v) => set({ bodyWeight: v })}
        />
        <SliderField
          label="Line height"
          value={t.lineHeight}
          min={1}
          max={2}
          step={0.05}
          onChange={(v) => set({ lineHeight: v })}
        />
        <SliderField
          label="Letter spacing"
          value={t.letterSpacing}
          min={-0.05}
          max={0.05}
          step={0.005}
          suffix="em"
          onChange={(v) => set({ letterSpacing: v })}
        />
      </FieldCard>
      <FieldCard title="Responsive scale">
        <SliderField
          label="Mobile scale"
          value={t.mobileScale}
          min={0.7}
          max={1}
          step={0.01}
          onChange={(v) => set({ mobileScale: v })}
        />
        <SliderField
          label="Tablet scale"
          value={t.tabletScale}
          min={0.8}
          max={1}
          step={0.01}
          onChange={(v) => set({ tabletScale: v })}
        />
        <SliderField
          label="Desktop scale"
          value={t.desktopScale}
          min={0.9}
          max={1.2}
          step={0.01}
          onChange={(v) => set({ desktopScale: v })}
        />
      </FieldCard>
    </>
  );
}

function ButtonsPanel({
  draft,
  setDraft,
}: {
  draft: DesignSettings;
  setDraft: (u: (d: DesignSettings) => DesignSettings) => void;
}) {
  const b = draft.buttons;
  const set = (patch: Partial<DesignSettings["buttons"]>) =>
    setDraft((d) => ({ ...d, buttons: { ...d.buttons, ...patch } }));
  return (
    <>
      <FieldCard title="Button colours">
        <ColorField
          label="Primary background"
          value={b.primaryBg}
          onChange={(v) => set({ primaryBg: v })}
          contrastAgainst={b.primaryText}
        />
        <ColorField
          label="Primary text"
          value={b.primaryText}
          onChange={(v) => set({ primaryText: v })}
          contrastAgainst={b.primaryBg}
        />
        <ColorField
          label="Secondary background"
          value={b.secondaryBg}
          onChange={(v) => set({ secondaryBg: v })}
          contrastAgainst={b.secondaryText}
        />
        <ColorField
          label="Secondary text"
          value={b.secondaryText}
          onChange={(v) => set({ secondaryText: v })}
          contrastAgainst={b.secondaryBg}
        />
        <ColorField
          label="Border colour"
          value={b.borderColor}
          onChange={(v) => set({ borderColor: v })}
        />
      </FieldCard>
      <FieldCard title="Shape & spacing">
        <SliderField
          label="Border width"
          value={b.borderWidth}
          min={0}
          max={4}
          suffix="px"
          onChange={(v) => set({ borderWidth: v })}
        />
        <SliderField
          label="Border radius"
          value={b.borderRadius}
          min={0}
          max={28}
          suffix="px"
          onChange={(v) => set({ borderRadius: v })}
        />
        <SliderField
          label="Padding X"
          value={b.paddingX}
          min={12}
          max={40}
          suffix="px"
          onChange={(v) => set({ paddingX: v })}
        />
        <SliderField
          label="Padding Y"
          value={b.paddingY}
          min={8}
          max={22}
          suffix="px"
          onChange={(v) => set({ paddingY: v })}
        />
        <SliderField
          label="Font weight"
          value={b.fontWeight}
          min={500}
          max={800}
          step={100}
          onChange={(v) => set({ fontWeight: v })}
        />
        <SliderField
          label="Shadow"
          value={b.shadow}
          min={0}
          max={100}
          onChange={(v) => set({ shadow: v })}
        />
        <SliderField
          label="Hover elevation"
          value={b.hoverElevation}
          min={0}
          max={8}
          suffix="px"
          onChange={(v) => set({ hoverElevation: v })}
        />
        <SliderField
          label="Press scale"
          value={b.pressScale}
          min={0.85}
          max={1}
          step={0.01}
          onChange={(v) => set({ pressScale: v })}
        />
        <SliderField
          label="Disabled opacity"
          value={b.disabledOpacity}
          min={0.2}
          max={0.8}
          step={0.05}
          onChange={(v) => set({ disabledOpacity: v })}
        />
      </FieldCard>
      <FieldCard title="Interactions">
        <ToggleField
          label="Enable shine"
          checked={b.enableShine}
          onChange={(v) => set({ enableShine: v })}
        />
        <ToggleField
          label="Enable hover lift"
          checked={b.enableHoverLift}
          onChange={(v) => set({ enableHoverLift: v })}
        />
        <ToggleField
          label="Enable glow"
          checked={b.enableGlow}
          onChange={(v) => set({ enableGlow: v })}
        />
        <ToggleField
          label="Enable arrow motion"
          checked={b.enableArrow}
          onChange={(v) => set({ enableArrow: v })}
        />
        <ToggleField
          label="Enable press animation"
          checked={b.enablePress}
          onChange={(v) => set({ enablePress: v })}
        />
      </FieldCard>
    </>
  );
}

function EffectsPanel({
  draft,
  setDraft,
}: {
  draft: DesignSettings;
  setDraft: (u: (d: DesignSettings) => DesignSettings) => void;
}) {
  return (
    <FieldCard title="Visual effects" description="Respect reduced-motion; safe intensity limits.">
      {EFFECT_FIELDS.map((f) => {
        const e = draft.effects[f.key];
        const set = (patch: Partial<typeof e>) =>
          setDraft((d) => ({
            ...d,
            effects: { ...d.effects, [f.key]: { ...d.effects[f.key], ...patch } },
          }));
        return (
          <div key={f.key} className="rounded-xl border border-border bg-secondary/30 p-3">
            <ToggleField
              label={f.label}
              checked={e.enabled}
              onChange={(v) => set({ enabled: v })}
            />
            {e.enabled ? (
              <div className="mt-3 space-y-3">
                <SliderField
                  label="Intensity"
                  value={e.intensity}
                  min={0}
                  max={100}
                  onChange={(v) => set({ intensity: v })}
                />
                <SliderField
                  label="Speed"
                  value={e.speed}
                  min={0}
                  max={100}
                  onChange={(v) => set({ speed: v })}
                />
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={e.desktop}
                      onChange={(ev) => set({ desktop: ev.target.checked })}
                    />{" "}
                    Desktop
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={e.tablet}
                      onChange={(ev) => set({ tablet: ev.target.checked })}
                    />{" "}
                    Tablet
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={e.mobile}
                      onChange={(ev) => set({ mobile: ev.target.checked })}
                    />{" "}
                    Mobile
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </FieldCard>
  );
}

function AnimationsPanel({
  draft,
  setDraft,
  applyPreset,
}: {
  draft: DesignSettings;
  setDraft: (u: (d: DesignSettings) => DesignSettings) => void;
  applyPreset: (p: AnimationPreset) => void;
}) {
  const a = draft.animations;
  const set = (patch: Partial<DesignSettings["animations"]>) =>
    setDraft((d) => ({ ...d, animations: { ...d.animations, ...patch, preset: "custom" } }));
  const presets: AnimationPreset[] = ["minimal", "smooth", "premium", "cinematic", "custom"];
  return (
    <>
      <FieldCard title="Animation preset">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                a.preset === p
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-secondary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </FieldCard>
      <FieldCard title="Timing (ms)" description="No flashing, spinning or layout-shifting motion.">
        <SliderField
          label="Section reveal duration"
          value={a.revealDuration}
          min={150}
          max={1200}
          step={10}
          suffix="ms"
          onChange={(v) => set({ revealDuration: v })}
        />
        <SliderField
          label="Section reveal distance"
          value={a.revealDistance}
          min={0}
          max={48}
          suffix="px"
          onChange={(v) => set({ revealDistance: v })}
        />
        <SliderField
          label="Stagger delay"
          value={a.staggerDelay}
          min={0}
          max={200}
          suffix="ms"
          onChange={(v) => set({ staggerDelay: v })}
        />
        <SliderField
          label="Button hover"
          value={a.buttonHoverDuration}
          min={80}
          max={400}
          suffix="ms"
          onChange={(v) => set({ buttonHoverDuration: v })}
        />
        <SliderField
          label="Card hover"
          value={a.cardHoverDuration}
          min={80}
          max={500}
          suffix="ms"
          onChange={(v) => set({ cardHoverDuration: v })}
        />
        <SliderField
          label="Page transition"
          value={a.pageTransitionDuration}
          min={120}
          max={600}
          suffix="ms"
          onChange={(v) => set({ pageTransitionDuration: v })}
        />
        <SliderField
          label="Counter duration"
          value={a.counterDuration}
          min={600}
          max={3000}
          step={50}
          suffix="ms"
          onChange={(v) => set({ counterDuration: v })}
        />
        <SliderField
          label="Hero overlay"
          value={a.heroOverlayDuration}
          min={200}
          max={1000}
          suffix="ms"
          onChange={(v) => set({ heroOverlayDuration: v })}
        />
        <SliderField
          label="Floating speed"
          value={a.floatingSpeed}
          min={3000}
          max={12000}
          step={250}
          suffix="ms"
          onChange={(v) => set({ floatingSpeed: v })}
        />
        <SliderField
          label="Background movement"
          value={a.backgroundSpeed}
          min={6000}
          max={24000}
          step={500}
          suffix="ms"
          onChange={(v) => set({ backgroundSpeed: v })}
        />
      </FieldCard>
    </>
  );
}

const bgTypeOptions: Array<{ value: BackgroundType; label: string }> = [
  { value: "solid", label: "Solid colour" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Image URL" },
  { value: "video", label: "Video URL" },
];

function BackgroundsPanel({
  draft,
  setDraft,
}: {
  draft: DesignSettings;
  setDraft: (u: (d: DesignSettings) => DesignSettings) => void;
}) {
  return (
    <>
      {BACKGROUND_FIELDS.map((f) => {
        const cfg = draft.backgrounds[f.key];
        const set = (patch: Partial<typeof cfg>) =>
          setDraft((d) => ({
            ...d,
            backgrounds: { ...d.backgrounds, [f.key]: { ...d.backgrounds[f.key], ...patch } },
          }));
        return (
          <FieldCard key={f.key} title={f.label}>
            <SelectField
              label="Type"
              value={cfg.type}
              options={bgTypeOptions}
              onChange={(v) => set({ type: v as BackgroundType })}
            />
            {cfg.type === "solid" ? (
              <ColorField label="Colour" value={cfg.color} onChange={(v) => set({ color: v })} />
            ) : null}
            {cfg.type === "gradient" ? (
              <>
                <ColorField
                  label="Gradient start"
                  value={cfg.gradientStart}
                  onChange={(v) => set({ gradientStart: v })}
                />
                <ColorField
                  label="Gradient end"
                  value={cfg.gradientEnd}
                  onChange={(v) => set({ gradientEnd: v })}
                />
              </>
            ) : null}
            {cfg.type === "image" || cfg.type === "video" ? (
              <>
                {cfg.type === "image" ? (
                  <TextField
                    label="Image URL"
                    value={cfg.imageUrl}
                    onChange={(v) => set({ imageUrl: v })}
                    placeholder="https://…"
                  />
                ) : (
                  <TextField
                    label="Video URL"
                    value={cfg.videoUrl}
                    onChange={(v) => set({ videoUrl: v })}
                    placeholder="https://….mp4"
                  />
                )}
                <TextField
                  label="Poster URL"
                  value={cfg.posterUrl}
                  onChange={(v) => set({ posterUrl: v })}
                  placeholder="https://…"
                />
                <ColorField
                  label="Overlay colour"
                  value={cfg.overlayColor}
                  onChange={(v) => set({ overlayColor: v })}
                />
                <SliderField
                  label="Overlay opacity"
                  value={cfg.overlayOpacity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => set({ overlayOpacity: v })}
                />
                <SliderField
                  label="Blur"
                  value={cfg.blur}
                  min={0}
                  max={20}
                  suffix="px"
                  onChange={(v) => set({ blur: v })}
                />
                <ToggleField
                  label="Enable media"
                  checked={cfg.enableMedia}
                  onChange={(v) => set({ enableMedia: v })}
                />
              </>
            ) : null}
          </FieldCard>
        );
      })}
    </>
  );
}

function PresetsPanel({ applyPreset }: { applyPreset: (id: string) => void }) {
  return (
    <FieldCard
      title="Colour presets"
      description="Applies to draft only — preview before publishing."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {COLOR_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className="group rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-1.5">
              {["primaryNavy", "deepBlue", "techBlue", "cyanAccent"].map((k) => (
                <span
                  key={k}
                  className="h-6 w-6 rounded-md ring-1 ring-inset ring-black/10"
                  style={{ background: (p.colors as Record<string, string>)[k] ?? "#ccc" }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold text-foreground">{p.name}</p>
          </button>
        ))}
      </div>
    </FieldCard>
  );
}
