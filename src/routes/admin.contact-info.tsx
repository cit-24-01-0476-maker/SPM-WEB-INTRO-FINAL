import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { PageHeader } from "@/components/admin/primitives";
import {
  ActionBar,
  ColorField,
  EditorWorkspace,
  FieldCard,
  PublishedBadge,
  SelectField,
  SettingsGate,
  TextAreaField,
  TextField,
  ToggleField,
} from "@/components/admin/editor";
import { DevicePreview } from "@/components/admin/DevicePreview";
import { useAdminAuth } from "@/lib/admin/auth";
import { useSettingsEditor } from "@/lib/cms/useEditor";
import { Link } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/cms/PublicSettings";
import { DEFAULT_CONTACT, type ContactPerson, type ContactSettings } from "@/lib/cms/model";

export const Route = createFileRoute("/admin/contact-info")({
  component: ContactSettingsPage,
});

function ContactSettingsPage() {
  const editor = useSettingsEditor<ContactSettings>("contact", DEFAULT_CONTACT);
  const { draft, setDraft } = editor;
  const { hasAnyRole } = useAdminAuth();
  const isSuperAdmin = hasAnyRole(["super_admin"]);
  const set = (patch: Partial<ContactSettings>) => setDraft((d) => ({ ...d, ...patch }));
  const setWa = (patch: Partial<ContactSettings["whatsapp"]>) =>
    setDraft((d) => ({ ...d, whatsapp: { ...d.whatsapp, ...patch } }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contact & WhatsApp Settings"
        description="One centralized source for all public contact details, social links and the floating WhatsApp button. Empty values are hidden gracefully on the website."
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
              <ContactPreview c={draft} />
            </DevicePreview>
          }
          panel={
            <>
              <SiteSettingsCard />
              <FieldCard title="Contact details">
                <TextField
                  label="Primary email"
                  value={draft.primaryEmail}
                  onChange={(v) => set({ primaryEmail: v })}
                  type="email"
                />
                <TextField
                  label="Secondary email"
                  value={draft.secondaryEmail}
                  onChange={(v) => set({ secondaryEmail: v })}
                  type="email"
                />
                <TextField
                  label="Primary phone"
                  value={draft.primaryPhone}
                  onChange={(v) => set({ primaryPhone: v })}
                />
                <TextField
                  label="Secondary phone"
                  value={draft.secondaryPhone}
                  onChange={(v) => set({ secondaryPhone: v })}
                />
                <TextAreaField
                  label="Physical address"
                  value={draft.address}
                  onChange={(v) => set({ address: v })}
                  rows={2}
                />
                <TextField
                  label="Google Maps URL"
                  value={draft.mapsUrl}
                  onChange={(v) => set({ mapsUrl: v })}
                  placeholder="https://maps.google.com/…"
                />
                <TextField
                  label="Business hours"
                  value={draft.businessHours}
                  onChange={(v) => set({ businessHours: v })}
                />
              </FieldCard>

              <FieldCard title="Contact section & form">
                <TextField
                  label="Section eyebrow"
                  value={draft.sectionEyebrow}
                  onChange={(v) => set({ sectionEyebrow: v })}
                />
                <TextField
                  label="Section heading"
                  value={draft.sectionHeading}
                  onChange={(v) => set({ sectionHeading: v })}
                />
                <TextAreaField
                  label="Section description"
                  value={draft.sectionDescription}
                  onChange={(v) => set({ sectionDescription: v })}
                  rows={3}
                />
                <TextAreaField
                  label="Privacy consent text"
                  value={draft.privacyText}
                  onChange={(v) => set({ privacyText: v })}
                  rows={2}
                />
                <TextField
                  label="Form recipient email"
                  value={draft.formRecipientEmail}
                  onChange={(v) => set({ formRecipientEmail: v })}
                  type="email"
                />
                <TextField
                  label="Main CTA label"
                  value={draft.ctaLabel}
                  onChange={(v) => set({ ctaLabel: v })}
                />
                <TextField
                  label="Main CTA link"
                  value={draft.ctaLink}
                  onChange={(v) => set({ ctaLink: v })}
                />
              </FieldCard>

              <ContactPeopleCard draft={draft} setDraft={setDraft} />

              <NotificationsCard draft={draft} set={set} />

              <FieldCard title="Social links" description="Leave blank to hide.">
                <TextField
                  label="Facebook URL"
                  value={draft.facebookUrl}
                  onChange={(v) => set({ facebookUrl: v })}
                />
                <TextField
                  label="Instagram URL"
                  value={draft.instagramUrl}
                  onChange={(v) => set({ instagramUrl: v })}
                />
                <TextField
                  label="LinkedIn URL"
                  value={draft.linkedinUrl}
                  onChange={(v) => set({ linkedinUrl: v })}
                />
                <TextField
                  label="YouTube URL"
                  value={draft.youtubeUrl}
                  onChange={(v) => set({ youtubeUrl: v })}
                />
                <TextField
                  label="TikTok URL"
                  value={draft.tiktokUrl}
                  onChange={(v) => set({ tiktokUrl: v })}
                />
              </FieldCard>

              <FieldCard title="Floating WhatsApp button">
                <ToggleField
                  label="Enabled"
                  checked={draft.whatsapp.enabled}
                  onChange={(v) => setWa({ enabled: v })}
                />
                <TextField
                  label="WhatsApp number"
                  value={draft.whatsapp.number}
                  onChange={(v) => setWa({ number: v })}
                  hint="digits only"
                />
                <TextAreaField
                  label="Default message"
                  value={draft.whatsapp.message}
                  onChange={(v) => setWa({ message: v })}
                  rows={2}
                />
                <TextField
                  label="Button label"
                  value={draft.whatsapp.label}
                  onChange={(v) => setWa({ label: v })}
                />
                <TextField
                  label="Tooltip"
                  value={draft.whatsapp.tooltip}
                  onChange={(v) => setWa({ tooltip: v })}
                />
                <SelectField
                  label="Desktop position"
                  value={draft.whatsapp.desktopPosition}
                  options={[
                    { value: "right", label: "Right" },
                    { value: "left", label: "Left" },
                  ]}
                  onChange={(v) => setWa({ desktopPosition: v as "right" | "left" })}
                />
                <SelectField
                  label="Mobile position"
                  value={draft.whatsapp.mobilePosition}
                  options={[
                    { value: "right", label: "Right" },
                    { value: "left", label: "Left" },
                  ]}
                  onChange={(v) => setWa({ mobilePosition: v as "right" | "left" })}
                />
                <ColorField
                  label="Button background"
                  value={draft.whatsapp.background}
                  onChange={(v) => setWa({ background: v })}
                />
                <ColorField
                  label="Icon colour"
                  value={draft.whatsapp.iconColor}
                  onChange={(v) => setWa({ iconColor: v })}
                />
                <ToggleField
                  label="Pulse animation"
                  checked={draft.whatsapp.pulse}
                  onChange={(v) => setWa({ pulse: v })}
                />
                <TextField
                  label="Online label"
                  value={draft.whatsapp.onlineLabel}
                  onChange={(v) => setWa({ onlineLabel: v })}
                />
                <TextField
                  label="Offline label"
                  value={draft.whatsapp.offlineLabel}
                  onChange={(v) => setWa({ offlineLabel: v })}
                />
              </FieldCard>
            </>
          }
        />
      </SettingsGate>
    </div>
  );
}

