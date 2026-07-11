import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calculator,
  Download,
  FileText,
  RotateCcw,
  TrendingUp,
  Wallet,
  PiggyBank,
  Receipt,
  CalendarClock,
  Timer,
  Sparkles,
} from "lucide-react";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { mergeDefaults } from "@/lib/cms/model";
import {
  DEFAULT_EF_INPUTS,
  clamp,
  computeResults,
  formatCurrency,
  formatDate,
  formatMonths,
  formatPercent,
  num,
  FACILITY_TYPES,
  CURRENCIES,
  type EFInputs,
  type EFResults,
  type FeasibilityStatus,
} from "@/lib/roi/calc";
import { roiT, type RoiStringKey } from "@/lib/roi/i18n";
import { RoiCharts, type ScenarioRow } from "@/components/roi/RoiCharts";
import { LeadDialog } from "@/components/roi/LeadDialog";
import { exportFeasibilityPdf, exportProjectionCsv } from "@/lib/roi/export";

export const Route = createFileRoute("/roi-calculator")({
  head: () => ({
    meta: [
      { title: "ROI Calculator | SPM ECO System" },
      {
        name: "description",
        content:
          "Calculate the return on investment and payback period for the SPM ECO smart parking system based on your facility's revenue and automation savings.",
      },
      { property: "og:title", content: "ROI Calculator | SPM ECO System" },
      {
        property: "og:description",
        content:
          "Estimate investment recovery, break-even date, and multi-year ROI for the SPM ECO smart parking platform.",
      },
    ],
  }),
  component: RoiCalculatorPage,
});

const STATUS_COLORS: Record<FeasibilityStatus, string> = {
  excellent: "bg-emerald-500/12 text-emerald-600 ring-emerald-500/30",
  good: "bg-blue-500/12 text-blue-600 ring-blue-500/30",
  moderate: "bg-amber-500/12 text-amber-600 ring-amber-500/30",
  longterm: "bg-orange-500/12 text-orange-600 ring-orange-500/30",
  notfeasible: "bg-rose-500/12 text-rose-600 ring-rose-500/30",
};

