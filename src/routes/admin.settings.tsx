import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { dbRead, dbWrite } from "@/lib/admin/db";
import { useAdminAuth } from "@/lib/admin/auth";
import { PageHeader, AdminCard } from "@/components/admin/primitives";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

interface GeneralSettings {
  website_name: string;
  website_url: string;
  contact_email: string;
  notification_email: string;
  timezone: string;
  maintenance_mode: boolean;
  cookie_consent: boolean;
  analytics_enabled: boolean;
  ip_anonymization: boolean;
  location_analytics: boolean;
  retention_days: number;
}

const DEFAULTS: GeneralSettings = {
  website_name: "SPM ECO System",
  website_url: "",
  contact_email: "spmaco@spm.com",
  notification_email: "",
  timezone: "Asia/Colombo",
  maintenance_mode: false,
  cookie_consent: true,
  analytics_enabled: true,
  ip_anonymization: true,
  location_analytics: true,
  retention_days: 90,
};

function SettingsPage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const [form, setForm] = useState<GeneralSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["settings-general"],
    queryFn: async () => {
      const { data } = await dbRead<{ data: Partial<GeneralSettings> } | null>({
        table: "website_settings",
        select: "data",
        eq: [["setting_key", "general"]],
        single: true,
      });
      return (data?.data as Partial<GeneralSettings>) ?? null;
    },
  });

  useEffect(() => {
    if (data) setForm({ ...DEFAULTS, ...data });
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      await dbWrite({
        op: "upsert",
        table: "website_settings",
        values: {
          setting_key: "general",
          data: JSON.parse(JSON.stringify(form)),
          updated_by: null,
        },
        onConflict: "setting_key",
      });
      if (user) {
        await dbWrite({
          op: "insert",
          table: "audit_logs",
          values: {
            actor_id: null,
            actor_email: user.email ?? null,
            action: "settings_change",
            entity: "website_settings",
            metadata: { firebase_uid: user.uid },
          },
        });
      }
      qc.invalidateQueries({ queryKey: ["settings-general"] });
      toast.success("Settings saved");
    } catch (e) {
      toast.error("Save failed", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof GeneralSettings>(k: K, v: GeneralSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Settings"
        description="Global website configuration and privacy controls."
        actions={
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="General">
          <div className="space-y-4">
            <Field label="Website name">
              <Input value={form.website_name} onChange={(v) => set("website_name", v)} />
            </Field>
            <Field label="Website URL">
              <Input
                value={form.website_url}
                onChange={(v) => set("website_url", v)}
                placeholder="https://…"
              />
            </Field>
            <Field label="Time zone">
              <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Asia/Colombo", "UTC", "Asia/Kolkata", "Asia/Dubai", "Europe/London"].map(
                    (tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Email & notifications">
          <div className="space-y-4">
            <Field label="Contact email">
              <Input value={form.contact_email} onChange={(v) => set("contact_email", v)} />
            </Field>
            <Field label="Notification email">
              <Input
                value={form.notification_email}
                onChange={(v) => set("notification_email", v)}
                placeholder="alerts@…"
              />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Privacy & analytics" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle
              label="Analytics enabled"
              hint="Collect privacy-aware traffic data"
              checked={form.analytics_enabled}
              onChange={(v) => set("analytics_enabled", v)}
            />
            <Toggle
              label="IP anonymization"
              hint="Mask & hash visitor IPs (recommended)"
              checked={form.ip_anonymization}
              onChange={(v) => set("ip_anonymization", v)}
            />
            <Toggle
              label="Location analytics"
              hint="Approximate country-level geography"
              checked={form.location_analytics}
              onChange={(v) => set("location_analytics", v)}
            />
            <Toggle
              label="Cookie consent banner"
              hint="Show a consent notice to visitors"
              checked={form.cookie_consent}
              onChange={(v) => set("cookie_consent", v)}
            />
            <Toggle
              label="Maintenance mode"
              hint="Temporarily take the public site offline"
              checked={form.maintenance_mode}
              onChange={(v) => set("maintenance_mode", v)}
            />
            <Field label="Data retention (days)">
              <Input
                type="number"
                value={String(form.retention_days)}
                onChange={(v) => set("retention_days", Number(v) || 0)}
              />
            </Field>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input({
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

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