/* --- Site settings (flat doc) --------------------------------------- */

function SiteSettingsCard() {
  return (
    <FieldCard title="Website identity">
      <Link to="/admin/settings" className="text-sm font-semibold text-primary">
        Open Website Settings
      </Link>
    </FieldCard>
  );
}

/* --- Contact People manager ----------------------------------------- */

function newContact(order: number): ContactPerson {
  return {
    id: `contact-${Date.now().toString(36)}`,
    name: "New Contact",
    role: "Agent",
    description: "",
    phoneDisplay: "",
    phoneRaw: "",
    whatsappNumber: "",
    whatsappMessage: "Hello, I would like to learn more about the SPM ECO System.",
    email: "",
    profileImage: "",
    callEnabled: true,
    whatsappEnabled: true,
    emailEnabled: false,
    visible: true,
    desktopVisible: true,
    tabletVisible: true,
    mobileVisible: true,
    availabilityStatus: "available",
    availabilityText: "Available now",
    order,
    accentColor: "#176bff",
  };
}

function ContactPeopleCard({
  draft,
  setDraft,
}: {
  draft: ContactSettings;
  setDraft: (updater: (prev: ContactSettings) => ContactSettings) => void;
}) {
  const contacts = draft.contacts ?? [];
  const update = (i: number, patch: Partial<ContactPerson>) =>
    setDraft((d) => ({
      ...d,
      contacts: d.contacts.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
  const add = () =>
    setDraft((d) => ({ ...d, contacts: [...d.contacts, newContact(d.contacts.length + 1)] }));
  const duplicate = (i: number) =>
    setDraft((d) => {
      const copy = {
        ...d.contacts[i],
        id: `contact-${Date.now().toString(36)}`,
        name: `${d.contacts[i].name} (copy)`,
      };
      const next = [...d.contacts];
      next.splice(i + 1, 0, copy);
      return { ...d, contacts: next.map((c, idx) => ({ ...c, order: idx + 1 })) };
    });
  const remove = (i: number) =>
    setDraft((d) => ({ ...d, contacts: d.contacts.filter((_, idx) => idx !== i) }));
  const move = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.contacts.length) return d;
      const next = [...d.contacts];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, contacts: next.map((c, idx) => ({ ...c, order: idx + 1 })) };
    });

  return (
    <FieldCard
      title="Contact people"
      description="These drive the public contact cards, the floating WhatsApp selector and inquiry assignment. Numbers are sanitized for wa.me and tel links."
    >
      <div className="space-y-4">
        {contacts.map((c, i) => (
          <div key={c.id} className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {c.name} — {c.role}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(i, -1)}
                  className="rounded p-1.5 hover:bg-secondary"
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  className="rounded p-1.5 hover:bg-secondary"
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => duplicate(i)}
                  className="rounded p-1.5 hover:bg-secondary"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(i)}
                  className="rounded p-1.5 text-red-500 hover:bg-secondary"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              <TextField label="Name" value={c.name} onChange={(v) => update(i, { name: v })} />
              <TextField label="Role" value={c.role} onChange={(v) => update(i, { role: v })} />
              <TextField
                label="Description"
                value={c.description}
                onChange={(v) => update(i, { description: v })}
              />
              <TextField
                label="Phone (display)"
                value={c.phoneDisplay}
                onChange={(v) => update(i, { phoneDisplay: v })}
              />
              <TextField
                label="Phone (raw digits, e.g. 94754565755)"
                value={c.phoneRaw}
                onChange={(v) => update(i, { phoneRaw: v })}
              />
              <TextField
                label="WhatsApp number (digits only)"
                value={c.whatsappNumber}
                onChange={(v) => update(i, { whatsappNumber: v })}
              />
              <TextAreaField
                label="WhatsApp message"
                value={c.whatsappMessage}
                onChange={(v) => update(i, { whatsappMessage: v })}
                rows={2}
              />
              <TextField
                label="Email (optional)"
                value={c.email}
                onChange={(v) => update(i, { email: v })}
                type="email"
              />
              <TextField
                label="Profile image URL"
                value={c.profileImage}
                onChange={(v) => update(i, { profileImage: v })}
              />
              <TextField
                label="Availability text"
                value={c.availabilityText}
                onChange={(v) => update(i, { availabilityText: v })}
              />
              <SelectField
                label="Availability status"
                value={c.availabilityStatus}
                options={[
                  { value: "available", label: "Available" },
                  { value: "busy", label: "Busy" },
                  { value: "offline", label: "Offline" },
                ]}
                onChange={(v) =>
                  update(i, { availabilityStatus: v as ContactPerson["availabilityStatus"] })
                }
              />
              <ColorField
                label="Accent colour"
                value={c.accentColor}
                onChange={(v) => update(i, { accentColor: v })}
              />
              <ToggleField
                label="Call button"
                checked={c.callEnabled}
                onChange={(v) => update(i, { callEnabled: v })}
              />
              <ToggleField
                label="WhatsApp button"
                checked={c.whatsappEnabled}
                onChange={(v) => update(i, { whatsappEnabled: v })}
              />
              <ToggleField
                label="Email button"
                checked={c.emailEnabled}
                onChange={(v) => update(i, { emailEnabled: v })}
              />
              <ToggleField
                label="Visible"
                checked={c.visible}
                onChange={(v) => update(i, { visible: v })}
              />
            </div>
          </div>
        ))}
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/70"
        >
          <Plus className="h-3.5 w-3.5" /> Add contact
        </button>
      </div>
    </FieldCard>
  );
}

