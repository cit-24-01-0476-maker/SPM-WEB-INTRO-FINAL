// Economic Feasibility & ROI Calculator — pure calculation engine.
//
// All functions here are deterministic and defensive: every numeric input is
// coerced to a finite, non-negative number, and every division is guarded so
// the UI can NEVER render NaN, Infinity, undefined, or fabricated values.

/* ------------------------------------------------------------------ *
 * Inputs                                                              *
 * ------------------------------------------------------------------ */

export const FACILITY_TYPES = [
  "Shopping Mall",
  "Office Building",
  "Hospital",
  "Hotel",
  "Apartment Complex",
  "University",
  "Factory",
  "Retail Chain",
  "Public Parking",
  "Other",
] as const;
export type FacilityType = (typeof FACILITY_TYPES)[number];

export const CURRENCIES = ["LKR", "USD", "EUR", "GBP", "INR", "AUD"] as const;

export interface EFInputs {
  // Facility information
  facilityType: string;
  numberOfLocations: number;
  totalSpaces: number;
  operatingDays: number;
  currentOccupancy: number; // %
  expectedOccupancy: number; // %
  avgDuration: number; // hours
  hourlyFee: number;
  currency: string;

  // Initial investment
  softwareCost: number;
  dashboardCost: number;
  mobileAppCost: number;
  cameraUnitCost: number;
  cameraCount: number;
  gateUnitCost: number;
  gateCount: number;
  sensorUnitCost: number;
  sensorCount: number;
  serverCost: number;
  networkInstallCost: number;
  electricalInstallCost: number;
  paymentIntegrationCost: number;
  trainingCost: number;
  consultationCost: number;
  otherInitialCost: number;

  // Monthly income (in addition to base parking revenue)
  reservationIncome: number;
  dynamicPricingIncome: number;
  overstayIncome: number;
  retailParkingIncome: number;
  staffParkingIncome: number;
  advertisingIncome: number;
  premiumParkingIncome: number;
  otherMonthlyIncome: number;

  // Monthly automation savings
  savingStaff: number;
  savingTicketPrinting: number;
  savingRevenueLeakage: number;
  savingUnauthorized: number;
  savingPaymentErrors: number;
  savingAdministration: number;
  savingSecurityMonitoring: number;
  savingOther: number;

  // Monthly operating expenses
  expCloudHosting: number;
  expDatabaseStorage: number;
  expAiOcr: number;
  expInternet: number;
  expSystemMaintenance: number;
  expHardwareMaintenance: number;
  expPaymentGateway: number;
  expTechnicalSupport: number;
  expElectricity: number;
  expSoftwareLicences: number;
  expOther: number;
}

export interface EFScenarioMultipliers {
  revenue: number;
  expenses: number;
  savings: number;
}

export interface EFScenarios {
  conservative: EFScenarioMultipliers;
  optimistic: EFScenarioMultipliers;
}

export interface EFThresholds {
  excellent: number; // <= months
  good: number; // <= months
  moderate: number; // <= months
}

/* ------------------------------------------------------------------ *
 * Defaults (used by the calculator and admin settings)               *
 * ------------------------------------------------------------------ */

