import { z } from "zod";
import {
  filtersSchema,
  type Fact,
  type Product,
  type Values,
} from "../types/analytics";
import { aggregate } from "./metrics";
import { expandProducts } from "./products";
import { day, isoDate, januaryWeek, shiftMonths } from "./calendar";
import { convertDemoCurrency } from "./demo-currency";

export const yearComparisonSchema = z
  .object({
    year: z.number().int().min(2020).max(2100),
    years: z
      .array(z.number().int().min(2020).max(2100))
      .min(2, "Select at least one comparison year")
      .max(3)
      .refine((a) => new Set(a).size === a.length, "Choose distinct years"),
    start: z.iso.date(),
    end: z.iso.date(),
    alignElapsed: z.boolean().default(true),
    currency: filtersSchema.shape.currency,
    convertCurrency: z.boolean().default(false),
    products: filtersSchema.shape.products,
    brand: filtersSchema.shape.brand,
    marketplaces: filtersSchema.shape.marketplaces,
    channels: filtersSchema.shape.channels,
  })
  .refine(
    (f) =>
      f.start <= f.end &&
      Number(f.start.slice(0, 4)) === f.year &&
      Number(f.end.slice(0, 4)) === f.year,
    "Dates must be in the reference year and in chronological order",
  )
  .refine((f) => f.years.includes(f.year), "Include the reference year");
export type YearComparisonRequest = z.infer<typeof yearComparisonSchema>;
export interface YearPoint {
  period: number;
  start: string;
  end: string;
  partial: boolean;
  values: Values | null;
}
export interface YearLine {
  year: number;
  points: YearPoint[];
}
export interface YearComparisonResult {
  mode: "demo" | "unavailable";
  currency: string;
  today: string;
  weekly: YearLine[];
  monthly: YearLine[];
  fxPolicy?: "synthetic-fixed";
}

export function compareYears(
  facts: Fact[],
  catalog: Product[],
  request: YearComparisonRequest,
  today = isoDate(new Date()),
): YearComparisonResult {
  const selected = expandProducts(request.products, catalog),
    brands = new Map(catalog.map((p) => [p.id, p.brand]));
  const matching = facts
    .filter(
      (r) =>
        (request.convertCurrency || r.currency === request.currency) &&
        (!request.products.length || selected.has(r.productId)) &&
        (!request.brand || brands.get(r.productId) === request.brand) &&
        (!request.marketplaces.length ||
          request.marketplaces.includes(r.marketplace as "US")) &&
        (!request.channels.length ||
          request.channels.includes(r.channel as "amazon")),
    )
    .map((row) =>
      request.convertCurrency
        ? convertDemoCurrency(row, request.currency)
        : row,
    );
  const nowYear = Number(today.slice(0, 4)),
    referenceCutoff = shiftMonths(today, (request.year - nowYear) * 12);
  const alignedEnd =
    request.alignElapsed &&
    request.years.includes(nowYear) &&
    referenceCutoff < request.end
      ? referenceCutoff
      : request.end;
  const atYear = (date: string, year: number) =>
    shiftMonths(date, (year - request.year) * 12);
  function series(resolution: "weekly" | "monthly"): YearLine[] {
    const first =
      resolution === "weekly"
        ? januaryWeek(request.start)
        : Number(request.start.slice(5, 7));
    const last =
      resolution === "weekly"
        ? januaryWeek(request.end)
        : Number(request.end.slice(5, 7));
    return request.years.map((year) => {
      const start = atYear(request.start, year),
        end = [atYear(alignedEnd, year), today].sort()[0]!;
      const groups = new Map<number, Fact[]>();
      for (const row of matching) {
        if (
          row.date < start ||
          row.date > end ||
          Number(row.date.slice(0, 4)) !== year
        )
          continue;
        const period =
          resolution === "weekly"
            ? januaryWeek(row.date)
            : Number(row.date.slice(5, 7));
        const group = groups.get(period) || [];
        group.push(row);
        groups.set(period, group);
      }
      const points: YearPoint[] = [];
      for (let period = first; period <= last; period++) {
        const fullStart =
          resolution === "weekly"
            ? isoDate(new Date(Date.UTC(year, 0, 1) + (period - 1) * 7 * day))
            : isoDate(new Date(Date.UTC(year, period - 1, 1)));
        const fullEnd =
          resolution === "weekly"
            ? [
                isoDate(new Date(Date.parse(fullStart) + 6 * day)),
                `${year}-12-31`,
              ].sort()[0]!
            : isoDate(new Date(Date.UTC(year, period, 0)));
        const clippedStart = fullStart > start ? fullStart : start,
          clippedEnd = fullEnd < end ? fullEnd : end;
        const rows = groups.get(period) || [];
        points.push({
          period,
          start: rows.length ? clippedStart : fullStart,
          end: rows.length ? clippedEnd : fullEnd,
          partial:
            !!rows.length &&
            (clippedStart > fullStart ||
              clippedEnd < fullEnd ||
              (resolution === "weekly" &&
                Date.parse(fullEnd) - Date.parse(fullStart) < 6 * day)),
          values: rows.length ? aggregate(rows) : null,
        });
      }
      return { year, points };
    });
  }
  return {
    mode: "demo",
    currency: request.currency,
    today,
    weekly: series("weekly"),
    monthly: series("monthly"),
    fxPolicy: request.convertCurrency ? "synthetic-fixed" : undefined,
  };
}
