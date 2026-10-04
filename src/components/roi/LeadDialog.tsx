import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import type { LanguageCode } from "@/lib/cms/model";
import { submitInquiry, mapInquiryError } from "@/lib/cms/inquiries";
import { roiT } from "@/lib/roi/i18n";
import {
  formatCurrency,
  formatMonths,
  formatPercent,
  type EFInputs,
  type EFResults,
} from "@/lib/roi/calc";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
});

function buildSummary(inputs: EFInputs, results: EFResults): string {
  const cur = results.currency;
  const lines = [
    "— ROI Calculator Summary —",
    `Facility: ${inputs.facilityType}`,
    `Locations: ${inputs.numberOfLocations}`,
    `Total spaces: ${inputs.totalSpaces}`,
    `Expected occupancy: ${inputs.expectedOccupancy}%`,
    `Avg duration: ${inputs.avgDuration}h`,
    `Hourly fee: ${formatCurrency(inputs.hourlyFee, cur)}`,
    `Operating days: ${inputs.operatingDays}`,
    `Total investment: ${formatCurrency(results.totalInvestment, cur)}`,
    `Monthly gross revenue: ${formatCurrency(results.monthlyGrossRevenue, cur)}`,
    `Monthly operating cost: ${formatCurrency(results.monthlyExpenses, cur)}`,
    `Monthly automation savings: ${formatCurrency(results.monthlySavings, cur)}`,
    `Monthly net benefit: ${formatCurrency(results.monthlyNetBenefit, cur)}`,
    `Payback: ${results.paybackMonths === null ? "N/A" : formatMonths(results.paybackMonths) + " months"}`,
    `1yr ROI: ${formatPercent(results.roi1)} | 5yr ROI: ${formatPercent(results.roi5)}`,
    `5yr net profit: ${formatCurrency(results.fiveYearProfit, cur)}`,
  ];
  return lines.join("\n").slice(0, 3000);
}

export function LeadDialog({
  lang,
  inputs,
  results,
  onClose,
}: {
  lang: LanguageCode;
  inputs: EFInputs;
  results: EFResults;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ name, email });
    if (!parsed.success) {
      setErr(
        !name.trim() || name.trim().length < 2 ? roiT(lang, "val.name") : roiT(lang, "val.email"),
      );
      return;
    }
    setErr(null);
    setSending(true);
    try {
      const summary = buildSummary(inputs, results);
      const projectRequirement = notes.trim()
        ? `${notes.trim()}\n\n${summary}`.slice(0, 3000)
        : summary;
      await submitInquiry({
        fullName: name,
        organization,
        email,
        phone: phone.trim() || "N/A",
        facilityType: inputs.facilityType,
        parkingCapacity: Math.trunc(inputs.totalSpaces) || null,
        numberOfLocations: Math.max(1, Math.trunc(inputs.numberOfLocations)) || 1,
        preferredContactId: null,
        preferredContactName: null,
        preferredContactMethod: "email",
        projectRequirement,
        message: `Detailed feasibility study request via ROI Calculator.\n\n${summary}`,
        privacyConsent: true,
        sourcePage: "ROI Calculator",
        sourceUrl: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      });
      toast.success(roiT(lang, "lead.success"));
      onClose();
    } catch (error) {
      toast.error(mapInquiryError(error));
      setErr(roiT(lang, "lead.error"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">{roiT(lang, "lead.title")}</h2>
          <button
            onClick={onClose}
            aria-label={roiT(lang, "action.close")}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">{roiT(lang, "lead.summaryNote")}</p>
        <form onSubmit={submit} className="space-y-3">
          <Field label={roiT(lang, "lead.name")} value={name} onChange={setName} required />
          <Field
            label={roiT(lang, "lead.organization")}
            value={organization}
            onChange={setOrganization}
          />
          <Field
            label={roiT(lang, "lead.email")}
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
          <Field label={roiT(lang, "lead.phone")} value={phone} onChange={setPhone} type="tel" />
          <label className="block">
            <span className="text-xs font-medium text-foreground">{roiT(lang, "lead.notes")}</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          {err ? <p className="text-xs font-medium text-destructive">{err}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-bold text-white shadow-glow disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {sending ? roiT(lang, "lead.sending") : roiT(lang, "lead.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}
