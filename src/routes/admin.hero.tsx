import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/primitives";
import {
  ActionBar,
  EditorWorkspace,
  FieldCard,
  PublishedBadge,
  SelectField,
  SettingsGate,
  SliderField,
  TextAreaField,
  TextField,
  ToggleField,
} from "@/components/admin/editor";
import { DevicePreview } from "@/components/admin/DevicePreview";
import { useAdminAuth } from "@/lib/admin/auth";
import { useSettingsEditor } from "@/lib/cms/useEditor";
import { DEFAULT_HERO, type HeroSettings } from "@/lib/cms/model";

export const Route = createFileRoute("/admin/hero")({
  component: HeroCms,
});

const positionOptions = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

function HeroCms() {
  const editor = useSettingsEditor<HeroSettings>("hero", DEFAULT_HERO);
  const { draft, setDraft } = editor;
  const { hasAnyRole } = useAdminAuth();
  const isSuperAdmin = hasAnyRole(["super_admin"]);
  const set = (patch: Partial<HeroSettings>) => setDraft((d) => ({ ...d, ...patch }));
  const setAnpr = (patch: Partial<HeroSettings["anpr"]>) =>
    setDraft((d) => ({ ...d, anpr: { ...d.anpr, ...patch } }));
  const setOcc = (patch: Partial<HeroSettings["occupancy"]>) =>
    setDraft((d) => ({ ...d, occupancy: { ...d.occupancy, ...patch } }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hero Media CMS"
        description="Manage the homepage hero content, background media and demonstration overlay cards. Overlay values are demo data, not live parking availability."
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
            <DevicePreview height={620}>
              <HeroPreview hero={draft} />
            </DevicePreview>
          }
          panel={
            <>
              <FieldCard title="Hero content">
                <TextField
                  label="Eyebrow text"
                  value={draft.eyebrow}
                  onChange={(v) => set({ eyebrow: v })}
                />
                <TextAreaField
                  label="Main headline"
                  value={draft.headline}
                  onChange={(v) => set({ headline: v })}
                  rows={2}
                />
                <TextAreaField
                  label="Supporting text"
                  value={draft.supporting}
                  onChange={(v) => set({ supporting: v })}
                  rows={4}
                />
                <TextField
                  label="Primary CTA label"
                  value={draft.primaryCtaLabel}
                  onChange={(v) => set({ primaryCtaLabel: v })}
                />
                <TextField
                  label="Primary CTA link"
                  value={draft.primaryCtaLink}
                  onChange={(v) => set({ primaryCtaLink: v })}
                />
                <TextField
                  label="Secondary CTA label"
                  value={draft.secondaryCtaLabel}
                  onChange={(v) => set({ secondaryCtaLabel: v })}
                />
                <TextField
                  label="Secondary CTA link"
                  value={draft.secondaryCtaLink}
                  onChange={(v) => set({ secondaryCtaLink: v })}
                />
                <TextAreaField
                  label="Trust statement"
                  value={draft.trustStatement}
                  onChange={(v) => set({ trustStatement: v })}
                  rows={2}
                />
              </FieldCard>

              <FieldCard title="Hero media">
                <SelectField
                  label="Media type"
                  value={draft.mediaType}
                  options={[
                    { value: "image", label: "Image" },
                    { value: "video", label: "Video" },
                  ]}
                  onChange={(v) => set({ mediaType: v as HeroSettings["mediaType"] })}
                />
                <TextField
                  label="Background image URL"
                  value={draft.backgroundImage}
                  onChange={(v) => set({ backgroundImage: v })}
                  placeholder="https://…"
                />
                <TextField
                  label="Background video URL"
                  value={draft.backgroundVideo}
                  onChange={(v) => set({ backgroundVideo: v })}
                  placeholder="https://….mp4"
                />
                <TextField
                  label="Poster image URL"
                  value={draft.posterImage}
                  onChange={(v) => set({ posterImage: v })}
                  placeholder="https://…"
                />
                <TextField
                  label="Mobile image URL"
                  value={draft.mobileImage}
                  onChange={(v) => set({ mobileImage: v })}
                  placeholder="https://…"
                />
                <TextField
                  label="Mobile video URL"
                  value={draft.mobileVideo}
                  onChange={(v) => set({ mobileVideo: v })}
                  placeholder="https://….mp4"
                />
                <ToggleField
                  label="Video autoplay"
                  checked={draft.autoplay}
                  onChange={(v) => set({ autoplay: v })}
                />
                <ToggleField
                  label="Video loop"
                  checked={draft.loop}
                  onChange={(v) => set({ loop: v })}
                />
                <ToggleField
                  label="Video muted"
                  checked={draft.muted}
                  onChange={(v) => set({ muted: v })}
                />
                <ToggleField
                  label="Dark overlay"
                  checked={draft.darkOverlay}
                  onChange={(v) => set({ darkOverlay: v })}
                />
                <SliderField
                  label="Overlay opacity"
                  value={draft.overlayOpacity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => set({ overlayOpacity: v })}
                />
                <TextField
                  label="Object position"
                  value={draft.objectPosition}
                  onChange={(v) => set({ objectPosition: v })}
                  placeholder="center"
                />
                <SliderField
                  label="Background blur"
                  value={draft.backgroundBlur}
                  min={0}
                  max={20}
                  suffix="px"
                  onChange={(v) => set({ backgroundBlur: v })}
                />
                <SliderField
                  label="Visual height"
                  value={draft.visualHeight}
                  min={360}
                  max={720}
                  suffix="px"
                  onChange={(v) => set({ visualHeight: v })}
                />
                <SliderField
                  label="Border radius"
                  value={draft.borderRadius}
                  min={0}
                  max={40}
                  suffix="px"
                  onChange={(v) => set({ borderRadius: v })}
                />
              </FieldCard>

              <FieldCard title="ANPR overlay card (demo data)">
                <ToggleField
                  label="Enable card"
                  checked={draft.anpr.enabled}
                  onChange={(v) => setAnpr({ enabled: v })}
                />
                <TextField
                  label="Plate number"
                  value={draft.anpr.plate}
                  onChange={(v) => setAnpr({ plate: v })}
                />
                <TextField
                  label="Vehicle category"
                  value={draft.anpr.category}
                  onChange={(v) => setAnpr({ category: v })}
                />
                <TextField
                  label="Booking status"
                  value={draft.anpr.bookingStatus}
                  onChange={(v) => setAnpr({ bookingStatus: v })}
                />
                <TextField
                  label="Access status"
                  value={draft.anpr.accessStatus}
                  onChange={(v) => setAnpr({ accessStatus: v })}
                />
                <TextField
                  label="Barrier status"
                  value={draft.anpr.barrierStatus}
                  onChange={(v) => setAnpr({ barrierStatus: v })}
                />
                <SelectField
                  label="Position"
                  value={draft.anpr.position}
                  options={positionOptions}
                  onChange={(v) => setAnpr({ position: v as HeroSettings["anpr"]["position"] })}
                />
                <SliderField
                  label="Transparency"
                  value={draft.anpr.transparency}
                  min={0.3}
                  max={1}
                  step={0.05}
                  onChange={(v) => setAnpr({ transparency: v })}
                />
                <ToggleField
                  label="Animation enabled"
                  checked={draft.anpr.animation}
                  onChange={(v) => setAnpr({ animation: v })}
                />
              </FieldCard>

              <FieldCard title="Occupancy overlay card (demo data)">
                <ToggleField
                  label="Enable card"
                  checked={draft.occupancy.enabled}
                  onChange={(v) => setOcc({ enabled: v })}
                />
                <TextField
                  label="Location name"
                  value={draft.occupancy.location}
                  onChange={(v) => setOcc({ location: v })}
                />
                <SliderField
                  label="Available spaces"
                  value={draft.occupancy.available}
                  min={0}
                  max={1000}
                  onChange={(v) => setOcc({ available: v })}
                />
                <SliderField
                  label="Capacity"
                  value={draft.occupancy.capacity}
                  min={0}
                  max={2000}
                  onChange={(v) => setOcc({ capacity: v })}
                />
                <SliderField
                  label="Occupied"
                  value={draft.occupancy.occupied}
                  min={0}
                  max={2000}
                  onChange={(v) => setOcc({ occupied: v })}
                />
                <SliderField
                  label="Reserved"
                  value={draft.occupancy.reserved}
                  min={0}
                  max={1000}
                  onChange={(v) => setOcc({ reserved: v })}
                />
                <SliderField
                  label="Progress"
                  value={draft.occupancy.progress}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(v) => setOcc({ progress: v })}
                />
                <TextField
                  label="Disclaimer"
                  value={draft.occupancy.disclaimer}
                  onChange={(v) => setOcc({ disclaimer: v })}
                />
                <SelectField
                  label="Position"
                  value={draft.occupancy.position}
                  options={positionOptions}
                  onChange={(v) => setOcc({ position: v as HeroSettings["occupancy"]["position"] })}
                />
                <SliderField
                  label="Transparency"
                  value={draft.occupancy.transparency}
                  min={0.3}
                  max={1}
                  step={0.05}
                  onChange={(v) => setOcc({ transparency: v })}
                />
                <ToggleField
                  label="Animation enabled"
                  checked={draft.occupancy.animation}
                  onChange={(v) => setOcc({ animation: v })}
                />
              </FieldCard>
            </>
          }
        />
      </SettingsGate>
    </div>
  );
}

