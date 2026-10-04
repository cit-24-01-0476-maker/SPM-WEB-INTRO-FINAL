// Economic Feasibility & ROI Calculator — export helpers (PDF + CSV).
//
// Both exports use ONLY calculated values passed in, so they always match the
// on-screen results. No demo or fabricated data.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LanguageCode } from "@/lib/cms/model";
import {
  formatCurrency,
  formatDate,
  formatMonths,
  formatPercent,
  type EFInputs,
  type EFResults,
} from "./calc";
import { breakdownLabel, roiT } from "./i18n";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------- CSV -------------------------------- */

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportProjectionCsv(results: EFResults): void {
  const cur = results.currency;
  const rows: Array<Array<string | number>> = [];
  rows.push(["SPM ECO System — Five-Year Projection"]);
  rows.push([`Currency: ${cur}`, `Generated: ${new Date().toISOString().slice(0, 10)}`]);
  rows.push([]);
  rows.push([
    "Year",
    "Annual Revenue",
    "Annual Expenses",
    "Annual Savings",
    "Annual Net Benefit",
    "Cumulative Net (after investment)",
  ]);
  results.yearly.forEach((y) => {
    rows.push([
      y.year,
      Math.round(y.revenue),
      Math.round(y.expenses),
      Math.round(y.savings),
      Math.round(y.net),
      Math.round(y.cumulativeNet),
    ]);
  });
  rows.push([]);
  rows.push(["Summary"]);
  rows.push(["Total Initial Investment", Math.round(results.totalInvestment)]);
  rows.push(["Monthly Gross Revenue", Math.round(results.monthlyGrossRevenue)]);
  rows.push(["Monthly Operating Cost", Math.round(results.monthlyExpenses)]);
  rows.push(["Monthly Automation Savings", Math.round(results.monthlySavings)]);
  rows.push(["Monthly Net Benefit", Math.round(results.monthlyNetBenefit)]);
  rows.push([
    "Payback (months)",
    results.paybackMonths === null ? "N/A" : Math.round(results.paybackMonths),
  ]);
  rows.push(["One-Year ROI (%)", results.roi1 === null ? "N/A" : results.roi1.toFixed(1)]);
  rows.push(["Five-Year ROI (%)", results.roi5 === null ? "N/A" : results.roi5.toFixed(1)]);
  rows.push(["Five-Year Net Profit", Math.round(results.fiveYearProfit)]);

  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
  triggerDownload(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    "spm-eco-roi-projection.csv",
  );
}

/* ------------------------------- PDF -------------------------------- */

const NAVY: [number, number, number] = [6, 24, 44];
const BLUE: [number, number, number] = [23, 107, 255];
const CYAN: [number, number, number] = [25, 198, 244];
const GREEN: [number, number, number] = [22, 166, 106];
const RED: [number, number, number] = [229, 72, 77];
const GREY: [number, number, number] = [94, 108, 126];

