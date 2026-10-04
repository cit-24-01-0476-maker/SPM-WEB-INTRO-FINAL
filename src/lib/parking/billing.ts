import type { ParkingSession, Pricing } from "./types";
export const DEFAULT_PRICING: Pricing = { firstHour: 100, additionalHour: 80 };
export const DEFAULT_COMMISSION = 0.1;
export const money = (amount: number) =>
  `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function calculateDuration(session: ParkingSession, now = Date.now()) {
  return Math.max(
    0,
    ((session.endedAt ?? now) - session.startedAt) / 60000 + session.simulatedMinutes,
  );
}
export function calculateParkingCharge(minutes: number, pricing: Pricing): number {
  return (
    Math.round(
      (pricing.firstHour + Math.max(0, Math.ceil(minutes / 60) - 1) * pricing.additionalHour) * 100,
    ) / 100
  );
}
export function calculateOutstandingAmount(total: number, paid: number) {
  return Math.max(0, Math.round((total - paid) * 100) / 100);
}
export function calculatePlatformCommission(charge: number, rate = DEFAULT_COMMISSION) {
  return Math.round(charge * rate * 100) / 100;
}
export function calculateProviderRevenue(charge: number, rate = DEFAULT_COMMISSION) {
  return Math.round((charge - calculatePlatformCommission(charge, rate)) * 100) / 100;
}