function HeroPreview({ hero }: { hero: HeroSettings }) {
  const hasImg = hero.mediaType === "image" && hero.backgroundImage;
  const hasVid = hero.mediaType === "video" && hero.backgroundVideo;
  return (
    <div className="min-h-full bg-background">
      <div
        className="relative m-4 overflow-hidden text-white"
        style={{ height: hero.visualHeight * 0.7, borderRadius: hero.borderRadius }}
      >
        {hasVid ? (
          <video
            src={hero.backgroundVideo}
            poster={hero.posterImage || undefined}
            autoPlay={hero.autoplay}
            loop={hero.loop}
            muted={hero.muted}
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: hero.objectPosition,
              filter: `blur(${hero.backgroundBlur}px)`,
            }}
          />
        ) : hasImg ? (
          <img
            src={hero.backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: hero.objectPosition,
              filter: `blur(${hero.backgroundBlur}px)`,
            }}
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        )}
        {hero.darkOverlay ? (
          <div className="absolute inset-0 bg-navy" style={{ opacity: hero.overlayOpacity }} />
        ) : null}

        <div className="relative flex h-full flex-col justify-center px-8">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cyan">
            {hero.eyebrow}
          </span>
          <h1 className="mt-3 max-w-lg text-4xl font-extrabold leading-tight">{hero.headline}</h1>
          <p className="mt-3 max-w-md text-sm text-white/80">{hero.supporting}</p>
          <div className="mt-5 flex gap-3 text-sm font-semibold">
            <span className="rounded-lg bg-primary px-5 py-2.5 text-primary-foreground">
              {hero.primaryCtaLabel}
            </span>
            <span className="rounded-lg border border-white/25 px-5 py-2.5">
              {hero.secondaryCtaLabel}
            </span>
          </div>
        </div>

        {hero.anpr.enabled ? (
          <div
            className={`absolute w-40 rounded-2xl border border-white/10 bg-navy/70 p-3 text-[11px] backdrop-blur ${posCls(hero.anpr.position)}`}
            style={{ opacity: hero.anpr.transparency }}
          >
            <p className="font-semibold text-cyan">ANPR Detected</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-widest">{hero.anpr.plate}</p>
            <p className="mt-1 text-white/70">{hero.anpr.category}</p>
            <p className="text-white/70">{hero.anpr.accessStatus}</p>
          </div>
        ) : null}
        {hero.occupancy.enabled ? (
          <div
            className={`absolute w-44 rounded-2xl border border-white/10 bg-navy/70 p-3 text-[11px] backdrop-blur ${posCls(hero.occupancy.position)}`}
            style={{ opacity: hero.occupancy.transparency }}
          >
            <p className="font-semibold text-cyan">{hero.occupancy.location}</p>
            <p className="mt-1 text-2xl font-bold">{hero.occupancy.available}</p>
            <p className="text-white/70">of {hero.occupancy.capacity} available</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full bg-cyan" style={{ width: `${hero.occupancy.progress}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function posCls(pos: string) {
  switch (pos) {
    case "top-left":
      return "left-4 top-4";
    case "top-right":
      return "right-4 top-4";
    case "bottom-left":
      return "bottom-4 left-4";
    default:
      return "bottom-4 right-4";
  }
}
