import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LanguageCode } from "@/lib/cms/model";
import {
  formatCompact,
  formatCurrency,
  type EFResults,
} from "@/lib/roi/calc";
import { breakdownLabel, roiT } from "@/lib/roi/i18n";

const PIE_COLORS = [
  "#176bff",
  "#19c6f4",
  "#16a66a",
  "#f5a524",
  "#e5484d",
  "#6d5efc",
  "#0aa6c2",
  "#2ee6c8",
  "#3aa0e8",
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export interface ScenarioRow {
  name: string;
  revenue: number;
  expenses: number;
  net: number;
}

export function RoiCharts({
  results,
  lang,
  scenarioRows,
}: {
  results: EFResults;
  lang: LanguageCode;
  scenarioRows: ScenarioRow[];
}) {
  const cur = results.currency;

  const cumulativeData = useMemo(
    () =>
      results.monthly.map((m) => ({
        month: m.month,
        return: Math.round(m.cumulativeReturn),
        investment: Math.round(m.investment),
      })),
    [results.monthly],
  );

  const revVsCost = useMemo(
    () => [
      {
        name: roiT(lang, "chart.month"),
        revenue: Math.round(results.monthlyGrossRevenue),
        cost: Math.round(results.monthlyExpenses),
        net: Math.round(results.monthlyNetBenefit),
      },
    ],
    [results, lang],
  );

  const cashFlow = useMemo(
    () =>
      results.yearly.map((y) => ({
        name: `${roiT(lang, "chart.year")} ${y.year}`,
        net: Math.round(y.net),
        cumulative: Math.round(y.cumulativeNet),
      })),
    [results.yearly, lang],
  );

  const revenuePie = useMemo(
    () =>
      results.revenueBreakdown
        .filter((b) => b.amount > 0)
        .map((b) => ({ name: breakdownLabel(lang, b.key), value: Math.round(b.amount) })),
    [results.revenueBreakdown, lang],
  );

  const expensePie = useMemo(
    () =>
      results.expenseBreakdown
        .filter((b) => b.amount > 0)
        .map((b) => ({ name: breakdownLabel(lang, b.key), value: Math.round(b.amount) })),
    [results.expenseBreakdown, lang],
  );

  const tip = (value: number) => formatCurrency(value, cur);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Investment vs cumulative return */}
      <div className="md:col-span-2">
        <ChartCard title={roiT(lang, "chart.investmentVsReturn")}>
          <ResponsiveContainer>
            <ComposedChart data={cumulativeData} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                label={{ value: roiT(lang, "chart.month"), position: "insideBottom", offset: -2, fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v, cur)} width={64} />
              <Tooltip formatter={(v: number) => tip(v)} labelFormatter={(l) => `${roiT(lang, "chart.month")} ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="return"
                name={roiT(lang, "chart.cumulativeReturn")}
                stroke="#176bff"
                fill="#176bff33"
              />
              <Line
                type="monotone"
                dataKey="investment"
                name={roiT(lang, "chart.investment")}
                stroke="#e5484d"
                strokeDasharray="6 4"
                dot={false}
              />
              {results.paybackMonths !== null && results.paybackMonths <= 60 ? (
                <ReferenceLine
                  x={Math.round(results.paybackMonths)}
                  stroke="#16a66a"
                  strokeWidth={2}
                  label={{ value: roiT(lang, "chart.recoveredAt"), fontSize: 10, fill: "#16a66a", position: "top" }}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly revenue vs cost */}
      <ChartCard title={roiT(lang, "chart.revenueVsCost")}>
        <ResponsiveContainer>
          <BarChart data={revVsCost} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v, cur)} width={64} />
            <Tooltip formatter={(v: number) => tip(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name={roiT(lang, "chart.revenue")} fill="#176bff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost" name={roiT(lang, "chart.cost")} fill="#e5484d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="net" name={roiT(lang, "chart.net")} fill="#16a66a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Five-year cash flow */}
      <ChartCard title={roiT(lang, "chart.cashFlow")}>
        <ResponsiveContainer>
          <AreaChart data={cashFlow} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v, cur)} width={64} />
            <Tooltip formatter={(v: number) => tip(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <Area type="monotone" dataKey="net" name={roiT(lang, "chart.net")} stroke="#19c6f4" fill="#19c6f433" />
            <Area
              type="monotone"
              dataKey="cumulative"
              name={roiT(lang, "chart.cumulativeReturn")}
              stroke="#176bff"
              fill="#176bff33"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Revenue breakdown */}
      {revenuePie.length > 0 ? (
        <ChartCard title={roiT(lang, "chart.revenueBreakdown")}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={revenuePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                {revenuePie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => tip(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}

      {/* Expense breakdown */}
      {expensePie.length > 0 ? (
        <ChartCard title={roiT(lang, "chart.expenseBreakdown")}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                {expensePie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => tip(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}

      {/* Scenario comparison */}
      <div className="md:col-span-2">
        <ChartCard title={roiT(lang, "chart.scenarioComparison")}>
          <ResponsiveContainer>
            <BarChart data={scenarioRows} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v, cur)} width={64} />
              <Tooltip formatter={(v: number) => tip(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name={roiT(lang, "chart.revenue")} fill="#176bff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name={roiT(lang, "chart.cost")} fill="#e5484d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name={roiT(lang, "chart.net")} fill="#16a66a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
