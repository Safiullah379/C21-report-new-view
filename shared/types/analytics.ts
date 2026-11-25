import { z } from "zod";
export const additiveIds = [
  "sales",
  "adSpend",
  "units",
  "orders",
  "adSales",
  "refunds",
  "cogs",
  "fees",
  "fulfillment",
  "storage",
  "promotions",
  "sessions",
  "pageViews",
  "impressions",
  "clicks",
  "adOrders",
  "returnedUnits",
] as const;
export const metricIds = [
  ...additiveIds,
  "netSales",
  "organicSales",
  "grossProfit",
  "netProfit",
  "margin",
  "grossMargin",
  "roi",
  "acos",
  "tacos",
  "roas",
  "conversion",
  "ctr",
  "cpc",
  "adConversion",
  "aov",
  "asp",
  "refundRate",
  "operatingCosts",
] as const;
export type MetricId = (typeof metricIds)[number];
export const filtersSchema = z
  .object({
    start: z.iso.date(),
    end: z.iso.date(),
    products: z.array(z.string().max(100)).max(100).default([]),
    marketplaces: z
      .array(z.enum(["US", "CA", "UK"]))
      .max(3)
      .default([]),
    channels: z
      .array(z.enum(["amazon", "shopify"]))
      .max(2)
      .default([]),
    currency: z.enum(["USD", "CAD", "GBP"]).default("USD"),
    brand: z.string().max(80).default(""),
    granularity: z
      .enum(["daily", "weekly", "monthly", "quarterly", "yearly"])
      .default("daily"),
    calendar: z.enum(["iso", "sunday", "january", "fiscal"]).default("iso"),
    fiscalMonth: z.number().int().min(1).max(12).default(4),
    breakdown: z
      .enum(["segment", "marketplace", "channel", "product", "brand", "total"])
      .default("segment"),
    comparison: z
      .enum([
        "previous",
        "week",
        "month",
        "quarter",
        "year",
        "weekdays",
        "custom",
        "none",
      ])
      .default("previous"),
    compareStart: z.iso.date().optional(),
    compareEnd: z.iso.date().optional(),
  })
  .refine((f) => f.start <= f.end, "Start must precede end")
  .refine(
    (f) => (Date.parse(f.end) - Date.parse(f.start)) / 86400000 <= 1095,
    "Maximum range is 1096 days",
  )
  .refine(
    (f) =>
      f.comparison !== "custom" ||
      !!(
        f.compareStart &&
        f.compareEnd &&
        f.compareStart <= f.compareEnd &&
        Date.parse(f.compareEnd) - Date.parse(f.compareStart) <= 1095 * 86400000
      ),
    "Choose a valid comparison range (up to 1096 days)",
  );
export type Filters = z.infer<typeof filtersSchema>;
export interface Product {
  id: string;
  title: string;
  sku: string;
  asin: string;
  parentId: string | null;
  brand: string;
  variation: string;
  marketplaces: string[];
  price?: number;
  cost?: number;
  icon?: string;
  color?: string;
}
export interface Fact {
  date: string;
  productId: string;
  marketplace: string;
  channel: string;
  currency: string;
  sales: number | null;
  adSpend: number | null;
  adSales: number | null;
  units: number | null;
  orders: number | null;
  refunds?: number | null;
  cogs?: number | null;
  fees?: number | null;
  fulfillment?: number | null;
  storage?: number | null;
  promotions?: number | null;
  sessions?: number | null;
  pageViews?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  adOrders?: number | null;
  returnedUnits?: number | null;
}
export type Values = Record<MetricId, number | null>;
export interface Inventory {
  productId: string;
  marketplace: string;
  currency: string;
  available: number;
  inbound: number;
  reserved: number;
  dailyUnits: number;
  daysRemaining: number;
  value: number;
  reorder: number;
  status: "Healthy" | "Low stock" | "Overstock" | "Out of stock";
}
export interface SeriesPoint {
  date: string;
  dimension: string;
  values: Values;
}
export interface AnalyticsResult {
  mode: "demo" | "unavailable";
  message: string;
  currency: string;
  generatedAt: string;
  totals: Values;
  previous: Values | null;
  comparisonRange?: { start: string; end: string };
  comparisonSeries?: SeriesPoint[];
  series: SeriesPoint[];
  breakdown: { dimension: string; values: Values }[];
  rows: Fact[];
  catalog?: Product[];
  inventory?: Inventory[];
  inventoryAsOf?: string;
  coverage?: { start: string; end: string };
}
