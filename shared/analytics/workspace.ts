import { z } from "zod";
import { filtersSchema, metricIds, type MetricId } from "../types/analytics";
import { presetIds } from "./calendar";
export const defaultMetrics: MetricId[] = [
  "sales",
  "netProfit",
  "adSpend",
  "units",
  "acos",
  "roas",
];
export const chartKinds = ["line", "area", "bar", "stacked"] as const;
export const chartConfigSchema = z.object({
  kind: z.enum(chartKinds).default("line"),
  wide: z.boolean().default(false),
});
export const preferenceSchema = z.object({
  layout: z.enum(["carousel", "grid", "focus", "compact"]).default("carousel"),
  metric: z.enum(metricIds).default("sales"),
  filters: filtersSchema,
  days: z.enum(presetIds).default("30"),
  visible: z
    .array(z.enum(metricIds))
    .min(1)
    .max(metricIds.length)
    .refine((a) => new Set(a).size === a.length)
    .default(defaultMetrics),
  columns: z.number().int().min(1).max(4).default(2),
  sync: z.boolean().default(true),
  charts: z
    .partialRecord(z.enum(metricIds), chartConfigSchema)
    .default({} as Record<MetricId, z.infer<typeof chartConfigSchema>>),
});
export type Preference = z.infer<typeof preferenceSchema>;
export const savedSchema = z.object({
  id: z.string().max(100),
  name: z.string().trim().min(1).max(80),
  value: preferenceSchema,
});
export type SavedView = z.infer<typeof savedSchema>;
export const modules = [
  {
    id: "overview",
    name: "Overview",
    icon: "▦",
    description:
      "A clear view of your business. Every channel, one perspective.",
    metrics: [
      "sales",
      "netSales",
      "netProfit",
      "margin",
      "orders",
      "conversion",
    ],
  },
  {
    id: "explorer",
    name: "Performance Explorer",
    icon: "⌁",
    description: "Follow the signals. Find the story behind your performance.",
    metrics: defaultMetrics,
  },
  {
    id: "sales",
    name: "Sales Analytics",
    icon: "↗",
    description: "Revenue, orders, and the products driving your growth.",
    metrics: ["sales", "netSales", "organicSales", "orders", "aov", "asp"],
  },
  {
    id: "advertising",
    name: "Advertising",
    icon: "◎",
    description: "Understand the return on every advertising dollar.",
    metrics: ["adSpend", "adSales", "acos", "tacos", "roas", "adConversion"],
  },
  {
    id: "profitability",
    name: "Profitability",
    icon: "◈",
    description: "From gross revenue to the profit you keep.",
    metrics: [
      "netSales",
      "grossProfit",
      "netProfit",
      "margin",
      "roi",
      "operatingCosts",
    ],
  },
  {
    id: "products",
    name: "Products",
    icon: "▧",
    description:
      "Explore product performance, from collection to individual SKU.",
    metrics: [
      "sales",
      "units",
      "orders",
      "conversion",
      "refundRate",
      "netProfit",
    ],
  },
  {
    id: "inventory",
    name: "Inventory",
    icon: "▥",
    description: "Stay ahead of stockouts. Put your inventory to work.",
    metrics: defaultMetrics,
  },
  {
    id: "reports",
    name: "Reporting Center",
    icon: "▤",
    description: "Turn your analysis into a report worth sharing.",
    metrics: defaultMetrics,
  },
  {
    id: "saved",
    name: "My Saved Views",
    icon: "☆",
    description: "Your favorite perspectives, ready when you are.",
    metrics: defaultMetrics,
  },
  {
    id: "settings",
    name: "Workspace Settings",
    icon: "⚙",
    description: "Make this workspace feel like yours.",
    metrics: defaultMetrics,
  },
] as const;
export type ModuleId = (typeof modules)[number]["id"];
export const templates: {
  name: string;
  description: string;
  metrics: MetricId[];
  layout: Preference["layout"];
  breakdown?: Preference["filters"]["breakdown"];
  days?: Preference["days"];
  comparison?: Preference["filters"]["comparison"];
}[] = [
  {
    name: "Executive Overview",
    description: "Revenue, profit and customer conversion.",
    metrics: ["sales", "netProfit", "margin", "orders", "conversion", "aov"],
    layout: "grid",
  },
  {
    name: "Sales Performance",
    description: "Sales momentum and order economics.",
    metrics: ["sales", "netSales", "orders", "units", "aov", "asp"],
    layout: "grid",
  },
  {
    name: "PPC Performance",
    description: "Spend efficiency and attributed returns.",
    metrics: ["adSpend", "adSales", "acos", "roas", "ctr", "cpc"],
    layout: "grid",
  },
  {
    name: "Product Profitability",
    description: "Profit contributions across the catalog.",
    metrics: ["netProfit", "margin", "roi", "cogs"],
    layout: "grid",
    breakdown: "product",
  },
  {
    name: "Marketplace Comparison",
    description: "Compare markets in the selected native currency.",
    metrics: ["sales", "netProfit", "units", "acos"],
    layout: "grid",
    breakdown: "marketplace",
  },
  {
    name: "Channel Comparison",
    description: "Amazon and Shopify side by side.",
    metrics: ["sales", "netProfit", "orders", "aov"],
    layout: "grid",
    breakdown: "channel",
  },
  {
    name: "YoY Performance",
    description: "A full year against the same dates last year.",
    metrics: ["sales", "netSales", "netProfit", "orders"],
    layout: "grid",
    days: "365",
    comparison: "year",
  },
  {
    name: "Financial Overview",
    description: "Revenue, costs and margins in one place.",
    metrics: [
      "netSales",
      "cogs",
      "operatingCosts",
      "grossProfit",
      "netProfit",
      "margin",
    ],
    layout: "compact",
  },
];