export function exportFeasibilityPdf(
  results: EFResults,
  inputs: EFInputs,
  lang: LanguageCode,
  disclaimer: string,
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  const cur = results.currency;
  let y = 0;

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SPM ECO System", M, 40);
  doc.setFontSize(13);
  doc.setTextColor(...CYAN);
  doc.text("Economic Feasibility & ROI Report", M, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 229, 239);
  doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, M, 78);
  y = 115;

  // Feasibility status banner
  const statusColor: [number, number, number] =
    results.status === "excellent" || results.status === "good"
      ? GREEN
      : results.status === "notfeasible"
        ? RED
        : BLUE;
  const statusLabel = roiT(lang, `status.${results.status}` as never);
  doc.setFillColor(...statusColor);
  doc.roundedRect(M, y, W - 2 * M, 46, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Feasibility: ${statusLabel}`, M + 14, y + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const recovery =
    results.paybackMonths === null
      ? roiT(lang, "status.notFeasibleBody")
      : `${roiT(lang, "misc.recoveryText")} ${formatMonths(results.paybackMonths)} ${roiT(lang, "res.months")}.`;
  doc.text(doc.splitTextToSize(recovery, W - 2 * M - 28), M + 14, y + 36);
  y += 66;

  // Key results table
  const kpis: Array<[string, string]> = [
    [roiT(lang, "res.totalInvestment"), formatCurrency(results.totalInvestment, cur)],
    [roiT(lang, "res.grossRevenue"), formatCurrency(results.monthlyGrossRevenue, cur)],
    [roiT(lang, "res.operatingCost"), formatCurrency(results.monthlyExpenses, cur)],
    [roiT(lang, "res.savings"), formatCurrency(results.monthlySavings, cur)],
    [roiT(lang, "res.netBenefit"), formatCurrency(results.monthlyNetBenefit, cur)],
    [
      roiT(lang, "res.payback"),
      results.paybackMonths === null
        ? "—"
        : `${formatMonths(results.paybackMonths)} ${roiT(lang, "res.months")}`,
    ],
    [roiT(lang, "res.breakEven"), formatDate(results.breakEvenDate)],
    [roiT(lang, "res.roi1"), formatPercent(results.roi1)],
    [roiT(lang, "res.roi3"), formatPercent(results.roi3)],
    [roiT(lang, "res.roi5"), formatPercent(results.roi5)],
    [roiT(lang, "res.fiveYearProfit"), formatCurrency(results.fiveYearProfit, cur)],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Result", "Value"]],
    body: kpis,
    theme: "grid",
    headStyles: { fillColor: BLUE, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    margin: { left: M, right: M },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  // Assumptions
  const assumptions: Array<[string, string]> = [
    [roiT(lang, "in.facilityType"), inputs.facilityType],
    [roiT(lang, "in.numberOfLocations"), String(inputs.numberOfLocations)],
    [roiT(lang, "in.totalSpaces"), String(inputs.totalSpaces)],
    [roiT(lang, "in.expectedOccupancy"), `${inputs.expectedOccupancy}%`],
    [roiT(lang, "in.avgDuration"), String(inputs.avgDuration)],
    [roiT(lang, "in.hourlyFee"), formatCurrency(inputs.hourlyFee, cur)],
    [roiT(lang, "in.operatingDays"), String(inputs.operatingDays)],
  ];
  autoTable(doc, {
    startY: y,
    head: [[roiT(lang, "misc.assumptions"), ""]],
    body: assumptions,
    theme: "striped",
    headStyles: { fillColor: NAVY, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: M, right: M },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  // Breakdowns as tables
  const bd = (title: string, items: { key: string; amount: number }[]) => {
    const body = items
      .filter((i) => i.amount > 0)
      .map((i) => [breakdownLabel(lang, i.key), formatCurrency(i.amount, cur)]);
    if (body.length === 0) return;
    if (y > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      y = 50;
    }
    autoTable(doc, {
      startY: y,
      head: [[title, ""]],
      body,
      theme: "grid",
      headStyles: { fillColor: CYAN, textColor: NAVY, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 4 },
      columnStyles: { 1: { halign: "right" } },
      margin: { left: M, right: M },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  };
  bd(roiT(lang, "group.investment"), results.investmentBreakdown);
  bd(roiT(lang, "chart.revenueBreakdown"), results.revenueBreakdown);
  bd(roiT(lang, "group.savings"), results.savingsBreakdown);
  bd(roiT(lang, "chart.expenseBreakdown"), results.expenseBreakdown);

  // Five-year projection table
  if (y > doc.internal.pageSize.getHeight() - 160) {
    doc.addPage();
    y = 50;
  }
  autoTable(doc, {
    startY: y,
    head: [["Year", "Revenue", "Expenses", "Savings", "Net", "Cumulative"]],
    body: results.yearly.map((yr) => [
      String(yr.year),
      formatCurrency(yr.revenue, cur),
      formatCurrency(yr.expenses, cur),
      formatCurrency(yr.savings, cur),
      formatCurrency(yr.net, cur),
      formatCurrency(yr.cumulativeNet, cur),
    ]),
    theme: "grid",
    headStyles: { fillColor: BLUE, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 4 },
    margin: { left: M, right: M },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;

  // Native mini cumulative-return chart (real values)
  if (y > doc.internal.pageSize.getHeight() - 170) {
    doc.addPage();
    y = 50;
  }
  drawCumulativeChart(doc, results, M, y, W - 2 * M, 130, lang);
  y += 150;

  // Disclaimer
  if (y > doc.internal.pageSize.getHeight() - 70) {
    doc.addPage();
    y = 50;
  }
  doc.setDrawColor(...GREY);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(doc.splitTextToSize(disclaimer, W - 2 * M), M, y);

  doc.save("spm-eco-feasibility-report.pdf");
}

function drawCumulativeChart(
  doc: jsPDF,
  results: EFResults,
  x: number,
  y: number,
  w: number,
  h: number,
  lang: LanguageCode,
): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(roiT(lang, "chart.investmentVsReturn"), x, y - 4);

  const points = results.monthly; // 0..60
  const maxVal = Math.max(
    results.totalInvestment,
    points[points.length - 1]?.cumulativeReturn ?? 0,
    1,
  );
  const plotX = x + 4;
  const plotY = y + 6;
  const plotW = w - 8;
  const plotH = h - 20;

  // Axes
  doc.setDrawColor(200, 210, 222);
  doc.setLineWidth(0.5);
  doc.line(plotX, plotY, plotX, plotY + plotH);
  doc.line(plotX, plotY + plotH, plotX + plotW, plotY + plotH);

  const sx = (m: number) => plotX + (m / 60) * plotW;
  const sy = (v: number) => plotY + plotH - (v / maxVal) * plotH;

  // Investment line (flat)
  doc.setDrawColor(...RED);
  doc.setLineWidth(1);
  doc.line(plotX, sy(results.totalInvestment), plotX + plotW, sy(results.totalInvestment));

  // Cumulative return line
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1.4);
  for (let i = 1; i < points.length; i++) {
    doc.line(
      sx(points[i - 1].month),
      sy(points[i - 1].cumulativeReturn),
      sx(points[i].month),
      sy(points[i].cumulativeReturn),
    );
  }

  // Break-even marker
  if (results.paybackMonths !== null && results.paybackMonths <= 60) {
    const bx = sx(results.paybackMonths);
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.8);
    doc.line(bx, plotY, bx, plotY + plotH);
    doc.setTextColor(...GREEN);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${roiT(lang, "chart.recoveredAt")} ${formatMonths(results.paybackMonths)}`,
      Math.min(bx + 3, plotX + plotW - 90),
      plotY + 10,
    );
  }

  // Legend
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BLUE);
  doc.text(`— ${roiT(lang, "chart.cumulativeReturn")}`, plotX, plotY + plotH + 12);
  doc.setTextColor(...RED);
  doc.text(`— ${roiT(lang, "chart.investment")}`, plotX + 140, plotY + plotH + 12);
}
