import type {
  AnalyticsResult,
  Fact,
  Filters,
  Product,
  SeriesPoint,
} from "../../shared/types/analytics";
import { aggregate } from "../../shared/analytics/metrics";
import { bucket, comparisonRange } from "../../shared/analytics/calendar";
import { expandProducts } from "../../shared/analytics/products";
export function analyze(
  facts: Fact[],
  catalog: Product[],
  filters: Filters,
): AnalyticsResult {
  const selected = expandProducts(filters.products, catalog),
    productMap = new Map(catalog.map((p) => [p.id, p]));
  const matching = facts.filter(
    (r) =>
      r.currency === filters.currency &&
      (!filters.products.length || selected.has(r.productId)) &&
      (!filters.brand ||
        productMap.get(r.productId)?.brand === filters.brand) &&
      (!filters.marketplaces.length ||
        filters.marketplaces.includes(r.marketplace as "US")) &&
      (!filters.channels.length ||
        filters.channels.includes(r.channel as "amazon")),
  );
  const rows = matching.filter(
      (r) => r.date >= filters.start && r.date <= filters.end,
    ),
    previous = comparisonRange(filters);
  const previousRows = previous
    ? matching.filter((r) => r.date >= previous.start && r.date <= previous.end)
    : [];
  const dimension = (r: Fact) =>
    filters.breakdown === "marketplace"
      ? r.marketplace
      : filters.breakdown === "channel"
        ? r.channel
        : filters.breakdown === "product"
          ? productMap.get(r.productId)?.title || r.productId
          : filters.breakdown === "brand"
            ? productMap.get(r.productId)?.brand || "Unknown"
            : filters.breakdown === "total"
              ? "Combined total"
              : `${r.channel} · ${r.marketplace}`;
  function series(source: Fact[]): SeriesPoint[] {
    const groups = new Map<string, Fact[]>();
    for (const row of source) {
      const key = `${bucket(row.date, filters.granularity, filters.calendar, filters.fiscalMonth)}|${dimension(row)}`;
      let group = groups.get(key);
      if (!group) {
        group = [];
        groups.set(key, group);
      }
      group.push(row);
    }
    return [...groups]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, group]) => {
        const [date, dimension] = key.split("|");
        return { date: date!, dimension: dimension!, values: aggregate(group) };
      });
  }
  const dimensions = new Map<string, Fact[]>();
  for (const row of rows) {
    const key = dimension(row);
    let group = dimensions.get(key);
    if (!group) {
      group = [];
      dimensions.set(key, group);
    }
    group.push(row);
  }
  return {
    mode: "demo",
    message: "Synthetic demo data. Not actual business reporting.",
    currency: filters.currency,
    generatedAt: new Date().toISOString(),
    totals: aggregate(rows),
    previous: previous ? aggregate(previousRows) : null,
    comparisonRange: previous,
    comparisonSeries: series(previousRows),
    series: series(rows),
    breakdown: [...dimensions].map(([dimension, group]) => ({
      dimension,
      values: aggregate(group),
    })),
    rows,
    catalog,
    coverage: facts.length
      ? {
          start: facts.reduce(
            (d, r) => (r.date < d ? r.date : d),
            facts[0]!.date,
          ),
          end: facts.reduce(
            (d, r) => (r.date > d ? r.date : d),
            facts[0]!.date,
          ),
        }
      : undefined,
  };
}
export function unavailable(currency: string): AnalyticsResult {
  return {
    mode: "unavailable",
    message: "Demo is disabled. No live source is connected.",
    currency,
    generatedAt: new Date().toISOString(),
    totals: aggregate([]),
    previous: null,
    series: [],
    breakdown: [],
    rows: [],
    catalog: [],
    inventory: [],
  };
}
