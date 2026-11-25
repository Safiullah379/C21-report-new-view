import { describe, expect, it } from "vitest";
import {
  compareYears,
  yearComparisonSchema,
} from "../../shared/analytics/year-comparison";
import type { Fact, Product } from "../../shared/types/analytics";
const catalog: Product[] = [
  {
    id: "demo:parent",
    title: "Collection",
    sku: "P",
    asin: "DEMO-P",
    brand: "Demo",
    parentId: null,
    variation: "All",
    marketplaces: ["US"],
  },
  {
    id: "demo:one",
    title: "Product",
    sku: "ONE",
    asin: "DEMO-ONE",
    brand: "Demo",
    parentId: "demo:parent",
    variation: "One",
    marketplaces: ["US"],
  },
];
function fact(
  date: string,
  sales = 10000,
  adSpend = 1000,
  adSales = 2000,
): Fact {
  return {
    date,
    productId: "demo:one",
    marketplace: "US",
    channel: "amazon",
    currency: "USD",
    sales,
    adSpend,
    adSales,
    units: 10,
    orders: 8,
  };
}
const request = yearComparisonSchema.parse({
  year: 2026,
  years: [2026, 2025],
  start: "2026-01-01",
  end: "2026-12-31",
});
describe("calendar-year graphs", () => {
  it("aligns month numbers and keeps future periods missing rather than zero", () => {
    const result = compareYears(
      [fact("2026-01-02"), fact("2025-01-02", 20000)],
      catalog,
      request,
      "2026-11-25",
    );
    expect(result.monthly.map((l) => l.year)).toEqual([2026, 2025]);
    expect(result.monthly[0]!.points).toHaveLength(12);
    expect(result.monthly[0]!.points[0]!.values?.sales).toBe(10000);
    expect(result.monthly[1]!.points[0]!.values?.sales).toBe(20000);
    expect(result.monthly[0]!.points[11]!.values).toBeNull();
  });
  it("matches elapsed dates across years and labels partial months", () => {
    const rows = [
      fact("2026-11-25"),
      fact("2025-11-25", 30000),
      fact("2025-11-26", 80000),
      fact("2025-12-01", 90000),
    ];
    const result = compareYears(rows, catalog, request, "2026-11-25");
    expect(result.monthly[1]!.points[10]!.values?.sales).toBe(30000);
    expect(result.monthly[1]!.points[10]!.end).toBe("2025-11-25");
    expect(result.monthly[1]!.points[10]!.partial).toBe(true);
    expect(result.monthly[1]!.points[11]!.values).toBeNull();
    const full = compareYears(
      rows,
      catalog,
      { ...request, alignElapsed: false },
      "2026-11-25",
    );
    expect(full.monthly[1]!.points[10]!.values?.sales).toBe(110000);
    expect(full.monthly[1]!.points[11]!.values?.sales).toBe(90000);
  });
  it("assigns January 1–7 to Week 1 and January 8–14 to Week 2", () => {
    const result = compareYears(
      [
        fact("2026-01-01"),
        fact("2026-01-07"),
        fact("2026-01-08"),
        fact("2025-01-07"),
      ],
      catalog,
      request,
      "2026-11-25",
    );
    expect(result.weekly[0]!.points[0]!.values?.sales).toBe(20000);
    expect(result.weekly[0]!.points[1]!.values?.sales).toBe(10000);
    expect(result.weekly[1]!.points[0]!.values?.sales).toBe(10000);
  });
  it("does not double count across years, including leap year Week 53", () => {
    const f = yearComparisonSchema.parse({
      ...request,
      year: 2025,
      years: [2025, 2024],
      start: "2025-01-01",
      end: "2025-12-31",
      alignElapsed: false,
    });
    const result = compareYears(
      [
        fact("2024-12-30", 10000),
        fact("2024-12-31", 20000),
        fact("2025-01-01", 30000),
      ],
      catalog,
      f,
      "2026-11-25",
    );
    expect(result.weekly[1]!.points[52]!.values?.sales).toBe(30000);
    expect(result.weekly[1]!.points[52]!.end).toBe("2024-12-31");
    expect(result.weekly[1]!.points[52]!.partial).toBe(true);
    expect(result.weekly[0]!.points[0]!.values?.sales).toBe(30000);
  });
  it("recomputes period ratios from underlying components", () => {
    const result = compareYears(
      [
        fact("2026-01-01", 10000, 1000, 2000),
        fact("2026-01-02", 10000, 1000, 8000),
      ],
      catalog,
      request,
      "2026-11-25",
    );
    expect(result.monthly[0]!.points[0]!.values?.acos).toBe(20);
    expect(result.weekly[0]!.points[0]!.values?.roas).toBe(5);
  });
  it("deduplicates parent/child selection and excludes other native currencies", () => {
    const rows = [
      fact("2026-01-01"),
      { ...fact("2026-01-01", 90000), currency: "CAD" },
    ];
    const result = compareYears(
      rows,
      catalog,
      { ...request, products: ["demo:parent", "demo:one"] },
      "2026-11-25",
    );
    expect(result.monthly[0]!.points[0]!.values?.sales).toBe(10000);
    expect(
      compareYears(
        rows,
        catalog,
        { ...request, products: ["unknown"] },
        "2026-11-25",
      ).monthly[0]!.points[0]!.values,
    ).toBeNull();
  });
  it("clips custom ranges before weekly/monthly aggregation", () => {
    const result = compareYears(
      [fact("2026-03-01", 50000), fact("2026-03-06"), fact("2026-03-10")],
      catalog,
      { ...request, start: "2026-03-05", end: "2026-03-12" },
      "2026-11-25",
    );
    expect(result.monthly[0]!.points).toHaveLength(1);
    expect(result.monthly[0]!.points[0]!.values?.sales).toBe(20000);
    expect(
      result.weekly[0]!.points.reduce(
        (sum, p) => sum + (p.values?.sales || 0),
        0,
      ),
    ).toBe(20000);
  });
  it("validates reference year, unique comparisons and chronological dates", () => {
    expect(
      yearComparisonSchema.safeParse({ ...request, years: [2026, 2026] })
        .success,
    ).toBe(false);
    expect(
      yearComparisonSchema.safeParse({ ...request, years: [2025, 2024] })
        .success,
    ).toBe(false);
    expect(
      yearComparisonSchema.safeParse({ ...request, start: "2025-01-01" })
        .success,
    ).toBe(false);
    expect(
      yearComparisonSchema.safeParse({
        ...request,
        start: "2026-12-01",
        end: "2026-01-01",
      }).success,
    ).toBe(false);
    expect(
      yearComparisonSchema.safeParse({ ...request, start: "2026-02-30" })
        .success,
    ).toBe(false);
  });
});
