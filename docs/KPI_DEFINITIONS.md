# Metric definitions — synthetic demo

Source monetary values are integer minor units. USD/CAD/GBP use 100 minor units. Derived per-order/per-click costs may be fractional before formatting. Never combine native currencies without an actual FX policy. No real financial reconciliation is claimed.

`shared/analytics/metrics.ts` is the canonical registry of all 35 labels, formats, favorable directions and definitions.

| Metrics | Calculation |
|---|---|
| Sales, ad spend/sales, units/orders | Sum of matching facts |
| Refunds, goods, fees, fulfillment, storage, promotions | Positive cost components summed from matching facts |
| Sessions, page views, impressions, clicks, ad orders, returned units | Sum of matching facts |
| Net sales | Sales − refunds − promotions |
| Organic sales | Sales − attributed ad sales |
| Gross profit | Net sales − cost of goods |
| Operating costs | Referral fees + fulfillment + storage + advertising |
| Net profit | Gross profit − operating costs |
| Net / gross margin | Corresponding profit / net sales × 100 |
| ROI | Net profit / cost of goods × 100 |
| ACOS / TACOS | Ad spend / ad sales or total sales × 100 |
| ROAS | Ad sales / ad spend |
| Conversion | Orders / sessions × 100 |
| CTR | Clicks / impressions × 100 |
| CPC | Ad spend / clicks |
| Ad conversion | Ad orders / clicks × 100 |
| Average order value / selling price | Sales / orders or units |
| Return rate | Returned units / units sold × 100 |

Ratios always derive from aggregate components, including across products, time and channels. KPI sparklines aggregate daily underlying facts rather than summing/averaging ratios. Empty datasets, missing required components and zero denominators yield null. Zero remains zero; negative values are preserved.

Cards show current value, comparison value and relative change. Percentage metrics show percentage-point changes. Relative change uses (current − previous) / abs(previous) × 100; zero baselines are unavailable. Favorable direction is metric-specific; spend/cost direction alone does not establish business success.

Demo inventory is a current snapshot, not an additive time-series metric. Velocity uses gross units in the latest 30 days across channels for each product/market. Available / daily velocity gives days cover. Suggested reorder = max(0, ceil(45 × velocity − available − inbound)). Native inventory value = available × fictional unit cost. Empty stock, under 21 days and over 90 days produce attention/overstock statuses.

These explicit demonstration formulas must be audited against real source grains, refunds, fee taxonomy, attribution windows, taxes, settlement policies, currencies and identity mappings before live use.

## All-marketplace Overview demo

The Overview now offers all three markets together. It labels illustrative fixed rates: 1 USD = 1.31 CAD = 0.79 GBP. For the explicit demo conversion mode, each source monetary field is converted with round(source minor units / source-rate × reporting-rate). Counts are preserved; missing costs stay null. Weighted KPIs, costs and profits are calculated after conversion using the shared engine. No sums of native-currency money or averages of ratios are used. Other modules remain native-only; no live exchange-rate policy is claimed.