/* --- Notifications --------------------------------------------------- */

function NotificationsCard({
  draft,
  set,
}: {
  draft: ContactSettings;
  set: (patch: Partial<ContactSettings>) => void;
}) {
  const n = draft.notifications;
  const setN = (patch: Partial<ContactSettings["notifications"]>) =>
    set({ notifications: { ...n, ...patch } });
  return (
    <FieldCard
      title="Email notifications"
      description="Recipients for new inquiry emails. Provider API keys (Resend/SMTP) live only in server environment variables — never here."
    >
      <ToggleField
        label="Notifications enabled"
        checked={n.enabled}
        onChange={(v) => setN({ enabled: v })}
      />
      <TextField
        label="Recipient emails (comma separated)"
        value={n.recipientEmails}
        onChange={(v) => setN({ recipientEmails: v })}
      />
      <TextField
        label="CC emails (comma separated)"
        value={n.ccEmails}
        onChange={(v) => setN({ ccEmails: v })}
      />
      <TextField
        label="Subject template ({organization} placeholder)"
        value={n.subjectTemplate}
        onChange={(v) => setN({ subjectTemplate: v })}
      />
      <ToggleField
        label="Auto-reply to sender"
        checked={n.autoReplyEnabled}
        onChange={(v) => setN({ autoReplyEnabled: v })}
      />
      <TextField
        label="Auto-reply subject"
        value={n.autoReplySubject}
        onChange={(v) => setN({ autoReplySubject: v })}
      />
      <TextAreaField
        label="Auto-reply message"
        value={n.autoReplyMessage}
        onChange={(v) => setN({ autoReplyMessage: v })}
        rows={3}
      />
    </FieldCard>
  );
}

