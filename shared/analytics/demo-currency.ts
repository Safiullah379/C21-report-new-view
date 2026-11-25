import type { Fact } from "../types/analytics";
// Illustrative rates for fictional demo records only. Never a live FX policy.
export const demoCurrencyPerUsd = { USD: 1, CAD: 1.31, GBP: 0.79 } as const;
export const demoMoneyFields = [
  "sales",
  "adSpend",
  "adSales",
  "refunds",
  "cogs",
  "fees",
  "fulfillment",
  "storage",
  "promotions",
] as const;
export function convertDemoCurrency(
  row: Fact,
  currency: keyof typeof demoCurrencyPerUsd,
): Fact {
  const sourceRate =
    demoCurrencyPerUsd[row.currency as keyof typeof demoCurrencyPerUsd];
  if (!sourceRate) throw new Error("Unsupported demo source currency");
  const result: Fact = { ...row, currency };
  for (const key of demoMoneyFields) {
    const value = row[key];
    if (value === undefined) continue;
    result[key] =
      value === null
        ? null
        : Math.round((value / sourceRate) * demoCurrencyPerUsd[currency]);
  }
  return result;
}
