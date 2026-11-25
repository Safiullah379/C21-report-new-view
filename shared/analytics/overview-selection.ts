import { z } from "zod";
export const overviewSelectionSchema = z
  .object({
    marketplace: z.enum(["all", "US", "CA", "UK"]).default("all"),
    skuMode: z.enum(["all", "single", "parent"]).default("all"),
    skuId: z.string().max(100).default(""),
  })
  .refine((s) => s.skuMode === "all" || s.skuId.length > 0, "Select a SKU");
export type OverviewSelection = z.infer<typeof overviewSelectionSchema>;
export const overviewMarkets = [
  { id: "US", label: "United States", short: "United States", currency: "USD" },
  { id: "CA", label: "Canada", short: "Canada", currency: "CAD" },
  {
    id: "UK",
    label: "United Kingdom",
    short: "United Kingdom",
    currency: "GBP",
  },
] as const;