function ContactPreview({ c }: { c: ContactSettings }) {
  return (
    <div className="min-h-full bg-background p-6">
      <div className="mx-auto max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{c.sectionHeading}</h2>
        <p className="text-sm text-muted-foreground">{c.sectionDescription}</p>
        <div className="space-y-2 rounded-2xl border border-border bg-card p-5 text-sm">
          {c.primaryEmail ? <p className="text-foreground">✉️ {c.primaryEmail}</p> : null}
          {c.primaryPhone ? <p className="text-foreground">📞 {c.primaryPhone}</p> : null}
          {c.address ? <p className="text-muted-foreground">📍 {c.address}</p> : null}
          {c.businessHours ? <p className="text-muted-foreground">🕐 {c.businessHours}</p> : null}
        </div>
        {c.ctaLabel ? (
          <span className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {c.ctaLabel}
          </span>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {[
            c.facebookUrl && "Facebook",
            c.instagramUrl && "Instagram",
            c.linkedinUrl && "LinkedIn",
            c.youtubeUrl && "YouTube",
            c.tiktokUrl && "TikTok",
          ]
            .filter(Boolean)
            .map((s) => (
              <span key={s as string} className="rounded-full bg-secondary px-3 py-1">
                {s as string}
              </span>
            ))}
        </div>
        {c.whatsapp.enabled ? (
          <a
            href={whatsappLink(c.whatsapp.number, c.whatsapp.message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: c.whatsapp.background, color: c.whatsapp.iconColor }}
          >
            {c.whatsapp.label}
          </a>
        ) : null}
      </div>
    </div>
  );
}