export const DEFAULT_EF_INPUTS: EFInputs = {
  facilityType: "Shopping Mall",
  numberOfLocations: 1,
  totalSpaces: 200,
  operatingDays: 30,
  currentOccupancy: 45,
  expectedOccupancy: 65,
  avgDuration: 2,
  hourlyFee: 150,
  currency: "LKR",

  softwareCost: 3_000_000,
  dashboardCost: 1_500_000,
  mobileAppCost: 1_500_000,
  cameraUnitCost: 180_000,
  cameraCount: 8,
  gateUnitCost: 450_000,
  gateCount: 4,
  sensorUnitCost: 12_000,
  sensorCount: 60,
  serverCost: 900_000,
  networkInstallCost: 400_000,
  electricalInstallCost: 350_000,
  paymentIntegrationCost: 400_000,
  trainingCost: 250_000,
  consultationCost: 300_000,
  otherInitialCost: 200_000,

  reservationIncome: 120_000,
  dynamicPricingIncome: 90_000,
  overstayIncome: 60_000,
  retailParkingIncome: 80_000,
  staffParkingIncome: 40_000,
  advertisingIncome: 50_000,
  premiumParkingIncome: 70_000,
  otherMonthlyIncome: 0,

  savingStaff: 150_000,
  savingTicketPrinting: 20_000,
  savingRevenueLeakage: 70_000,
  savingUnauthorized: 30_000,
  savingPaymentErrors: 10_000,
  savingAdministration: 15_000,
  savingSecurityMonitoring: 5_000,
  savingOther: 0,

  expCloudHosting: 120_000,
  expDatabaseStorage: 60_000,
  expAiOcr: 150_000,
  expInternet: 80_000,
  expSystemMaintenance: 100_000,
  expHardwareMaintenance: 90_000,
  expPaymentGateway: 70_000,
  expTechnicalSupport: 60_000,
  expElectricity: 60_000,
  expSoftwareLicences: 50_000,
  expOther: 10_000,
};

export const DEFAULT_EF_SCENARIOS: EFScenarios = {
  conservative: { revenue: 0.8, expenses: 1.15, savings: 0.85 },
  optimistic: { revenue: 1.2, expenses: 0.9, savings: 1.15 },
};

export const DEFAULT_EF_THRESHOLDS: EFThresholds = {
  excellent: 24,
  good: 36,
  moderate: 60,
};

/* ------------------------------------------------------------------ *
 * Safe numeric helpers                                                *
 * ------------------------------------------------------------------ */

/** Coerce anything into a finite number >= 0. Never returns NaN/Infinity. */
export function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
  return n < 0 ? 0 : n;
}

