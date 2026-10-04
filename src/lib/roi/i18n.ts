// Economic Feasibility & ROI Calculator — bilingual string dictionary.
//
// This is a feature-scoped label map (NOT a second language provider). The
// public page reads the active language from the existing LanguageProvider
// (useLanguage().lang) and resolves labels through `roiT(lang, key)`.
// English is always the fallback.

import type { LanguageCode } from "@/lib/cms/model";

type Entry = { en: string; si: string };

export const ROI_STRINGS = {
  // Page + section headings
  "page.title": {
    en: "Economic Feasibility & ROI Calculator",
    si: "ආර්ථික ශක්‍යතා සහ ආයෝජන ප්‍රතිලාභ ගණකය",
  },
  "page.subtitle": {
    en: "Estimate how quickly the SPM ECO System pays back your investment from parking revenue and automation savings.",
    si: "රථගාල ආදායම සහ ස්වයංක්‍රීයකරණ ඉතිරිකිරීම් මගින් SPM ECO පද්ධතිය ඔබගේ ආයෝජනය කෙතරම් ඉක්මනින් නැවත ලබාදෙයිද යන්න ඇස්තමේන්තු කරන්න.",
  },
  "nav.roiCalculator": { en: "ROI Calculator", si: "ආයෝජන ප්‍රතිලාභ ගණකය" },

  // Groups
  "group.facility": { en: "Facility Information", si: "පහසුකම් තොරතුරු" },
  "group.investment": { en: "Initial Investment", si: "ආරම්භක ආයෝජනය" },
  "group.income": { en: "Monthly Income", si: "මාසික ආදායම" },
  "group.savings": { en: "Monthly Automation Savings", si: "මාසික ස්වයංක්‍රීයකරණ ඉතිරිකිරීම්" },
  "group.expenses": { en: "Monthly Operating Expenses", si: "මාසික මෙහෙයුම් වියදම්" },

  // Facility inputs
  "in.facilityType": { en: "Facility Type", si: "පහසුකම් වර්ගය" },
  "in.numberOfLocations": { en: "Number of Locations", si: "ස්ථාන ගණන" },
  "in.totalSpaces": { en: "Total Parking Spaces", si: "මුළු රථගාල ඉඩ ගණන" },
  "in.operatingDays": { en: "Operating Days / Month", si: "මාසයකට මෙහෙයුම් දින" },
  "in.currentOccupancy": { en: "Current Occupancy (%)", si: "වර්තමාන පරිහරණය (%)" },
  "in.expectedOccupancy": {
    en: "Expected Occupancy After System (%)",
    si: "පද්ධතියෙන් පසු අපේක්ෂිත පරිහරණය (%)",
  },
  "in.avgDuration": { en: "Average Parking Duration (hours)", si: "සාමාන්‍ය රථගාල කාලය (පැය)" },
  "in.hourlyFee": { en: "Average Hourly Parking Fee", si: "සාමාන්‍ය පැය රථගාල ගාස්තුව" },
  "in.currency": { en: "Currency", si: "මුදල් ඒකකය" },

  // Investment inputs
  "in.softwareCost": { en: "Software Implementation", si: "මෘදුකාංග ක්‍රියාත්මක කිරීම" },
  "in.dashboardCost": { en: "Dashboard Implementation", si: "උපකරණ පුවරුව ක්‍රියාත්මක කිරීම" },
  "in.mobileAppCost": { en: "Mobile App Integration", si: "ජංගම යෙදුම් ඒකාබද්ධ කිරීම" },
  "in.cameraUnitCost": { en: "ANPR Camera Unit Cost", si: "ANPR කැමරා ඒකක පිරිවැය" },
  "in.cameraCount": { en: "Number of ANPR Cameras", si: "ANPR කැමරා ගණන" },
  "in.gateUnitCost": { en: "Barrier Gate Unit Cost", si: "බාධක ගේට්ටු ඒකක පිරිවැය" },
  "in.gateCount": { en: "Number of Barrier Gates", si: "බාධක ගේට්ටු ගණන" },
  "in.sensorUnitCost": {
    en: "Legacy integration unit cost (excluded)",
    si: "පැරණි ඒකාබද්ධ කිරීමේ පිරිවැය (ඉවත් කර ඇත)",
  },
  "in.sensorCount": {
    en: "Legacy integration count (excluded)",
    si: "පැරණි ඒකාබද්ධ කිරීමේ ගණන (ඉවත් කර ඇත)",
  },
  "in.serverCost": { en: "Server / Hosting", si: "සේවාදායකය / සත්කාරක සේවාව" },
  "in.networkInstallCost": { en: "Network Installation", si: "ජාල ස්ථාපනය" },
  "in.electricalInstallCost": { en: "Electrical Installation", si: "විදුලි ස්ථාපනය" },
  "in.paymentIntegrationCost": {
    en: "Payment System Integration",
    si: "ගෙවීම් පද්ධති ඒකාබද්ධ කිරීම",
  },
  "in.trainingCost": { en: "Staff Training", si: "කාර්ය මණ්ඩල පුහුණුව" },
  "in.consultationCost": { en: "Consultation", si: "උපදේශනය" },
  "in.otherInitialCost": { en: "Other Initial Costs", si: "වෙනත් ආරම්භක පිරිවැය" },

  // Income inputs
  "in.reservationIncome": { en: "Reservation-Service Income", si: "වෙන්කිරීම් සේවා ආදායම" },
  "in.dynamicPricingIncome": { en: "Dynamic-Pricing Income", si: "ගතික මිලකරණ ආදායම" },
  "in.overstayIncome": { en: "Overstay Income", si: "අධික නැවතුම් ආදායම" },
  "in.retailParkingIncome": { en: "Retail Parking Income", si: "සිල්ලර රථගාල ආදායම" },
  "in.staffParkingIncome": { en: "Staff Parking Income", si: "කාර්ය මණ්ඩල රථගාල ආදායම" },
  "in.advertisingIncome": { en: "Advertising Income", si: "වෙළඳ දැන්වීම් ආදායම" },
  "in.premiumParkingIncome": { en: "Premium Parking Income", si: "වාරික රථගාල ආදායම" },
  "in.otherMonthlyIncome": { en: "Other Monthly Income", si: "වෙනත් මාසික ආදායම" },

  // Savings inputs
  "in.savingStaff": { en: "Reduced Staff Cost", si: "අඩු කළ කාර්ය මණ්ඩල පිරිවැය" },
  "in.savingTicketPrinting": {
    en: "Reduced Ticket-Printing Cost",
    si: "අඩු කළ ටිකට් මුද්‍රණ පිරිවැය",
  },
  "in.savingRevenueLeakage": { en: "Reduced Revenue Leakage", si: "අඩු කළ ආදායම් කාන්දුව" },
  "in.savingUnauthorized": {
    en: "Reduced Unauthorized Parking Loss",
    si: "අඩු කළ අනවසර රථගාල අලාභය",
  },
  "in.savingPaymentErrors": { en: "Reduced Payment Errors", si: "අඩු කළ ගෙවීම් දෝෂ" },
  "in.savingAdministration": { en: "Reduced Administration Cost", si: "අඩු කළ පරිපාලන පිරිවැය" },
  "in.savingSecurityMonitoring": {
    en: "Reduced Security Monitoring Cost",
    si: "අඩු කළ ආරක්ෂක අධීක්ෂණ පිරිවැය",
  },
  "in.savingOther": { en: "Other Monthly Savings", si: "වෙනත් මාසික ඉතිරිකිරීම්" },

  // Expense inputs
  "in.expCloudHosting": { en: "Cloud Hosting", si: "වලාකුළු සත්කාරකත්වය" },
  "in.expDatabaseStorage": { en: "Database & Storage", si: "දත්ත සමුදාය සහ ගබඩාව" },
  "in.expAiOcr": { en: "AI & OCR Processing", si: "AI සහ OCR සැකසුම්" },
  "in.expInternet": { en: "Internet & Network", si: "අන්තර්ජාලය සහ ජාලය" },
  "in.expSystemMaintenance": { en: "System Maintenance", si: "පද්ධති නඩත්තුව" },
  "in.expHardwareMaintenance": { en: "Hardware Maintenance", si: "දෘඪාංග නඩත්තුව" },
  "in.expPaymentGateway": { en: "Payment Gateway Fees", si: "ගෙවීම් ද්වාර ගාස්තු" },
  "in.expTechnicalSupport": { en: "Technical Support", si: "තාක්ෂණික සහාය" },
  "in.expElectricity": { en: "Electricity", si: "විදුලිය" },
  "in.expSoftwareLicences": { en: "Software Licences", si: "මෘදුකාංග බලපත්‍ර" },
  "in.expOther": { en: "Other Monthly Expenses", si: "වෙනත් මාසික වියදම්" },

  // Result cards
  "res.totalInvestment": { en: "Total Initial Investment", si: "මුළු ආරම්භක ආයෝජනය" },
  "res.grossRevenue": { en: "Monthly Gross Revenue", si: "මාසික දළ ආදායම" },
  "res.operatingCost": { en: "Monthly Operating Cost", si: "මාසික මෙහෙයුම් පිරිවැය" },
  "res.savings": { en: "Monthly Automation Savings", si: "මාසික ස්වයංක්‍රීයකරණ ඉතිරිකිරීම්" },
  "res.netBenefit": { en: "Monthly Net Financial Benefit", si: "මාසික ශුද්ධ මූල්‍ය ප්‍රතිලාභය" },
  "res.payback": { en: "Payback Period", si: "ආයෝජනය නැවත ලැබෙන කාලය" },
  "res.breakEven": { en: "Estimated Break-Even Date", si: "ඇස්තමේන්තුගත සම-ලාභ දිනය" },
  "res.roi1": { en: "One-Year ROI", si: "වර්ෂ 1 ROI" },
  "res.roi3": { en: "Three-Year ROI", si: "වර්ෂ 3 ROI" },
  "res.roi5": { en: "Five-Year ROI", si: "වර්ෂ 5 ROI" },
  "res.fiveYearProfit": { en: "Five-Year Net Profit", si: "වර්ෂ 5 ශුද්ධ ලාභය" },
  "res.months": { en: "months", si: "මාස" },

  // Status
  "status.excellent": { en: "Excellent", si: "විශිෂ්ට" },
  "status.good": { en: "Good", si: "හොඳයි" },
  "status.moderate": { en: "Moderate", si: "මධ්‍යස්ථ" },
  "status.longterm": { en: "Long-Term", si: "දිගු කාලීන" },
  "status.notfeasible": { en: "Not Feasible", si: "ශක්‍ය නොවේ" },
  "status.notFeasibleBody": {
    en: "This scenario does not currently generate enough financial benefit to recover the investment.",
    si: "මෙම තත්ත්වය අනුව ආයෝජනය නැවත ලබාගැනීමට ප්‍රමාණවත් මූල්‍ය ප්‍රතිලාභයක් දැනට නොලැබේ.",
  },

  // Charts
  "chart.investmentVsReturn": {
    en: "Investment vs Cumulative Return",
    si: "ආයෝජනය එදිරිව සමුච්චිත ප්‍රතිලාභය",
  },
  "chart.revenueVsCost": {
    en: "Monthly Revenue vs Operating Cost",
    si: "මාසික ආදායම එදිරිව මෙහෙයුම් පිරිවැය",
  },
  "chart.cashFlow": { en: "Five-Year Cash-Flow Projection", si: "වර්ෂ 5 මුදල් ගලනය පුරෝකථනය" },
  "chart.revenueBreakdown": { en: "Revenue Breakdown", si: "ආදායම් විස්තරය" },
  "chart.expenseBreakdown": { en: "Expense Breakdown", si: "වියදම් විස්තරය" },
  "chart.scenarioComparison": { en: "Scenario Comparison", si: "තත්ත්ව සැසඳීම" },
  "chart.breakEvenTimeline": { en: "Break-Even Timeline", si: "සම-ලාභ කාල රේඛාව" },
  "chart.cumulativeReturn": { en: "Cumulative Return", si: "සමුච්චිත ප්‍රතිලාභය" },
  "chart.investment": { en: "Investment", si: "ආයෝජනය" },
  "chart.revenue": { en: "Revenue", si: "ආදායම" },
  "chart.cost": { en: "Cost", si: "පිරිවැය" },
  "chart.net": { en: "Net Benefit", si: "ශුද්ධ ප්‍රතිලාභය" },
  "chart.month": { en: "Month", si: "මාසය" },
  "chart.year": { en: "Year", si: "වර්ෂය" },
  "chart.recoveredAt": { en: "Investment recovered", si: "ආයෝජනය නැවත ලැබේ" },

  // Scenarios
  "scenario.title": { en: "Scenario Comparison", si: "තත්ත්ව සැසඳීම" },
  "scenario.conservative": { en: "Conservative", si: "ගතානුගතික" },
  "scenario.expected": { en: "Expected", si: "අපේක්ෂිත" },
  "scenario.optimistic": { en: "Optimistic", si: "සුභවාදී" },
  "scenario.assumptions": { en: "Assumptions", si: "උපකල්පන" },
  "scenario.revenueX": { en: "Revenue ×", si: "ආදායම ×" },
  "scenario.expensesX": { en: "Expenses ×", si: "වියදම් ×" },
  "scenario.savingsX": { en: "Savings ×", si: "ඉතිරිකිරීම් ×" },

  // Sensitivity
  "sens.title": { en: "Sensitivity Analysis", si: "සංවේදිතා විශ්ලේෂණය" },
  "sens.subtitle": {
    en: "Adjust key factors to see how the recovery period responds.",
    si: "නැවත ලැබෙන කාලය ප්‍රතිචාර දක්වන ආකාරය බැලීමට ප්‍රධාන සාධක සකසන්න.",
  },
  "sens.occupancy": { en: "Occupancy (%)", si: "පරිහරණය (%)" },
  "sens.hourlyFee": { en: "Hourly Parking Fee", si: "පැය රථගාල ගාස්තුව" },
  "sens.duration": { en: "Average Duration (hours)", si: "සාමාන්‍ය කාලය (පැය)" },
  "sens.operatingCost": { en: "Operating Cost ×", si: "මෙහෙයුම් පිරිවැය ×" },
  "sens.investment": { en: "Initial Investment ×", si: "ආරම්භක ආයෝජනය ×" },
  "sens.savings": { en: "Automation Savings ×", si: "ස්වයංක්‍රීයකරණ ඉතිරිකිරීම් ×" },
  "sens.biggestImpact": { en: "Greatest impact on payback", si: "නැවත ලැබීමට විශාලතම බලපෑම" },
  "sens.reset": { en: "Reset sliders", si: "ස්ලයිඩර යළි සකසන්න" },

  // Actions
  "action.downloadPdf": {
    en: "Download Feasibility Report (PDF)",
    si: "ශක්‍යතා වාර්තාව බාගන්න (PDF)",
  },
  "action.downloadCsv": {
    en: "Download 5-Year Projection (CSV)",
    si: "වර්ෂ 5 පුරෝකථනය බාගන්න (CSV)",
  },
  "action.requestStudy": {
    en: "Request a Detailed Feasibility Study",
    si: "විස්තරාත්මක ශක්‍යතා අධ්‍යයනයක් ඉල්ලන්න",
  },
  "action.reset": { en: "Reset to defaults", si: "පෙරනිමියට යළි සකසන්න" },
  "action.close": { en: "Close", si: "වසන්න" },

  // Lead form
  "lead.title": {
    en: "Request a Detailed Feasibility Study",
    si: "විස්තරාත්මක ශක්‍යතා අධ්‍යයනයක් ඉල්ලන්න",
  },
  "lead.name": { en: "Full Name", si: "සම්පූර්ණ නම" },
  "lead.organization": { en: "Organization", si: "ආයතනය" },
  "lead.email": { en: "Email", si: "විද්‍යුත් තැපෑල" },
  "lead.phone": { en: "Phone", si: "දුරකථනය" },
  "lead.notes": { en: "Notes", si: "සටහන්" },
  "lead.submit": { en: "Send Request", si: "ඉල්ලීම යවන්න" },
  "lead.sending": { en: "Sending…", si: "යවමින්…" },
  "lead.success": {
    en: "Request sent — our team will contact you shortly.",
    si: "ඉල්ලීම යවන ලදී — අපගේ කණ්ඩායම ඉක්මනින් සම්බන්ධ වනු ඇත.",
  },
  "lead.error": {
    en: "Could not send request. Please try again.",
    si: "ඉල්ලීම යැවිය නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.",
  },
  "lead.summaryNote": {
    en: "Your calculation summary will be attached automatically.",
    si: "ඔබගේ ගණනය කිරීමේ සාරාංශය ස්වයංක්‍රීයව අමුණනු ඇත.",
  },

  // Validation
  "val.spaces": {
    en: "Total parking spaces must be greater than zero.",
    si: "මුළු රථගාල ඉඩ ශුන්‍යයට වඩා වැඩි විය යුතුය.",
  },
  "val.occupancy": {
    en: "Occupancy must be between 0 and 100.",
    si: "පරිහරණය 0 සහ 100 අතර විය යුතුය.",
  },
  "val.operatingDays": {
    en: "Operating days must be between 1 and 31.",
    si: "මෙහෙයුම් දින 1 සහ 31 අතර විය යුතුය.",
  },
  "val.duration": {
    en: "Average duration must be greater than zero.",
    si: "සාමාන්‍ය කාලය ශුන්‍යයට වඩා වැඩි විය යුතුය.",
  },
  "val.negative": { en: "Value must not be negative.", si: "අගය සෘණ නොවිය යුතුය." },
  "val.locations": {
    en: "Number of locations must be at least 1.",
    si: "ස්ථාන ගණන අවම වශයෙන් 1 විය යුතුය.",
  },
  "val.name": { en: "Please enter your name.", si: "කරුණාකර ඔබගේ නම ඇතුළත් කරන්න." },
  "val.email": {
    en: "Please enter a valid email.",
    si: "කරුණාකර වලංගු විද්‍යුත් තැපෑලක් ඇතුළත් කරන්න.",
  },

  // Misc
  "misc.estimateNote": {
    en: "Results are estimates based on the values you enter. Actual outcomes vary by facility, pricing, and usage.",
    si: "ප්‍රතිඵල ඔබ ඇතුළත් කරන අගයන් මත පදනම් ඇස්තමේන්තු වේ. සැබෑ ප්‍රතිඵල පහසුකම, මිලකරණය සහ භාවිතය අනුව වෙනස් වේ.",
  },
  "misc.results": { en: "Live Results", si: "සජීවී ප්‍රතිඵල" },
  "misc.assumptions": { en: "Your Assumptions", si: "ඔබගේ උපකල්පන" },
  "misc.recoveryText": {
    en: "Based on the entered assumptions, the estimated investment recovery period is approximately",
    si: "ඇතුළත් කළ අගයන් අනුව, ආයෝජනය නැවත ලබාගැනීමට ඇස්තමේන්තුගත කාලය ආසන්න වශයෙන්",
  },
  "misc.disabled": {
    en: "The ROI calculator is currently unavailable. Please check back soon.",
    si: "ආයෝජන ප්‍රතිලාභ ගණකය දැනට නොමැත. කරුණාකර පසුව නැවත පරීක්ෂා කරන්න.",
  },
} as const;

