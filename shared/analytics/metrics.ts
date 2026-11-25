import {
  additiveIds,
  type Fact,
  type MetricId,
  type Values,
} from "../types/analytics";
type Definition = {
  label: string;
  format: "money" | "number" | "percent" | "ratio";
  favorable: "up" | "down";
  definition: string;
};
const metric = (
  label: string,
  format: Definition["format"],
  definition: string,
  favorable: Definition["favorable"] = "up",
): Definition => ({ label, format, definition, favorable });
export const metrics: Record<MetricId, Definition> = {
  sales: metric(
    "Total sales",
    "money",
    "Gross product sales before refunds and promotions.",
  ),
  netSales: metric(
    "Net sales",
    "money",
    "Gross sales minus refunds and promotional discounts.",
  ),
  organicSales: metric(
    "Organic sales",
    "money",
    "Gross sales minus attributed advertising sales.",
  ),
  adSpend: metric(
    "Advertising spend",
    "money",
    "Advertising costs. Evaluate together with sales and return.",
    "down",
  ),
  units: metric("Units sold", "number", "Total units shipped."),
  orders: metric(
    "Total orders",
    "number",
    "Order count at the product and channel grain.",
  ),
  adSales: metric(
    "Advertising sales",
    "money",
    "Demo sales attributed to paid advertising.",
  ),
  refunds: metric(
    "Refunds",
    "money",
    "Refunded revenue, expressed as a positive cost.",
    "down",
  ),
  cogs: metric(
    "Cost of goods",
    "money",
    "Units sold multiplied by the demo unit cost.",
    "down",
  ),
  fees: metric(
    "Referral fees",
    "money",
    "Marketplace or payment processing fees.",
    "down",
  ),
  fulfillment: metric(
    "Fulfillment costs",
    "money",
    "Shipping and fulfillment expense.",
    "down",
  ),
  storage: metric(
    "Storage costs",
    "money",
    "Allocated warehouse storage expense.",
    "down",
  ),
  promotions: metric(
    "Promotions",
    "money",
    "Discounts applied to gross sales.",
    "down",
  ),
  sessions: metric("Sessions", "number", "Product visits in the demo period."),
  pageViews: metric("Page views", "number", "Product detail page impressions."),
  impressions: metric("Ad impressions", "number", "Advertising impressions."),
  clicks: metric("Ad clicks", "number", "Advertising clicks."),
  adOrders: metric(
    "Ad orders",
    "number",
    "Orders attributed to paid advertising.",
  ),
  returnedUnits: metric("Returned units", "number", "Returned units.", "down"),
  grossProfit: metric(
    "Gross profit",
    "money",
    "Net sales minus cost of goods.",
  ),
  netProfit: metric(
    "Net profit",
    "money",
    "Net sales minus goods, referral, fulfillment, storage and advertising costs.",
  ),
  operatingCosts: metric(
    "Operating costs",
    "money",
    "Referral, fulfillment, storage and advertising costs.",
    "down",
  ),
  margin: metric(
    "Net margin",
    "percent",
    "Net profit divided by net sales × 100.",
  ),
  grossMargin: metric(
    "Gross margin",
    "percent",
    "Gross profit divided by net sales × 100.",
  ),
  roi: metric("ROI", "percent", "Net profit divided by cost of goods × 100."),
  acos: metric(
    "ACOS",
    "percent",
    "Advertising spend divided by advertising sales × 100.",
    "down",
  ),
  tacos: metric(
    "TACOS",
    "percent",
    "Advertising spend divided by gross sales × 100.",
    "down",
  ),
  roas: metric(
    "ROAS",
    "ratio",
    "Advertising sales divided by advertising spend.",
  ),
  conversion: metric(
    "Conversion rate",
    "percent",
    "Orders divided by sessions × 100.",
  ),
  ctr: metric("CTR", "percent", "Ad clicks divided by ad impressions × 100."),
  cpc: metric(
    "CPC",
    "money",
    "Ad spend divided by ad clicks, in minor currency units.",
    "down",
  ),
  adConversion: metric(
    "Ad conversion",
    "percent",
    "Ad orders divided by ad clicks × 100.",
  ),
  aov: metric("Average order value", "money", "Gross sales divided by orders."),
  asp: metric(
    "Average selling price",
    "money",
    "Gross sales divided by units.",
  ),
  refundRate: metric(
    "Return rate",
    "percent",
    "Returned units divided by units sold × 100.",
    "down",
  ),
};
export const ratio = (n: number | null, d: number | null, factor = 1) =>
  n === null || d === null || d === 0 ? null : (n / d) * factor;
const calc = (
  values: (number | null)[],
  operation: (...n: number[]) => number,
) =>
  values.some((v) => v === null) ? null : operation(...(values as number[]));
export function aggregate(rows: Fact[]): Values {
  if (new Set(rows.map((r) => r.currency)).size > 1)
    throw new Error("Mixed currencies require verified FX policy");
  const sums = Object.fromEntries(
    additiveIds.map((key) => [
      key,
      rows.length === 0 || rows.some((r) => r[key] == null)
        ? null
        : rows.reduce((n, r) => n + r[key]!, 0),
    ]),
  ) as Pick<Values, (typeof additiveIds)[number]>;
  const {
    sales,
    adSpend,
    adSales,
    refunds,
    promotions,
    cogs,
    fees,
    fulfillment,
    storage,
    orders,
    sessions,
    impressions,
    clicks,
    adOrders,
    units,
    returnedUnits,
  } = sums;
  const netSales = calc([sales, refunds, promotions], (s, r, p) => s - r - p),
    operatingCosts = calc([fees, fulfillment, storage, adSpend], (...n) =>
      n.reduce((a, b) => a + b, 0),
    );
  const grossProfit = calc([netSales, cogs], (s, c) => s - c),
    netProfit = calc([grossProfit, operatingCosts], (p, c) => p - c);
  return {
    ...sums,
    netSales,
    organicSales: calc([sales, adSales], (s, a) => s - a),
    grossProfit,
    netProfit,
    operatingCosts,
    margin: ratio(netProfit, netSales, 100),
    grossMargin: ratio(grossProfit, netSales, 100),
    roi: ratio(netProfit, cogs, 100),
    acos: ratio(adSpend, adSales, 100),
    tacos: ratio(adSpend, sales, 100),
    roas: ratio(adSales, adSpend),
    conversion: ratio(orders, sessions, 100),
    ctr: ratio(clicks, impressions, 100),
    cpc: ratio(adSpend, clicks),
    adConversion: ratio(adOrders, clicks, 100),
    aov: ratio(sales, orders),
    asp: ratio(sales, units),
    refundRate: ratio(returnedUnits, units, 100),
  };
}
export function formatMetric(
  id: MetricId,
  value: number | null | undefined,
  currency: string,
) {
  if (value == null || !Number.isFinite(value)) return "Unavailable";
  const format = metrics[id].format;
  if (format === "money")
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value / 100);
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "ratio") return `${value.toFixed(2)}×`;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
    value,
  );
}
export function change(current: number | null, previous: number | null) {
  return {
    absolute: current === null || previous === null ? null : current - previous,
    percent:
      current === null || previous === null || previous === 0
        ? null
        : ((current - previous) / Math.abs(previous)) * 100,
  };
}
