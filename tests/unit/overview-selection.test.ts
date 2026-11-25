import { describe, expect, it } from "vitest";
import { convertDemoCurrency } from "../../shared/analytics/demo-currency";
import {
  compareYears,
  yearComparisonSchema,
} from "../../shared/analytics/year-comparison";
import { overviewSelectionSchema } from "../../shared/analytics/overview-selection";
import type { Fact, Product } from "../../shared/types/analytics";
const catalog: Product[] = [
  {
    id: "demo:parent",
    sku: "PARENT",
    title: "Parent",
    asin: "DEMO-P",
    parentId: null,
    brand: "Demo",
    variation: "All",
    marketplaces: ["US", "CA", "UK"],
  },
  {
    id: "demo:one",
    sku: "ONE",
    title: "One",
    asin: "DEMO-1",
    parentId: "demo:parent",
    brand: "Demo",
    variation: "One",
    marketplaces: ["US", "CA", "UK"],
  },
  {
    id: "demo:two",
    sku: "TWO",
    title: "Two",
    asin: "DEMO-2",
    parentId: "demo:parent",
    brand: "Demo",
    variation: "Two",
    marketplaces: ["US", "CA", "UK"],
  },
  {
    id: "demo:other",
    sku: "OTHER",
    title: "Other",
    asin: "DEMO-3",
    parentId: null,
    brand: "Demo",
    variation: "Other",
    marketplaces: ["US", "CA", "UK"],
  },
];
const row: Fact = {
  date: "2026-01-01",
  productId: "demo:one",
  currency: "USD",
  marketplace: "US",
  channel: "amazon",
  sales: 10000,
  adSpend: 1000,
  adSales: 2000,
  orders: 8,
  units: 10,
  refunds: 0,
  cogs: 3000,
  fees: 1500,
  fulfillment: 400,
  storage: 100,
  promotions: 0,
};
const request = yearComparisonSchema.parse({
  year: 2026,
  years: [2026, 2025],
  start: "2026-01-01",
  end: "2026-12-31",
  convertCurrency: true,
});
describe("Overview marketplace and SKU scopes", () => {
  it("combines all three marketplaces in one reporting currency without losing counts", () => {
    const facts = [
      row,
      {
        ...row,
        currency: "CAD",
        marketplace: "CA",
        sales: 13100,
        adSpend: 1310,
        adSales: 10480,
      },
      {
        ...row,
        currency: "GBP",
        marketplace: "UK",
        sales: 7900,
        adSpend: 1580,
        adSales: 3950,
      },
    ];
    const result = compareYears(facts, catalog, request, "2026-11-25");
    const values = result.monthly[0]!.points[0]!.values!;
    expect(values.sales).toBe(30000);
    expect(values.units).toBe(30);
    expect(values.orders).toBe(24);
    expect(values.adSpend).toBe(4000);
    expect(values.adSales).toBe(15000);
    expect(values.acos).toBeCloseTo((4000 / 15000) * 100);
    expect(result.fxPolicy).toBe("synthetic-fixed");
    expect(result.currency).toBe("USD");
    expect(facts[1]!.currency).toBe("CAD");
    expect(facts[1]!.sales).toBe(13100);
  });
  it("preserves native-only behavior unless demo conversion is explicitly enabled", () => {
    const facts = [
      row,
      { ...row, currency: "CAD", marketplace: "CA", sales: 13100 },
    ];
    const result = compareYears(
      facts,
      catalog,
      { ...request, convertCurrency: false },
      "2026-11-25",
    );
    expect(result.monthly[0]!.points[0]!.values?.sales).toBe(10000);
    expect(result.fxPolicy).toBeUndefined();
  });
  it("applies a selected marketplace before conversion", () => {
    const facts = [
      row,
      { ...row, currency: "CAD", marketplace: "CA", sales: 13100 },
    ];
    expect(
      compareYears(
        facts,
        catalog,
        { ...request, marketplaces: ["CA"] },
        "2026-11-25",
      ).monthly[0]!.points[0]!.values?.sales,
    ).toBe(10000);
    expect(
      compareYears(
        facts,
        catalog,
        { ...request, marketplaces: ["CA"], currency: "CAD" },
        "2026-11-25",
      ).monthly[0]!.points[0]!.values?.sales,
    ).toBe(13100);
  });
  it("differentiates a single SKU, parent variations, and all SKUs", () => {
    const facts = [
      row,
      { ...row, productId: "demo:two", sales: 20000 },
      { ...row, productId: "demo:other", sales: 40000 },
    ];
    const total = (products: string[]) =>
      compareYears(facts, catalog, { ...request, products }, "2026-11-25")
        .monthly[0]!.points[0]!.values?.sales;
    expect(total(["demo:one"])).toBe(10000);
    expect(total(["demo:parent"])).toBe(30000);
    expect(total(["demo:parent", "demo:one"])).toBe(30000);
    expect(total([])).toBe(70000);
  });
  it("keeps converted source money integral and missing costs unknown", () => {
    const converted = convertDemoCurrency(
      { ...row, currency: "CAD", sales: 101, cogs: null },
      "GBP",
    );
    expect(Number.isInteger(converted.sales)).toBe(true);
    expect(converted.cogs).toBeNull();
    expect(converted.units).toBe(10);
    expect(() =>
      convertDemoCurrency({ ...row, currency: "UNKNOWN" }, "USD"),
    ).toThrow("Unsupported demo source currency");
  });
  it("validates persisted marketplace and SKU choices", () => {
    expect(overviewSelectionSchema.parse({})).toEqual({
      marketplace: "all",
      skuMode: "all",
      skuId: "",
    });
    expect(
      overviewSelectionSchema.safeParse({ marketplace: "invalid" }).success,
    ).toBe(false);
    expect(
      overviewSelectionSchema.safeParse({ skuMode: "single", skuId: "" })
        .success,
    ).toBe(false);
    expect(
      overviewSelectionSchema.safeParse({
        skuMode: "parent",
        skuId: "demo:parent",
      }).success,
    ).toBe(true);
  });
});
