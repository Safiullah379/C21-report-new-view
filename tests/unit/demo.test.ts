import { describe, expect, it } from "vitest";
import { aggregate } from "../../shared/analytics/metrics";
import {
  bucket,
  comparisonRange,
  presetRange,
  shiftMonths,
} from "../../shared/analytics/calendar";
import { filtersSchema, additiveIds } from "../../shared/types/analytics";
import { preferenceSchema } from "../../shared/analytics/workspace";
import { workbook } from "../../shared/analytics/xlsx";
import { products, makeFacts, makeInventory } from "../../server/fixtures/demo";
import { analyze } from "../../server/services/analytics";
const end = "2026-11-25",
  facts = makeFacts(end),
  filters = filtersSchema.parse({ start: "2026-10-27", end });
describe("expanded demo reconciliation", () => {
  const result = analyze(facts, products, filters);
  it("reconciles every additive metric across segments and time buckets", () => {
    for (const id of additiveIds) {
      expect(result.series.reduce((s, p) => s + (p.values[id] || 0), 0)).toBe(
        result.totals[id],
      );
      expect(
        result.breakdown.reduce((s, p) => s + (p.values[id] || 0), 0),
      ).toBe(result.totals[id]);
    }
  });
  it("deducts every cost exactly once and recomputes margins", () => {
    const t = result.totals;
    expect(t.netSales).toBe(t.sales! - t.refunds! - t.promotions!);
    expect(t.netProfit).toBe(
      t.netSales! -
        t.cogs! -
        t.fees! -
        t.fulfillment! -
        t.storage! -
        t.adSpend!,
    );
    expect(t.margin).toBe((t.netProfit! / t.netSales!) * 100);
    expect(t.roi).toBe((t.netProfit! / t.cogs!) * 100);
    expect(t.conversion).toBe((t.orders! / t.sessions!) * 100);
    expect(t.cpc).toBe(t.adSpend! / t.clicks!);
  });
  it("returns missing profitability when a required cost is absent", () => {
    expect(aggregate([{ ...facts[0]!, cogs: null }]).netProfit).toBeNull();
    expect(aggregate([{ ...facts[0]!, sales: 0, adSales: 0 }]).acos).toBeNull();
  });
  it("applies brand filters to all reporting records", () => {
    const data = analyze(facts, products, {
      ...filters,
      brand: "Northline",
      breakdown: "product",
    });
    expect(data.rows.length).toBeGreaterThan(0);
    expect(
      data.rows.every(
        (r) =>
          products.find((p) => p.id === r.productId)?.brand === "Northline",
      ),
    ).toBe(true);
    expect(data.breakdown).toHaveLength(2);
  });
  it("matches total, channel and product breakdowns without changing totals", () => {
    for (const breakdown of [
      "total",
      "channel",
      "product",
      "brand",
      "marketplace",
    ] as const) {
      const data = analyze(facts, products, { ...filters, breakdown });
      expect(data.totals).toEqual(result.totals);
      expect(data.series.reduce((s, p) => s + p.values.netProfit!, 0)).toBe(
        result.totals.netProfit,
      );
    }
  });
  it("has varied previous-period results and supports independent custom comparisons", () => {
    expect(result.previous!.sales).not.toBe(result.totals.sales);
    const f = filtersSchema.parse({
      ...filters,
      comparison: "custom",
      compareStart: "2025-06-01",
      compareEnd: "2025-06-30",
    });
    const data = analyze(facts, products, f);
    expect(data.comparisonRange).toEqual({
      start: "2025-06-01",
      end: "2025-06-30",
    });
    expect(data.previous).toEqual(
      aggregate(
        facts.filter(
          (r) =>
            r.currency === "USD" &&
            r.date >= "2025-06-01" &&
            r.date <= "2025-06-30",
        ),
      ),
    );
  });
  it("bounds the allowed range and validates custom comparison dates", () => {
    expect(
      filtersSchema.safeParse({ ...filters, start: "2020-01-01" }).success,
    ).toBe(false);
    expect(
      filtersSchema.safeParse({ ...filters, comparison: "custom" }).success,
    ).toBe(false);
    expect(
      filtersSchema.safeParse({
        ...filters,
        comparison: "custom",
        compareStart: "2026-02-01",
        compareEnd: "2026-01-01",
      }).success,
    ).toBe(false);
  });
});
describe("calendar edges and fiscal buckets", () => {
  it("clamps month and leap-year shifts", () => {
    expect(shiftMonths("2024-02-29", -12)).toBe("2023-02-28");
    expect(shiftMonths("2026-03-31", -1)).toBe("2026-02-28");
  });
  it("provides elapsed and completed presets", () => {
    const now = new Date(end + "T16:00:00Z");
    expect(presetRange("month", now)).toEqual({ start: "2026-11-01", end });
    expect(presetRange("lastMonth", now)).toEqual({
      start: "2026-10-01",
      end: "2026-10-31",
    });
    expect(presetRange("lastQuarter", now)).toEqual({
      start: "2026-07-01",
      end: "2026-09-30",
    });
    expect(presetRange("lastYear", now)).toEqual({
      start: "2025-01-01",
      end: "2025-12-31",
    });
    expect(presetRange("lastWeek", now)).toEqual({
      start: "2026-11-16",
      end: "2026-11-22",
    });
  });
  it("supports Sunday, January 1 and fiscal week boundaries", () => {
    expect(bucket("2026-01-01", "weekly", "sunday")).toBe("2025-12-28");
    expect(bucket("2026-01-01", "weekly", "january")).toBe("2026-01-01");
    expect(bucket("2026-04-01", "weekly", "fiscal", 4)).toBe("2026-04-01");
    expect(bucket("2026-01-15", "quarterly", "fiscal", 2)).toBe("2025-11-01");
  });
  it("keeps weekday aligned comparisons exactly 52 weeks apart", () => {
    const c = comparisonRange({ ...filters, comparison: "weekdays" })!;
    expect(new Date(c.start).getUTCDay()).toBe(
      new Date(filters.start).getUTCDay(),
    );
    expect(Date.parse(filters.start) - Date.parse(c.start)).toBe(
      364 * 86400000,
    );
  });
});
describe("inventory snapshot", () => {
  it("has actionable low, empty, healthy and overstock positions with integer values", () => {
    const stock = makeInventory(end);
    expect(new Set(stock.map((s) => s.status)).size).toBe(4);
    for (const s of stock) {
      expect(Number.isInteger(s.available)).toBe(true);
      expect(Number.isInteger(s.value)).toBe(true);
      expect(s.reorder).toBe(
        Math.max(0, Math.ceil(s.dailyUnits * 45 - s.available - s.inbound)),
      );
      expect(s.currency).toBe(
        s.marketplace === "US" ? "USD" : s.marketplace === "CA" ? "CAD" : "GBP",
      );
    }
  });
});
describe("view persistence contract", () => {
  it("rejects empty and duplicate metrics and invalid chart settings", () => {
    expect(preferenceSchema.safeParse({ filters, visible: [] }).success).toBe(
      false,
    );
    expect(
      preferenceSchema.safeParse({ filters, visible: ["sales", "sales"] })
        .success,
    ).toBe(false);
    expect(preferenceSchema.safeParse({ filters, columns: 20 }).success).toBe(
      false,
    );
    expect(
      preferenceSchema.safeParse({
        filters,
        charts: { sales: { kind: "executable" } },
      }).success,
    ).toBe(false);
  });
  it("preserves financial chart configurations and relative dates", () => {
    const value = preferenceSchema.parse({
      filters,
      days: "year",
      visible: ["netProfit", "margin"],
      charts: { netProfit: { kind: "area", wide: true } },
      columns: 3,
    });
    expect(value.charts.netProfit).toEqual({ kind: "area", wide: true });
    expect(value.days).toBe("year");
  });
});
describe("native Excel export", () => {
  it("builds a ZIP workbook with numeric cells and inert escaped strings", () => {
    const bytes = workbook([
      ["SYNTHETIC DEMO DATA"],
      ["Sales", "Notes"],
      [123.45, '=HYPERLINK("unsafe")'],
      [null, "A&B <demo>"],
    ]);
    expect(new DataView(bytes.buffer).getUint32(0, true)).toBe(0x04034b50);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("<v>123.45</v>");
    expect(text).toContain("=HYPERLINK(&quot;unsafe&quot;)");
    expect(text).toContain("A&amp;B &lt;demo&gt;");
    expect(text).not.toContain("<f>");
    expect(text).toContain("xl/worksheets/sheet1.xml");
    expect(new DataView(bytes.buffer).getUint32(bytes.length - 22, true)).toBe(
      0x06054b50,
    );
  });
});