function RoiCalculatorPage() {
  const { economicFeasibility: ef } = usePublicSettings();
  const { lang, tx } = useLanguage();
  const t = (k: RoiStringKey) => roiT(lang, k);

  const baseDefaults = useMemo<EFInputs>(
    () => mergeDefaults(DEFAULT_EF_INPUTS, { ...ef.defaults, currency: ef.defaultCurrency }),
    [ef.defaults, ef.defaultCurrency],
  );

  const [inputs, setInputs] = useState<EFInputs>(baseDefaults);
  const [leadOpen, setLeadOpen] = useState(false);

  // Sensitivity overrides (null = use base input)
  const [sens, setSens] = useState({
    occupancy: null as number | null,
    fee: null as number | null,
    duration: null as number | null,
    expenseMult: 1,
    investMult: 1,
    savingMult: 1,
  });

  const set = <K extends keyof EFInputs>(key: K, value: EFInputs[K]) =>
    setInputs((p) => ({ ...p, [key]: value }));

  const results = useMemo(
    () => computeResults(inputs, ef.thresholds),
    [inputs, ef.thresholds],
  );

  // Validation (field-level)
  const errors = useMemo(() => {
    const e: Partial<Record<keyof EFInputs, string>> = {};
    if (num(inputs.totalSpaces) <= 0) e.totalSpaces = t("val.spaces");
    if (inputs.currentOccupancy < 0 || inputs.currentOccupancy > 100)
      e.currentOccupancy = t("val.occupancy");
    if (inputs.expectedOccupancy < 0 || inputs.expectedOccupancy > 100)
      e.expectedOccupancy = t("val.occupancy");
    if (num(inputs.operatingDays) < 1 || num(inputs.operatingDays) > 31)
      e.operatingDays = t("val.operatingDays");
    if (num(inputs.avgDuration) <= 0) e.avgDuration = t("val.duration");
    if (num(inputs.numberOfLocations) < 1) e.numberOfLocations = t("val.locations");
    return e;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, lang]);

  // Scenarios
  const scenarioRows = useMemo<ScenarioRow[]>(() => {
    const con = computeResults(inputs, ef.thresholds, ef.scenarios.conservative);
    const opt = computeResults(inputs, ef.thresholds, ef.scenarios.optimistic);
    return [
      {
        name: t("scenario.conservative"),
        revenue: Math.round(con.monthlyGrossRevenue),
        expenses: Math.round(con.monthlyExpenses),
        net: Math.round(con.monthlyNetBenefit),
      },
      {
        name: t("scenario.expected"),
        revenue: Math.round(results.monthlyGrossRevenue),
        expenses: Math.round(results.monthlyExpenses),
        net: Math.round(results.monthlyNetBenefit),
      },
      {
        name: t("scenario.optimistic"),
        revenue: Math.round(opt.monthlyGrossRevenue),
        expenses: Math.round(opt.monthlyExpenses),
        net: Math.round(opt.monthlyNetBenefit),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, ef.thresholds, ef.scenarios, results, lang]);

  const scenarioTable = useMemo(() => {
    const con = computeResults(inputs, ef.thresholds, ef.scenarios.conservative);
    const opt = computeResults(inputs, ef.thresholds, ef.scenarios.optimistic);
    return [
      { key: "scenario.conservative", res: con, mult: ef.scenarios.conservative },
      { key: "scenario.expected", res: results, mult: { revenue: 1, expenses: 1, savings: 1 } },
      { key: "scenario.optimistic", res: opt, mult: ef.scenarios.optimistic },
    ] as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, ef.thresholds, ef.scenarios, results]);

  // Sensitivity
  const sensResult = useMemo(() => {
    const modified: EFInputs = {
      ...inputs,
      expectedOccupancy: sens.occupancy ?? inputs.expectedOccupancy,
      hourlyFee: sens.fee ?? inputs.hourlyFee,
      avgDuration: sens.duration ?? inputs.avgDuration,
    };
    const r = computeResults(modified, ef.thresholds, {
      revenue: 1,
      expenses: sens.expenseMult,
      savings: sens.savingMult,
    });
    const investment = r.totalInvestment * sens.investMult;
    const net = r.monthlyNetBenefit;
    const payback = net > 0 && investment > 0 ? investment / net : net > 0 ? 0 : null;
    const roi = (years: number) =>
      investment > 0 ? ((net * 12 * years - investment) / investment) * 100 : null;
    return { net, payback, roi1: roi(1), roi5: roi(5), investment };
  }, [inputs, sens, ef.thresholds]);

  const biggestImpact = useMemo(() => {
    const basePayback = sensResult.payback;
    if (basePayback === null) return null;
    const perturbations: Array<{ key: RoiStringKey; apply: () => EFInputs; invest: number; expMult: number; savMult: number }> = [
      {
        key: "sens.occupancy",
        apply: () => ({ ...inputs, expectedOccupancy: clamp((sens.occupancy ?? inputs.expectedOccupancy) * 1.1, 0, 100) }),
        invest: sens.investMult,
        expMult: sens.expenseMult,
        savMult: sens.savingMult,
      },
      {
        key: "sens.hourlyFee",
        apply: () => ({ ...inputs, hourlyFee: (sens.fee ?? inputs.hourlyFee) * 1.1 }),
        invest: sens.investMult,
        expMult: sens.expenseMult,
        savMult: sens.savingMult,
      },
      {
        key: "sens.duration",
        apply: () => ({ ...inputs, avgDuration: (sens.duration ?? inputs.avgDuration) * 1.1 }),
        invest: sens.investMult,
        expMult: sens.expenseMult,
        savMult: sens.savingMult,
      },
      {
        key: "sens.operatingCost",
        apply: () => inputs,
        invest: sens.investMult,
        expMult: sens.expenseMult * 1.1,
        savMult: sens.savingMult,
      },
      {
        key: "sens.investment",
        apply: () => inputs,
        invest: sens.investMult * 1.1,
        expMult: sens.expenseMult,
        savMult: sens.savingMult,
      },
      {
        key: "sens.savings",
        apply: () => inputs,
        invest: sens.investMult,
        expMult: sens.expenseMult,
        savMult: sens.savingMult * 1.1,
      },
    ];
    let best: { key: RoiStringKey; delta: number } | null = null;
    for (const p of perturbations) {
      const base = { ...p.apply(), hourlyFee: (p.apply().hourlyFee), avgDuration: p.apply().avgDuration };
      const r = computeResults(
        { ...base, expectedOccupancy: base.expectedOccupancy, avgDuration: base.avgDuration },
        ef.thresholds,
        { revenue: 1, expenses: p.expMult, savings: p.savMult },
      );
      const investment = r.totalInvestment * p.invest;
      const net = r.monthlyNetBenefit;
      const payback = net > 0 && investment > 0 ? investment / net : null;
      if (payback === null) continue;
      const delta = Math.abs(payback - basePayback);
      if (!best || delta > best.delta) best = { key: p.key, delta };
    }
    return best;
  }, [inputs, sens, ef.thresholds, sensResult.payback]);

  if (!ef.enabled) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 pt-28 text-center">
        <Calculator className="h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">{tx(ef.title)}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("misc.disabled")}</p>
      </div>
    );
  }

  const cur = inputs.currency;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 pb-16 pt-24 sm:pt-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Calculator className="h-3.5 w-3.5" /> {t("nav.roiCalculator")}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {tx(ef.title)}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {tx(ef.description)}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Inputs */}
          <div className="space-y-4">
            <InputGroup title={t("group.facility")}>
              <SelectField
                label={t("in.facilityType")}
                value={inputs.facilityType}
                options={FACILITY_TYPES.map((f) => ({ value: f, label: f }))}
                onChange={(v) => set("facilityType", v)}
              />
              <SelectField
                label={t("in.currency")}
                value={inputs.currency}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                onChange={(v) => set("currency", v)}
              />
              <NumberField label={t("in.numberOfLocations")} value={inputs.numberOfLocations} onChange={(v) => set("numberOfLocations", v)} error={errors.numberOfLocations} min={1} />
              <NumberField label={t("in.totalSpaces")} value={inputs.totalSpaces} onChange={(v) => set("totalSpaces", v)} error={errors.totalSpaces} min={0} />
              <NumberField label={t("in.operatingDays")} value={inputs.operatingDays} onChange={(v) => set("operatingDays", v)} error={errors.operatingDays} min={0} />
              <NumberField label={t("in.currentOccupancy")} value={inputs.currentOccupancy} onChange={(v) => set("currentOccupancy", v)} error={errors.currentOccupancy} min={0} max={100} />
              <NumberField label={t("in.expectedOccupancy")} value={inputs.expectedOccupancy} onChange={(v) => set("expectedOccupancy", v)} error={errors.expectedOccupancy} min={0} max={100} />
              <NumberField label={t("in.avgDuration")} value={inputs.avgDuration} onChange={(v) => set("avgDuration", v)} error={errors.avgDuration} min={0} step={0.5} />
              <NumberField label={`${t("in.hourlyFee")} (${cur})`} value={inputs.hourlyFee} onChange={(v) => set("hourlyFee", v)} min={0} />
            </InputGroup>

            <InputGroup title={`${t("group.investment")} (${cur})`}>
              {(
                [
                  ["softwareCost", "in.softwareCost"],
                  ["dashboardCost", "in.dashboardCost"],
                  ["mobileAppCost", "in.mobileAppCost"],
                  ["cameraUnitCost", "in.cameraUnitCost"],
                  ["cameraCount", "in.cameraCount"],
                  ["gateUnitCost", "in.gateUnitCost"],
                  ["gateCount", "in.gateCount"],
                  ["sensorUnitCost", "in.sensorUnitCost"],
                  ["sensorCount", "in.sensorCount"],
                  ["serverCost", "in.serverCost"],
                  ["networkInstallCost", "in.networkInstallCost"],
                  ["electricalInstallCost", "in.electricalInstallCost"],
                  ["paymentIntegrationCost", "in.paymentIntegrationCost"],
                  ["trainingCost", "in.trainingCost"],
                  ["consultationCost", "in.consultationCost"],
                  ["otherInitialCost", "in.otherInitialCost"],
                ] as Array<[keyof EFInputs, RoiStringKey]>
              ).map(([field, key]) => (
                <NumberField key={field} label={t(key)} value={inputs[field] as number} onChange={(v) => set(field, v as never)} min={0} />
              ))}
            </InputGroup>

            <InputGroup title={`${t("group.income")} (${cur})`}>
              {(
                [
                  ["reservationIncome", "in.reservationIncome"],
                  ["dynamicPricingIncome", "in.dynamicPricingIncome"],
                  ["overstayIncome", "in.overstayIncome"],
                  ["retailParkingIncome", "in.retailParkingIncome"],
                  ["staffParkingIncome", "in.staffParkingIncome"],
                  ["advertisingIncome", "in.advertisingIncome"],
                  ["premiumParkingIncome", "in.premiumParkingIncome"],
                  ["otherMonthlyIncome", "in.otherMonthlyIncome"],
                ] as Array<[keyof EFInputs, RoiStringKey]>
              ).map(([field, key]) => (
                <NumberField key={field} label={t(key)} value={inputs[field] as number} onChange={(v) => set(field, v as never)} min={0} />
              ))}
            </InputGroup>

            <InputGroup title={`${t("group.savings")} (${cur})`}>
              {(
                [
                  ["savingStaff", "in.savingStaff"],
                  ["savingTicketPrinting", "in.savingTicketPrinting"],
                  ["savingRevenueLeakage", "in.savingRevenueLeakage"],
                  ["savingUnauthorized", "in.savingUnauthorized"],
                  ["savingPaymentErrors", "in.savingPaymentErrors"],
                  ["savingAdministration", "in.savingAdministration"],
                  ["savingSecurityMonitoring", "in.savingSecurityMonitoring"],
                  ["savingOther", "in.savingOther"],
                ] as Array<[keyof EFInputs, RoiStringKey]>
              ).map(([field, key]) => (
                <NumberField key={field} label={t(key)} value={inputs[field] as number} onChange={(v) => set(field, v as never)} min={0} />
              ))}
            </InputGroup>

            <InputGroup title={`${t("group.expenses")} (${cur})`}>
              {(
                [
                  ["expCloudHosting", "in.expCloudHosting"],
                  ["expDatabaseStorage", "in.expDatabaseStorage"],
                  ["expAiOcr", "in.expAiOcr"],
                  ["expInternet", "in.expInternet"],
                  ["expSystemMaintenance", "in.expSystemMaintenance"],
                  ["expHardwareMaintenance", "in.expHardwareMaintenance"],
                  ["expPaymentGateway", "in.expPaymentGateway"],
                  ["expTechnicalSupport", "in.expTechnicalSupport"],
                  ["expElectricity", "in.expElectricity"],
                  ["expSoftwareLicences", "in.expSoftwareLicences"],
                  ["expOther", "in.expOther"],
                ] as Array<[keyof EFInputs, RoiStringKey]>
              ).map(([field, key]) => (
                <NumberField key={field} label={t(key)} value={inputs[field] as number} onChange={(v) => set(field, v as never)} min={0} />
              ))}
            </InputGroup>

            <button
              onClick={() => {
                setInputs(baseDefaults);
                setSens({ occupancy: null, fee: null, duration: null, expenseMult: 1, investMult: 1, savingMult: 1 });
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" /> {t("action.reset")}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Status */}
            <div className={`rounded-2xl p-5 ring-1 ${STATUS_COLORS[results.status]}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t(`status.${results.status}` as RoiStringKey)}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">
                {results.paybackMonths === null
                  ? t("status.notFeasibleBody")
                  : `${t("misc.recoveryText")} ${formatMonths(results.paybackMonths)} ${t("res.months")}.`}
              </p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard icon={<Wallet className="h-4 w-4" />} label={t("res.totalInvestment")} value={formatCurrency(results.totalInvestment, cur)} />
              <KpiCard icon={<TrendingUp className="h-4 w-4" />} label={t("res.grossRevenue")} value={formatCurrency(results.monthlyGrossRevenue, cur)} />
              <KpiCard icon={<Receipt className="h-4 w-4" />} label={t("res.operatingCost")} value={formatCurrency(results.monthlyExpenses, cur)} />
              <KpiCard icon={<PiggyBank className="h-4 w-4" />} label={t("res.savings")} value={formatCurrency(results.monthlySavings, cur)} />
              <KpiCard
                icon={<TrendingUp className="h-4 w-4" />}
                label={t("res.netBenefit")}
                value={formatCurrency(results.monthlyNetBenefit, cur)}
                accent={results.monthlyNetBenefit > 0 ? "green" : "red"}
              />
              <KpiCard
                icon={<Timer className="h-4 w-4" />}
                label={t("res.payback")}
                value={results.paybackMonths === null ? "—" : `${formatMonths(results.paybackMonths)} ${t("res.months")}`}
              />
              <KpiCard icon={<CalendarClock className="h-4 w-4" />} label={t("res.breakEven")} value={formatDate(results.breakEvenDate)} />
              <KpiCard icon={<TrendingUp className="h-4 w-4" />} label={t("res.roi1")} value={formatPercent(results.roi1)} />
              <KpiCard icon={<TrendingUp className="h-4 w-4" />} label={t("res.roi3")} value={formatPercent(results.roi3)} />
              <KpiCard icon={<TrendingUp className="h-4 w-4" />} label={t("res.roi5")} value={formatPercent(results.roi5)} />
              <div className="col-span-2">
                <KpiCard
                  icon={<PiggyBank className="h-4 w-4" />}
                  label={t("res.fiveYearProfit")}
                  value={formatCurrency(results.fiveYearProfit, cur)}
                  accent={results.fiveYearProfit > 0 ? "green" : "red"}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {ef.showExport ? (
                <>
                  <button
                    onClick={() => exportFeasibilityPdf(results, inputs, lang, tx(ef.disclaimer))}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-white shadow-glow"
                  >
                    <FileText className="h-4 w-4" /> {t("action.downloadPdf")}
                  </button>
                  <button
                    onClick={() => exportProjectionCsv(results)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    <Download className="h-4 w-4" /> {t("action.downloadCsv")}
                  </button>
                </>
              ) : null}
            </div>
            {ef.showLeadForm ? (
              <button
                onClick={() => setLeadOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/15"
              >
                {tx(ef.ctaLabel)}
              </button>
            ) : null}

            <p className="text-xs leading-relaxed text-muted-foreground">{tx(ef.disclaimer)}</p>
          </div>
        </div>

        {/* Scenarios */}
        {ef.showScenarios ? (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-foreground">{t("scenario.title")}</h2>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">{t("scenario.assumptions")}</th>
                    {scenarioTable.map((s) => (
                      <th key={s.key} className="px-4 py-3 font-semibold">{t(s.key as RoiStringKey)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <ScRow label={`${t("scenario.revenueX")} / ${t("scenario.expensesX")} / ${t("scenario.savingsX")}`} cells={scenarioTable.map((s) => `${s.mult.revenue}× / ${s.mult.expenses}× / ${s.mult.savings}×`)} />
                  <ScRow label={t("res.grossRevenue")} cells={scenarioTable.map((s) => formatCurrency(s.res.monthlyGrossRevenue, cur))} />
                  <ScRow label={t("res.operatingCost")} cells={scenarioTable.map((s) => formatCurrency(s.res.monthlyExpenses, cur))} />
                  <ScRow label={t("res.netBenefit")} cells={scenarioTable.map((s) => formatCurrency(s.res.monthlyNetBenefit, cur))} />
                  <ScRow label={t("res.payback")} cells={scenarioTable.map((s) => (s.res.paybackMonths === null ? "—" : `${formatMonths(s.res.paybackMonths)} ${t("res.months")}`))} />
                  <ScRow label={t("res.roi1")} cells={scenarioTable.map((s) => formatPercent(s.res.roi1))} />
                  <ScRow label={t("res.roi5")} cells={scenarioTable.map((s) => formatPercent(s.res.roi5))} />
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {/* Charts */}
        {ef.showCharts ? (
          <section className="mt-10">
            <RoiCharts results={results} lang={lang} scenarioRows={scenarioRows} />
          </section>
        ) : null}

        {/* Sensitivity */}
        {ef.showSensitivity ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">{t("sens.title")}</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">{t("sens.subtitle")}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <SliderRow label={t("sens.occupancy")} value={sens.occupancy ?? inputs.expectedOccupancy} min={0} max={100} step={1} suffix="%" onChange={(v) => setSens((s) => ({ ...s, occupancy: v }))} />
                <SliderRow label={`${t("sens.hourlyFee")} (${cur})`} value={sens.fee ?? inputs.hourlyFee} min={0} max={Math.max(1000, Math.round((inputs.hourlyFee || 150) * 3))} step={10} onChange={(v) => setSens((s) => ({ ...s, fee: v }))} />
                <SliderRow label={t("sens.duration")} value={sens.duration ?? inputs.avgDuration} min={0.5} max={12} step={0.5} onChange={(v) => setSens((s) => ({ ...s, duration: v }))} />
                <SliderRow label={t("sens.operatingCost")} value={sens.expenseMult} min={0.5} max={2} step={0.05} suffix="×" onChange={(v) => setSens((s) => ({ ...s, expenseMult: v }))} />
                <SliderRow label={t("sens.investment")} value={sens.investMult} min={0.5} max={2} step={0.05} suffix="×" onChange={(v) => setSens((s) => ({ ...s, investMult: v }))} />
                <SliderRow label={t("sens.savings")} value={sens.savingMult} min={0.5} max={2} step={0.05} suffix="×" onChange={(v) => setSens((s) => ({ ...s, savingMult: v }))} />
                <button
                  onClick={() => setSens({ occupancy: null, fee: null, duration: null, expenseMult: 1, investMult: 1, savingMult: 1 })}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> {t("sens.reset")}
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard icon={<TrendingUp className="h-4 w-4" />} label={t("res.netBenefit")} value={formatCurrency(sensResult.net, cur)} accent={sensResult.net > 0 ? "green" : "red"} />
                  <KpiCard icon={<Timer className="h-4 w-4" />} label={t("res.payback")} value={sensResult.payback === null ? "—" : `${formatMonths(sensResult.payback)} ${t("res.months")}`} />
                  <KpiCard icon={<TrendingUp className="h-4 w-4" />} label={t("res.roi1")} value={formatPercent(sensResult.roi1)} />
                  <KpiCard icon={<TrendingUp className="h-4 w-4" />} label={t("res.roi5")} value={formatPercent(sensResult.roi5)} />
                </div>
                {biggestImpact ? (
                  <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("sens.biggestImpact")}</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{t(biggestImpact.key)}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {leadOpen ? (
        <LeadDialog lang={lang} inputs={inputs} results={results} onClose={() => setLeadOpen(false)} />
      ) : null}
    </div>
  );
}

/* --- small presentational helpers ---------------------------------- */

function InputGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <summary className="cursor-pointer list-none text-sm font-bold text-foreground marker:hidden">
        {title}
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </details>
  );
}

function NumberField({
  label,
  value,
  onChange,
  error,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = e.target.value;
          const n = raw === "" ? 0 : Number(raw);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error ? <span className="mt-1 block text-[11px] font-medium text-destructive">{error}</span> : null}
    </label>
  );
}

function SelectField({
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
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function KpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "green" | "red";
}) {
  const valueColor =
    accent === "green" ? "text-emerald-600" : accent === "red" ? "text-rose-600" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`mt-1.5 text-base font-extrabold tabular-nums sm:text-lg ${valueColor}`}>{value}</p>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-medium text-foreground">
        {label}
        <span className="tabular-nums text-muted-foreground">
          {Number.isInteger(value) ? value : value.toFixed(2)}
          {suffix ?? ""}
        </span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
    </label>
  );
}

function ScRow({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-4 py-2.5 font-semibold tabular-nums text-foreground">
          {c}
        </td>
      ))}
    </tr>
  );
}