export type RoiStringKey = keyof typeof ROI_STRINGS;

export function roiT(lang: LanguageCode, key: RoiStringKey): string {
  const entry = ROI_STRINGS[key] as Entry | undefined;
  if (!entry) return key;
  if (lang === "si" && entry.si.trim() !== "") return entry.si;
  return entry.en;
}

/* Breakdown item label lookup (keys emitted by computeResults). */
const BREAKDOWN_LABELS: Record<string, Entry> = {
  baseParking: { en: "Base Parking", si: "මූලික රථගාලය" },
  reservation: { en: "Reservation", si: "වෙන්කිරීම්" },
  dynamicPricing: { en: "Dynamic Pricing", si: "ගතික මිලකරණය" },
  overstay: { en: "Overstay", si: "අධික නැවතුම්" },
  retail: { en: "Retail", si: "සිල්ලර" },
  staff: { en: "Staff", si: "කාර්ය මණ්ඩල" },
  advertising: { en: "Advertising", si: "වෙළඳ දැන්වීම්" },
  premium: { en: "Premium", si: "වාරික" },
  otherIncome: { en: "Other Income", si: "වෙනත් ආදායම" },

  software: { en: "Software", si: "මෘදුකාංග" },
  dashboard: { en: "Dashboard", si: "උපකරණ පුවරුව" },
  mobileApp: { en: "Mobile App", si: "ජංගම යෙදුම" },
  cameras: { en: "ANPR Cameras", si: "ANPR කැමරා" },
  gates: { en: "Barrier Gates", si: "බාධක ගේට්ටු" },
  server: { en: "Server / Edge", si: "සේවාදායකය / එජ්" },
  network: { en: "Network", si: "ජාලය" },
  electrical: { en: "Electrical", si: "විදුලි" },
  paymentIntegration: { en: "Payment Integration", si: "ගෙවීම් ඒකාබද්ධ කිරීම" },
  training: { en: "Training", si: "පුහුණුව" },
  consultation: { en: "Consultation", si: "උපදේශනය" },
  otherInitial: { en: "Other", si: "වෙනත්" },

  staffCost: { en: "Staff Cost", si: "කාර්ය මණ්ඩල පිරිවැය" },
  ticketPrinting: { en: "Ticket Printing", si: "ටිකට් මුද්‍රණය" },
  revenueLeakage: { en: "Revenue Leakage", si: "ආදායම් කාන්දුව" },
  unauthorized: { en: "Unauthorized Loss", si: "අනවසර අලාභය" },
  paymentErrors: { en: "Payment Errors", si: "ගෙවීම් දෝෂ" },
  administration: { en: "Administration", si: "පරිපාලනය" },
  securityMonitoring: { en: "Security Monitoring", si: "ආරක්ෂක අධීක්ෂණය" },
  otherSaving: { en: "Other Savings", si: "වෙනත් ඉතිරිකිරීම්" },

  cloudHosting: { en: "Cloud Hosting", si: "වලාකුළු සත්කාරකත්වය" },
  databaseStorage: { en: "Database & Storage", si: "දත්ත සමුදාය සහ ගබඩාව" },
  aiOcr: { en: "AI & OCR", si: "AI සහ OCR" },
  internet: { en: "Internet", si: "අන්තර්ජාලය" },
  systemMaintenance: { en: "System Maintenance", si: "පද්ධති නඩත්තුව" },
  hardwareMaintenance: { en: "Hardware Maintenance", si: "දෘඪාංග නඩත්තුව" },
  paymentGateway: { en: "Payment Gateway", si: "ගෙවීම් ද්වාරය" },
  technicalSupport: { en: "Technical Support", si: "තාක්ෂණික සහාය" },
  electricity: { en: "Electricity", si: "විදුලිය" },
  softwareLicences: { en: "Software Licences", si: "මෘදුකාංග බලපත්‍ර" },
  otherExpense: { en: "Other Expenses", si: "වෙනත් වියදම්" },
};

export function breakdownLabel(lang: LanguageCode, key: string): string {
  const entry = BREAKDOWN_LABELS[key];
  if (!entry) return key;
  return lang === "si" && entry.si.trim() !== "" ? entry.si : entry.en;
}
