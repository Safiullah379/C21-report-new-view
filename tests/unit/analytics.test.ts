import { describe, expect, it } from "vitest";
import { aggregate, change } from "../../shared/analytics/metrics";
import {
  bucket,
  januaryWeek,
  previousPeriod,
  relativeRange,
} from "../../shared/analytics/calendar";
import { expandProducts } from "../../shared/analytics/products";
import { filtersSchema, type Fact } from "../../shared/types/analytics";
import { products, makeFacts } from "../../server/fixtures/demo";
import { analyze, unavailable } from "../../server/services/analytics";
const row: Fact = {
  date: "2026-01-01",
  productId: "demo:ink",
  marketplace: "US",
  channel: "amazon",
  currency: "USD",
  sales: 10000,
  adSpend: 1000,
  adSales: 2000,
  units: 10,
  orders: 7,
};
describe("financial aggregation", () => {
  it("recomputes ratios from components rather than averaging percentages", () => {
    const result = aggregate([row, { ...row, adSpend: 1000, adSales: 8000 }]);
    expect(result.acos).toBe(20);
    expect(result.sales).toBe(20000);
    expect(result.roas).toBe(5);
  });
  it("distinguishes zero, missing and absent data", () => {
    expect(aggregate([]).sales).toBeNull();
    expect(aggregate([{ ...row, sales: 0 }]).sales).toBe(0);
    expect(aggregate([{ ...row, adSales: 0 }]).acos).toBeNull();
    expect(aggregate([row, { ...row, sales: null }]).sales).toBeNull();
  });
  it("refuses mixed currencies", () =>
    expect(() => aggregate([row, { ...row, currency: "GBP" }])).toThrow(
      "Mixed currencies",
    ));
  it("preserves minor units and negative refunds", () =>
    expect(aggregate([row, { ...row, sales: -103 }]).sales).toBe(9897));
  it("handles zero baselines and percentage point differences", () => {
    expect(change(10, 0).percent).toBeNull();
    expect(change(25, 20)).toEqual({ absolute: 5, percent: 25 });
  });
});
describe("reporting calendar", () => {
  it("uses equal inclusive periods across leap day", () =>
    expect(previousPeriod("2024-03-01", "2024-03-02")).toEqual({
      start: "2024-02-28",
      end: "2024-02-29",
    }));
  it("handles ISO week and year boundaries", () => {
    expect(bucket("2026-01-01", "weekly")).toBe("2025-12-29");
    expect(bucket("2026-01-15", "monthly")).toBe("2026-01-01");
  });
  it("keeps Jan 1-based week 53 within its calendar year", () => {
    expect(januaryWeek("2024-12-31")).toBe(53);
    expect(januaryWeek("2025-01-01")).toBe(1);
  });
  it("resolves relative dates in UTC", () =>
    expect(relativeRange(7, new Date("2024-03-02T12:00:00Z"))).toEqual({
      start: "2024-02-25",
      end: "2024-03-02",
    }));
  it("rejects invalid dates, backwards and oversized ranges", () => {
    expect(
      filtersSchema.safeParse({ start: "2026-02-30", end: "2026-03-01" })
        .success,
    ).toBe(false);
    expect(
      filtersSchema.safeParse({ start: "2026-03-01", end: "2026-01-01" })
        .success,
    ).toBe(false);
    expect(
      filtersSchema.safeParse({ start: "2020-01-01", end: "2026-01-01" })
        .success,
    ).toBe(false);
  });
});
describe("shared analytics service", () => {
  const filters = filtersSchema.parse({
    start: "2026-01-01",
    end: "2026-01-30",
  });
  const facts = makeFacts("2026-01-30");
  it("deduplicates parent and child selections by scoped identity", () =>
    expect(
      [...expandProducts(["demo:parent", "demo:ink"], products)].sort(),
    ).toEqual(["demo:ink", "demo:olive"]));
  it("reconciles KPI, series, and table additive totals", () => {
    const result = analyze(facts, products, filters);
    expect(result.series.reduce((n, p) => n + p.values.sales!, 0)).toBe(
      result.totals.sales,
    );
    expect(result.breakdown.reduce((n, p) => n + p.values.sales!, 0)).toBe(
      result.totals.sales,
    );
    expect(result.rows.every((r) => r.currency === "USD")).toBe(true);
  });
  it("applies all filters and does not double count products", () => {
    const a = analyze(facts, products, {
      ...filters,
      products: ["demo:parent"],
      marketplaces: ["US"],
      channels: ["amazon"],
    });
    const b = analyze(facts, products, {
      ...filters,
      products: ["demo:parent", "demo:ink"],
      marketplaces: ["US"],
      channels: ["amazon"],
    });
    expect(a.totals).toEqual(b.totals);
    expect(
      a.rows.every((r) => r.marketplace === "US" && r.channel === "amazon"),
    ).toBe(true);
  });
  it("does not silently treat an unknown product as all products", () =>
    expect(
      analyze(facts, products, { ...filters, products: ["unknown"] }).rows,
    ).toEqual([]));
  it("returns unavailable when native currency has no matching data", () =>
    expect(
      analyze(facts, products, {
        ...filters,
        currency: "CAD",
        marketplaces: ["US"],
      }).totals.sales,
    ).toBeNull());
  it("default live-data response contains no synthetic records", () => {
    const result = unavailable("USD");
    expect(result.rows).toEqual([]);
    expect(result.totals.sales).toBeNull();
    expect(result.mode).toBe("unavailable");
  });
});
