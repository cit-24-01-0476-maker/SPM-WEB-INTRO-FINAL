import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/admin/primitives";
import {
  ActionBar,
  EditorWorkspace,
  FieldCard,
  FieldRow,
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
import {
  DEFAULT_ECONOMIC,
  type EconomicFeasibilitySettings,
  type Localized,
} from "@/lib/cms/model";
import { CURRENCIES, type EFInputs } from "@/lib/roi/calc";

export const Route = createFileRoute("/admin/economic-feasibility")({
  component: EconomicFeasibilityPage,
});

function EconomicFeasibilityPage() {
  const editor = useSettingsEditor<EconomicFeasibilitySettings>(
    "economicFeasibility",
    DEFAULT_ECONOMIC,
  );
  const { draft, setDraft } = editor;
  const { hasAnyRole } = useAdminAuth();
  const isSuperAdmin = hasAnyRole(["super_admin"]);

  const set = (patch: Partial<EconomicFeasibilitySettings>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const setLoc = (field: "navLabel" | "title" | "description" | "disclaimer" | "ctaLabel", code: keyof Localized, value: string) =>
    setDraft((d) => ({ ...d, [field]: { ...(d[field] as Localized), [code]: value } }));
  const setDefault = (field: keyof EFInputs, value: number) =>
    setDraft((d) => ({ ...d, defaults: { ...d.defaults, [field]: value } }));
  const setScenario = (
    which: "conservative" | "optimistic",
    key: "revenue" | "expenses" | "savings",
    value: number,
  ) =>
    setDraft((d) => ({
      ...d,
      scenarios: { ...d.scenarios, [which]: { ...d.scenarios[which], [key]: value } },
    }));
  const setThreshold = (key: "excellent" | "good" | "moderate", value: number) =>
    setDraft((d) => ({ ...d, thresholds: { ...d.thresholds, [key]: value } }));

  const numGroup = (title: string, fields: Array<[keyof EFInputs, string]>) => (
    <FieldCard title={title}>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([field, label]) => (
          <NumberField
            key={field}
            label={label}
            value={draft.defaults[field] as number}
            onChange={(v) => setDefault(field, v)}
          />
        ))}
      </div>
    </FieldCard>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Economic Feasibility"
        description="Control the public ROI Calculator: availability, navigation, bilingual copy, default values, scenarios, thresholds, and SEO. Publishing updates the live page instantly."
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
            <DevicePreview height={260}>
              <div className="flex min-h-full flex-col items-center justify-center gap-2 bg-background p-6 text-center">
                <Calculator className="h-6 w-6 text-primary" />
                <p className="text-sm font-bold text-foreground">{draft.title.en}</p>
                <p className="max-w-xs text-xs text-muted-foreground">{draft.description.en}</p>
                <span
                  className={`mt-2 rounded-full px-3 py-1 text-[11px] font-semibold ${
                    draft.enabled ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
                  }`}
                >
                  {draft.enabled ? "Public calculator ON" : "Public calculator OFF"}
                </span>
              </div>
            </DevicePreview>
          }
          panel={
            <>
              <FieldCard
                title="Availability & navigation"
                description="Turn the public calculator on or off and control the ROI Calculator menu item."
              >
                <ToggleField
                  label="Enable public calculator"
                  description="When off, /roi-calculator shows an unavailable notice"
                  checked={draft.enabled}
                  onChange={(v) => set({ enabled: v })}
                />
                <ToggleField
                  label="Show navigation item"
                  checked={draft.navEnabled}
                  onChange={(v) => set({ navEnabled: v })}
                />
                <ToggleField label="Show in desktop nav" checked={draft.navDesktopVisible} onChange={(v) => set({ navDesktopVisible: v })} />
                <ToggleField label="Show in mobile nav" checked={draft.navMobileVisible} onChange={(v) => set({ navMobileVisible: v })} />
                <ToggleField label="Show in footer" checked={draft.navFooterVisible} onChange={(v) => set({ navFooterVisible: v })} />
                <TextField label="English menu label" value={draft.navLabel.en} onChange={(v) => setLoc("navLabel", "en", v)} />
                <TextField label="Sinhala menu label" value={draft.navLabel.si ?? ""} onChange={(v) => setLoc("navLabel", "si", v)} />
                <NumberField label="Menu order" value={draft.navOrder} onChange={(v) => set({ navOrder: v })} />
              </FieldCard>

              <FieldCard title="Page copy (bilingual)">
                <TextField label="English title" value={draft.title.en} onChange={(v) => setLoc("title", "en", v)} />
                <TextField label="Sinhala title" value={draft.title.si ?? ""} onChange={(v) => setLoc("title", "si", v)} />
                <TextAreaField label="English description" value={draft.description.en} onChange={(v) => setLoc("description", "en", v)} />
                <TextAreaField label="Sinhala description" value={draft.description.si ?? ""} onChange={(v) => setLoc("description", "si", v)} />
              </FieldCard>

              <FieldCard title="Currency">
                <SelectField
                  label="Default currency"
                  value={draft.defaultCurrency}
                  options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                  onChange={(v) => set({ defaultCurrency: v })}
                />
              </FieldCard>

              {numGroup("Default facility values", [
                ["numberOfLocations", "Locations"],
                ["totalSpaces", "Total spaces"],
                ["operatingDays", "Operating days / month"],
                ["currentOccupancy", "Current occupancy (%)"],
                ["expectedOccupancy", "Expected occupancy (%)"],
                ["avgDuration", "Average duration (hours)"],
                ["hourlyFee", "Hourly parking fee"],
              ])}

              {numGroup("Default software & platform costs", [
                ["softwareCost", "Software implementation"],
                ["dashboardCost", "Dashboard implementation"],
                ["mobileAppCost", "Mobile app integration"],
                ["serverCost", "Edge / server"],
                ["paymentIntegrationCost", "Payment integration"],
              ])}

              {numGroup("Default hardware costs", [
                ["cameraUnitCost", "ANPR camera unit"],
                ["cameraCount", "ANPR camera count"],
                ["gateUnitCost", "Barrier gate unit"],
                ["gateCount", "Barrier gate count"],
                ["sensorUnitCost", "Sensor unit"],
                ["sensorCount", "Sensor count"],
                ["networkInstallCost", "Network installation"],
                ["electricalInstallCost", "Electrical installation"],
                ["trainingCost", "Training"],
                ["consultationCost", "Consultation"],
                ["otherInitialCost", "Other initial"],
              ])}

              {numGroup("Default monthly income", [
                ["reservationIncome", "Reservation"],
                ["dynamicPricingIncome", "Dynamic pricing"],
                ["overstayIncome", "Overstay"],
                ["retailParkingIncome", "Retail"],
                ["staffParkingIncome", "Staff parking"],
                ["advertisingIncome", "Advertising"],
                ["premiumParkingIncome", "Premium"],
                ["otherMonthlyIncome", "Other income"],
              ])}

              {numGroup("Default automation savings", [
                ["savingStaff", "Staff cost"],
                ["savingTicketPrinting", "Ticket printing"],
                ["savingRevenueLeakage", "Revenue leakage"],
                ["savingUnauthorized", "Unauthorized loss"],
                ["savingPaymentErrors", "Payment errors"],
                ["savingAdministration", "Administration"],
                ["savingSecurityMonitoring", "Security monitoring"],
                ["savingOther", "Other savings"],
              ])}

              {numGroup("Default operating expenses", [
                ["expCloudHosting", "Cloud hosting"],
                ["expDatabaseStorage", "Database & storage"],
                ["expAiOcr", "AI & OCR"],
                ["expInternet", "Internet"],
                ["expSystemMaintenance", "System maintenance"],
                ["expHardwareMaintenance", "Hardware maintenance"],
                ["expPaymentGateway", "Payment gateway"],
                ["expTechnicalSupport", "Technical support"],
                ["expElectricity", "Electricity"],
                ["expSoftwareLicences", "Software licences"],
                ["expOther", "Other expenses"],
              ])}

              <FieldCard title="Scenario multipliers" description="Applied to the Expected (user) values to build Conservative and Optimistic scenarios.">
                <p className="text-xs font-semibold text-muted-foreground">Conservative</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <NumberField label="Revenue ×" value={draft.scenarios.conservative.revenue} step={0.05} onChange={(v) => setScenario("conservative", "revenue", v)} />
                  <NumberField label="Expenses ×" value={draft.scenarios.conservative.expenses} step={0.05} onChange={(v) => setScenario("conservative", "expenses", v)} />
                  <NumberField label="Savings ×" value={draft.scenarios.conservative.savings} step={0.05} onChange={(v) => setScenario("conservative", "savings", v)} />
                </div>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">Optimistic</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <NumberField label="Revenue ×" value={draft.scenarios.optimistic.revenue} step={0.05} onChange={(v) => setScenario("optimistic", "revenue", v)} />
                  <NumberField label="Expenses ×" value={draft.scenarios.optimistic.expenses} step={0.05} onChange={(v) => setScenario("optimistic", "expenses", v)} />
                  <NumberField label="Savings ×" value={draft.scenarios.optimistic.savings} step={0.05} onChange={(v) => setScenario("optimistic", "savings", v)} />
                </div>
              </FieldCard>

              <FieldCard title="Payback classification thresholds (months)">
                <div className="grid gap-3 sm:grid-cols-3">
                  <NumberField label="Excellent ≤" value={draft.thresholds.excellent} onChange={(v) => setThreshold("excellent", v)} />
                  <NumberField label="Good ≤" value={draft.thresholds.good} onChange={(v) => setThreshold("good", v)} />
                  <NumberField label="Moderate ≤" value={draft.thresholds.moderate} onChange={(v) => setThreshold("moderate", v)} />
                </div>
              </FieldCard>

              <FieldCard title="Sections visibility">
                <ToggleField label="Show charts" checked={draft.showCharts} onChange={(v) => set({ showCharts: v })} />
                <ToggleField label="Show scenario comparison" checked={draft.showScenarios} onChange={(v) => set({ showScenarios: v })} />
                <ToggleField label="Show sensitivity analysis" checked={draft.showSensitivity} onChange={(v) => set({ showSensitivity: v })} />
                <ToggleField label="Show export buttons" checked={draft.showExport} onChange={(v) => set({ showExport: v })} />
                <ToggleField label="Show lead form" checked={draft.showLeadForm} onChange={(v) => set({ showLeadForm: v })} />
              </FieldCard>

              <FieldCard title="Disclaimer & call to action">
                <TextAreaField label="English disclaimer" value={draft.disclaimer.en} onChange={(v) => setLoc("disclaimer", "en", v)} />
                <TextAreaField label="Sinhala disclaimer" value={draft.disclaimer.si ?? ""} onChange={(v) => setLoc("disclaimer", "si", v)} />
                <TextField label="English CTA label" value={draft.ctaLabel.en} onChange={(v) => setLoc("ctaLabel", "en", v)} />
                <TextField label="Sinhala CTA label" value={draft.ctaLabel.si ?? ""} onChange={(v) => setLoc("ctaLabel", "si", v)} />
                <TextField label="CTA link" value={draft.ctaLink} onChange={(v) => set({ ctaLink: v })} />
              </FieldCard>

              <FieldCard title="Page SEO">
                <TextField label="SEO title" value={draft.seoTitle} onChange={(v) => set({ seoTitle: v })} />
                <TextAreaField label="SEO description" value={draft.seoDescription} onChange={(v) => set({ seoDescription: v })} />
              </FieldCard>
            </>
          }
        />
      </SettingsGate>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <FieldRow label={label}>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = e.target.value === "" ? 0 : Number(e.target.value);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />
    </FieldRow>
  );
}
