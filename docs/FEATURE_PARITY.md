# Capability and parity evidence

The original selected repository was empty. The reference application previously returned a proxy CONNECT 403. No original dashboard source, database, screenshots or verified calculation contracts have been supplied. The 2026-11-25 user instruction explicitly authorized finishing the application using dummy data. The new Overview is a demo design, not a reconstruction of the original.

| Capability | Demo implementation | Validation / limits |
|---|---|---|
| Overview | Executive KPIs, trend/comparison, signals, top products, profit bridge | Shared synthetic calculations; no legacy parity claim |
| Explorer / specialist modules | Explorer, sales, ads, profit, products | Browser navigation and shared totals |
| Product lookup | 11 catalog entries, parent/child dedup, SKU/ASIN/brand/parent search | Fixture scan only; no high-volume index claim |
| Date/calendar | 19 choices including custom, daily–yearly, four weekly calendar policies | Leap/month/year/fiscal tests; UTC only |
| Comparison | Prior period/week/month/quarter/year, equivalent weekdays, custom, none | Available-history coverage warnings; ordinal bucket alignment |
| KPI engine | 35 revenue/ads/traffic/cost/profit/return metrics | Additive reconciliation and derived ratios tested; not source verified |
| Currency | Native USD/CAD/GBP isolation | No FX conversion |
| Chart customization | Four layouts/types, responsive columns, order/width/visibility, crosshair/zoom sync | No analytic fetch on layout/type/order changes; no arbitrary pixel resizing |
| Drill-down / reporting table | Product and bucket dialogs, source rows, search/sort/pagination/columns/totals | Local operations over bounded loaded data; no large server table claims |
| Inventory | Snapshot health, value, velocity, cover, reorder, filters | Synthetic pooled stock, independent of date/channel filters |
| Saved views | Lifecycle, templates, default, relative dates, URL config sharing, backup | Browser-local; no team/account persistence or protected sharing |
| Exports | Raw/table/summary/inventory CSV, native XLSX, chart PNG, print/PDF flow | XLSX CRC/XML validation; table search/total export check |
| Appearance | Light/dark/system, density, sidebar, default home | Browser persistence and mobile overflow checks |
| Production identity and billing | Not connected | Requires real provider contracts and security implementation |
| Legacy feature parity | Unavailable | Await original source and reports |

The public demo APIs contain synthetic data only. They must not be repurposed as a production authorization layer.