/** Clamp a number into [min, max] with a safe fallback. */
export function clamp(v: unknown, min: number, max: number): number {
  const n = num(v);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/* ------------------------------------------------------------------ *
 * Line-item breakdown                                                 *
 * ------------------------------------------------------------------ */

export interface BreakdownItem {
  key: string;
  amount: number;
}

export type FeasibilityStatus =
  | "excellent"
  | "good"
  | "moderate"
  | "longterm"
  | "notfeasible";

export interface EFResults {
  currency: string;

  // Revenue
  avgOccupiedSpaces: number;
  dailyParkingRevenue: number;
  monthlyBaseParkingRevenue: number;
  monthlyGrossRevenue: number;

  // Costs
  totalInvestment: number;
  monthlySavings: number;
  monthlyExpenses: number;
  monthlyNetBenefit: number;

  // Recovery
  paybackMonths: number | null;
  breakEvenDate: Date | null;
  annualNetBenefit: number;
  roi1: number | null;
  roi3: number | null;
  roi5: number | null;
  fiveYearProfit: number;

  status: FeasibilityStatus;

  // Breakdowns
  investmentBreakdown: BreakdownItem[];
  revenueBreakdown: BreakdownItem[];
  savingsBreakdown: BreakdownItem[];
  expenseBreakdown: BreakdownItem[];

  // Time series
  monthly: Array<{ month: number; cumulativeReturn: number; investment: number }>;
  yearly: Array<{
    year: number;
    revenue: number;
    expenses: number;
    savings: number;
    net: number;
    cumulativeNet: number;
  }>;
}

/* ------------------------------------------------------------------ *
 * Core computation                                                    *
 * ------------------------------------------------------------------ */

export function computeResults(
  raw: EFInputs,
  thresholds: EFThresholds = DEFAULT_EF_THRESHOLDS,
  multipliers: EFScenarioMultipliers = { revenue: 1, expenses: 1, savings: 1 },
): EFResults {
  const totalSpaces = num(raw.totalSpaces);
  const operatingDays = clamp(raw.operatingDays, 0, 31);
  const expectedOccupancy = clamp(raw.expectedOccupancy, 0, 100);
  const avgDuration = num(raw.avgDuration);
  const hourlyFee = num(raw.hourlyFee);

  const mRev = num(multipliers.revenue) || 1;
  const mExp = num(multipliers.expenses) || 1;
  const mSav = num(multipliers.savings) || 1;

  // Revenue
  const avgOccupiedSpaces = totalSpaces * (expectedOccupancy / 100);
  const dailyParkingRevenue = avgOccupiedSpaces * avgDuration * hourlyFee;
  const monthlyBaseParkingRevenue = dailyParkingRevenue * operatingDays;

  const revenueBreakdown: BreakdownItem[] = [
    { key: "baseParking", amount: monthlyBaseParkingRevenue },
    { key: "reservation", amount: num(raw.reservationIncome) },
    { key: "dynamicPricing", amount: num(raw.dynamicPricingIncome) },
    { key: "overstay", amount: num(raw.overstayIncome) },
    { key: "retail", amount: num(raw.retailParkingIncome) },
    { key: "staff", amount: num(raw.staffParkingIncome) },
    { key: "advertising", amount: num(raw.advertisingIncome) },
    { key: "premium", amount: num(raw.premiumParkingIncome) },
    { key: "otherIncome", amount: num(raw.otherMonthlyIncome) },
  ];
  const monthlyGrossRevenue =
    revenueBreakdown.reduce((s, x) => s + x.amount, 0) * mRev;

  // Investment
  const investmentBreakdown: BreakdownItem[] = [
    { key: "software", amount: num(raw.softwareCost) },
    { key: "dashboard", amount: num(raw.dashboardCost) },
    { key: "mobileApp", amount: num(raw.mobileAppCost) },
    { key: "cameras", amount: num(raw.cameraUnitCost) * num(raw.cameraCount) },
    { key: "gates", amount: num(raw.gateUnitCost) * num(raw.gateCount) },
    { key: "sensors", amount: num(raw.sensorUnitCost) * num(raw.sensorCount) },
    { key: "server", amount: num(raw.serverCost) },
    { key: "network", amount: num(raw.networkInstallCost) },
    { key: "electrical", amount: num(raw.electricalInstallCost) },
    { key: "paymentIntegration", amount: num(raw.paymentIntegrationCost) },
    { key: "training", amount: num(raw.trainingCost) },
    { key: "consultation", amount: num(raw.consultationCost) },
    { key: "otherInitial", amount: num(raw.otherInitialCost) },
  ];
  const totalInvestment = investmentBreakdown.reduce((s, x) => s + x.amount, 0);

  // Savings
  const savingsBreakdown: BreakdownItem[] = [
    { key: "staffCost", amount: num(raw.savingStaff) },
    { key: "ticketPrinting", amount: num(raw.savingTicketPrinting) },
    { key: "revenueLeakage", amount: num(raw.savingRevenueLeakage) },
    { key: "unauthorized", amount: num(raw.savingUnauthorized) },
    { key: "paymentErrors", amount: num(raw.savingPaymentErrors) },
    { key: "administration", amount: num(raw.savingAdministration) },
    { key: "securityMonitoring", amount: num(raw.savingSecurityMonitoring) },
    { key: "otherSaving", amount: num(raw.savingOther) },
  ];
  const monthlySavings = savingsBreakdown.reduce((s, x) => s + x.amount, 0) * mSav;

  // Expenses
  const expenseBreakdown: BreakdownItem[] = [
    { key: "cloudHosting", amount: num(raw.expCloudHosting) },
    { key: "databaseStorage", amount: num(raw.expDatabaseStorage) },
    { key: "aiOcr", amount: num(raw.expAiOcr) },
    { key: "internet", amount: num(raw.expInternet) },
    { key: "systemMaintenance", amount: num(raw.expSystemMaintenance) },
    { key: "hardwareMaintenance", amount: num(raw.expHardwareMaintenance) },
    { key: "paymentGateway", amount: num(raw.expPaymentGateway) },
    { key: "technicalSupport", amount: num(raw.expTechnicalSupport) },
    { key: "electricity", amount: num(raw.expElectricity) },
    { key: "softwareLicences", amount: num(raw.expSoftwareLicences) },
    { key: "otherExpense", amount: num(raw.expOther) },
  ];
  const monthlyExpenses = expenseBreakdown.reduce((s, x) => s + x.amount, 0) * mExp;

  const monthlyNetBenefit = monthlyGrossRevenue + monthlySavings - monthlyExpenses;
  const annualNetBenefit = monthlyNetBenefit * 12;

  // Payback — only when the monthly net benefit is strictly positive.
  const paybackMonths =
    monthlyNetBenefit > 0 && totalInvestment > 0
      ? totalInvestment / monthlyNetBenefit
      : monthlyNetBenefit > 0 && totalInvestment === 0
        ? 0
        : null;

  let breakEvenDate: Date | null = null;
  if (paybackMonths !== null && Number.isFinite(paybackMonths)) {
    const d = new Date();
    d.setMonth(d.getMonth() + Math.ceil(paybackMonths));
    breakEvenDate = d;
  }

  const roiFor = (years: number): number | null => {
    if (totalInvestment <= 0) return null;
    return ((annualNetBenefit * years - totalInvestment) / totalInvestment) * 100;
  };
  const roi1 = roiFor(1);
  const roi3 = roiFor(3);
  const roi5 = roiFor(5);
  const fiveYearProfit = annualNetBenefit * 5 - totalInvestment;

  // Status
  let status: FeasibilityStatus;
  if (monthlyNetBenefit <= 0) status = "notfeasible";
  else if (paybackMonths === null) status = "notfeasible";
  else if (paybackMonths <= thresholds.excellent) status = "excellent";
  else if (paybackMonths <= thresholds.good) status = "good";
  else if (paybackMonths <= thresholds.moderate) status = "moderate";
  else status = "longterm";

  // Monthly cumulative return over 60 months (investment recovery curve)
  const monthly = Array.from({ length: 61 }, (_, m) => ({
    month: m,
    cumulativeReturn: monthlyNetBenefit * m,
    investment: totalInvestment,
  }));

  // Yearly projection (5 years)
  const yearly = Array.from({ length: 5 }, (_, i) => {
    const year = i + 1;
    return {
      year,
      revenue: monthlyGrossRevenue * 12,
      expenses: monthlyExpenses * 12,
      savings: monthlySavings * 12,
      net: annualNetBenefit,
      cumulativeNet: annualNetBenefit * year - totalInvestment,
    };
  });

  return {
    currency: raw.currency || "LKR",
    avgOccupiedSpaces,
    dailyParkingRevenue,
    monthlyBaseParkingRevenue,
    monthlyGrossRevenue,
    totalInvestment,
    monthlySavings,
    monthlyExpenses,
    monthlyNetBenefit,
    paybackMonths,
    breakEvenDate,
    annualNetBenefit,
    roi1,
    roi3,
    roi5,
    fiveYearProfit,
    status,
    investmentBreakdown,
    revenueBreakdown,
    savingsBreakdown,
    expenseBreakdown,
    monthly,
    yearly,
  };
}

/* ------------------------------------------------------------------ *
 * Formatting helpers                                                  *
 * ------------------------------------------------------------------ */

export function formatCurrency(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const rounded = Math.round(n);
  const formatted = Math.abs(rounded)
    .toLocaleString("en-US")
    .replace(/,/g, ",");
  return `${rounded < 0 ? "-" : ""}${currency} ${formatted}`;
}

export function formatCompact(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${currency} ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${currency} ${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${currency} ${Math.round(abs)}`;
}

export function formatPercent(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return `${v >= 0 ? "" : ""}${v.toFixed(1)}%`;
}

export function formatMonths(m: number | null): string {
  if (m === null || !Number.isFinite(m)) return "—";
  const rounded = Math.round(m);
  return `${rounded}`;
}

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}
