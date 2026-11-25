# Project status — 2026-11-25

## GitHub developer handoff

The owner authorized saving the complete project to `Safiullah379/C21-report-new-view` for their developer to finish and publish. The repository includes the editable application, all synthetic fixtures and shared calculations, original product brief, locked dependencies, tests, runtime/build configuration, Docker recipe, current standalone HTML, current preview images and earlier design screenshots. Start with `DEVELOPER_HANDOFF.md`. Generated dependency folders, caches, secrets and machine-specific browser state are excluded.

Added `.node-version`, a CI workflow, portable offline test paths and `test:html` / `test:html:selectors` commands. Browser scripts use Playwright-managed Chromium by default; an explicit executable override remains supported. Checks write to `test-results/` rather than requiring a Cloud-only path. The checked-in offline demo is `deliverables/zonhack-demo.html` and can be regenerated from the same source. The original uploaded brief matches `docs/PRODUCT_REQUIREMENTS.md` exactly.

Local handoff verification passed: lint, strict types, 45 unit tests, production build (15.2s), all 11 browser workflows (36.2s) and both standalone offline workflows. A credential-pattern scan found no matches in source or deliverables. Docker execution and live production services remain unverified. GitHub CI is configured; local passing checks do not claim a completed hosted CI run. The handoff guide explicitly lists the remaining authentication, tenant, database, reconciliation and deployment work.


## Current header selectors — marketplace and SKU

Added two compact dropdown controls in the central Overview header area identified in the user's screenshot. Marketplace offers All marketplaces, United States, Canada and United Kingdom. SKU offers All SKUs, searchable Single SKU and searchable Parent SKU; parent selections include all child variations once. Both selectors update all six year-comparison graphs and persist locally. Menus support Escape, outside-click dismissal, light/dark themes and responsive widths. The Overview remains graph-only.

All marketplaces genuinely includes the three native currencies rather than silently restricting to USD. An explicit `convertCurrency` flag uses illustrative synthetic rates (1 USD = 1.31 CAD = 0.79 GBP), converts each source monetary field to integer reporting minor units, and recomputes weighted ratios from the combined components. The menu labels the demo FX policy. Selecting one marketplace defaults to its native currency; the date panel still allows another reporting currency using the same labeled demo policy. Existing endpoints remain native-only unless the year-comparison flag is explicitly enabled; no live FX provider or real financial policy was added.

New files: `app/components/OverviewScopeSelectors.vue`, `shared/analytics/overview-selection.ts`, `shared/analytics/demo-currency.ts` and `tests/unit/overview-selection.test.ts`. Updated Overview integration, shared year comparison, styles, browser tests and standalone checks. Catalog data is reused from the loaded workspace; search adds no catalog API requests.

Validation: lint, strict type checking, 45 unit tests (four files), production build and all 11 browser workflows passed. New assertions cover header placement, all-market totals, native/converted scoping, weighted ratios, parent/child deduplication, all/single/parent selection, currency updates, reload persistence and mobile menu width. The general standalone offline workflow also passed with zero external asset requests or page errors.

Latest download: `/workspace/shared/zonhack-marketplace-sku.html` (about 1.99 MB). Prior HTML download names are refreshed. Dark-theme previews show the controls and their marketplace/SKU menus.

## Current Overview — graph-only redesign

The user rejected the prior dashboard layout and requested only graphs, with a collapsible date picker on the right and yearly comparisons by week or month. Overview now renders six comparison graphs on a continuous plotting surface with a compact icon rail. The prior Overview KPI cards, large filter bar, business signals, top-product list, profit bridge, promotional headings and footer are removed from this page. Other analytics modules retain their workflows. A small demo label identifies synthetic data.

The top-right date control opens a collapsible calendar panel containing reference year, up to two comparison years, date range, calendar month navigation, full-year/YTD presets, matched elapsed dates and reporting currency. An Apply action commits date/year choices. The panel is responsive and keeps Apply visible while its contents scroll. Weekly/monthly switching and chart legend toggles reuse the returned dataset. Overview preferences persist locally.

A shared validated year-comparison engine powers both the Nitro endpoint and standalone HTML. Monthly points align by calendar month; weekly points align by January 1-based week number (1–53), with no cross-year double counting. Weighted metrics are recalculated from source components. Missing/future periods stay null; partial periods include actual date boundaries in tooltips. The default compares the current year with the previous year, matching available elapsed dates.

Files: `app/components/YearComparisonOverview.vue`, `YearComparisonChart.client.vue`, `shared/analytics/year-comparison.ts`, `server/api/year-comparison.post.ts`, plus main-page integration, styles, offline adapter, tests and docs.

Verification: lint, strict types, 39 unit tests and production build passed. The full 10-workflow browser suite passed in 26.9 seconds; the focused Overview workflow passed after visual refinement. Standalone HTML passes all-screen offline checks, new graph rendering, panel open/close, weekly/monthly switching, tablet/mobile width, visible Apply button, filters, saves and exports with no external requests/page errors. The new endpoint's demo-disabled gate returns unavailable mode and empty weekly/monthly data.

Updated download: `/workspace/shared/zonhack-graphs.html` (about 1.98 MB). The previous `zonhack-demo.html` download is also refreshed. `/workspace/shared/zonhack-graphs-preview.png` shows the right-side panel. No external integrations or production access were added.


## Completed

The user explicitly authorized finishing the application using dummy data. The local demo is implemented and running, with no database or external credentials required. All figures are prominently labeled synthetic.

Ten workspace screens: new demo Overview, Performance Explorer, Sales Analytics, Advertising, Profitability, Products, Inventory, Reporting Center, Saved Views and Settings. The original Overview source remains unavailable; the demo does not claim to reproduce it.

The fixture catalog contains ten sellable products and one parent collection across three fictional brands, US/CA/UK markets and Amazon/Shopify channels. Five years of rolling generated source history supports reporting ranges up to 1096 days, plus comparisons. Inventory includes native-currency stock values, inbound/reserved stock, velocity, cover, health and suggested reorders.

Features include 35 shared metrics; financial reconciliation across KPI/chart/table/report; 19 date choices; four week policies; daily through yearly granularity; eight comparison choices; six dimension breakdowns; 4 chart layouts/types; responsive columns; metric order, visibility, drag/keyboard reordering and chart width/type persistence; synchronized crosshairs/zoom; comparison lines; contribution percentages; PNG/CSV; accessible period and product source dialogs; TanStack sorting/pagination; report search, column visibility and matching totals; raw/table/summary/inventory CSV; real Excel workbooks; report title/notes and print/PDF flow; complete local saved-view lifecycle, eight templates, configuration links, defaults and validated backups; light/dark/system theme, density, collapsible sidebar and start-page preferences.

## Files changed

- `app/pages/index.vue`: complete workspace navigation, reusable filters, modules, customization and dialogs.
- `app/components/`: AppIcon, KpiCards, AnalyticsChart, ReportTable, SourceRecords, InventoryPanel, ProfitBridge, SavedViews and ReportingCenter; retained ProductSearch and original table component.
- `app/composables/`: workspace state/cache/requests/preferences, exports and appearance.
- `shared/types/analytics.ts`, `shared/analytics/`: extended contracts, 35 metric definitions, calendars/comparisons, workspace registry, validated saved views and native XLSX writer.
- `server/fixtures/demo.ts`, `server/services/analytics.ts`, `server/api/`: richer deterministic fixtures, aggregation, filter validation, coverage and inventory snapshot.
- `app/assets/css/main.css`: responsive layout, themes, charts/tables/settings/report styles and print output.
- `package.json`: explicit `pnpm demo` entry point. No new runtime dependencies.
- Tests, README, AGENTS and project docs updated to describe the actual demo and its boundaries. Source files formatted for review.

## Architecture decisions

Retained Nuxt 4/Vue 3/TypeScript/Nuxt UI/Tailwind/Nitro/ECharts/TanStack/pnpm. One shared calculation engine serves every view; money uses integer source minor units, missing values propagate null, ratios derive from components, and native currencies are never silently combined. Defaults still return unavailable data unless `NUXT_DEMO_MODE=true`. Fixture mode is not production authentication.

One loaded dataset survives module, layout and chart switches. Filter changes debounce/cancel requests. A five-entry in-memory client cache avoids repeat filter requests. Browser-local preferences and configuration links contain demo settings only. Table operations are bounded local operations over the loaded data. Native XLSX generation requires no additional runtime package.

## Validation and testing

Final verification on this source state:

| Check | Actual result |
|---|---|
| `pnpm lint` | Passed |
| `pnpm typecheck` | Passed |
| `pnpm test` | 31 tests passed across 2 files |
| `pnpm build` | Passed, 15.3 seconds |
| System Chromium Playwright | 9 workflows passed, 19.9 seconds |
| Demo-disabled startup smoke | HTML 200; unavailable analytics, null sales, empty rows and catalog |
| Downloaded Excel | ZIP CRCs, all XML parts and report-title metadata validated |
| Filtered table CSV | Only searched product plus matching total; browser check passed |
| Desktop/mobile screenshots | Visually inspected; mobile overflow assertions passed on six screens |
| Live Cloud browser | Completed Overview loaded and left available |
| Real database / financial source reconciliation | Not applicable to dummy-data scope; not performed |
| Docker execution / production tenant isolation | Not implemented or verified |

Browser tests cover every analytics module, source details, layout/type/order persistence without analytics refetch, product selection, saved-view create/duplicate/rename/default/delete/update access, date and currency filters, malformed APIs, empty states, inventory status filtering, report download, theme persistence, backup/restore, six mobile screens, shared links in a fresh browser and searched table exports.

## Performance

Final warm 30-day synthetic loopback API sample: 20 measured requests, median 80.10 ms, p95 97.07 ms, 312,823-byte JSON response. This measures serial local HTTP with synthetic fixtures; it is not a production database/concurrency or browser interaction benchmark. Layout/type/order browser assertions confirm zero analytics requests for those presentation changes.

Build reports 1.46 MB total client assets (436.53 kB gzip across assets), with a chart chunk above the 500 kB warning threshold. The dependency module also emits an addCustomTab deprecation warning. Neither prevents the build. Large historical ranges still return raw source rows and can be substantial; scalable live reporting requires server pagination/exports and measured indexing/caching.

## Known limits and database requirements

This is an end-to-end dummy-data demo, not a connected commercial service. Real authentication/sessions, tenant permissions/isolation, business database adapter, external source synchronization, subscriptions/billing, account/team view persistence, scheduled delivery and production hardening remain outside the fictional data path. No real provider actions, charges, remote push or public deployment were performed.

Views and table settings are local to this browser; shared links carry configurations, not access control. All dates are UTC. No FX conversion, hourly data, campaign-specific taxonomy, arbitrary 4-4-5 calendars, pixel chart resizing or high-volume table/search claims. Comparison chart buckets align ordinally; exact legacy reporting week parity is not asserted. Inventory is a current pooled snapshot, independent of report date/channel filters. Partial source-history coverage is explicitly indicated.

Real integration still needs the original application/source/screenshots, read-only database schema and anonymized samples, trusted organization/account/product identity mappings, reporting/attribution/fee/refund/currency policies and known totals. See DATABASE_REQUIREMENTS.md and SECURITY.md.

## Run / next steps

`pnpm demo` starts the self-contained dummy-data application. For a built demo use `NUXT_DEMO_MODE=true HOST=0.0.0.0 PORT=3000 pnpm preview`. The completed production bundle is currently serving on the Cloud computer, with the Overview open in its shared browser. A hosted HTTP preview port is not configured; Cloud localhost is not a URL for the user's own device. No external deployment is claimed.

The next production phase is source/identity auditing followed by secure server sessions/tenant scope and a read-only adapter, with real report reconciliation before enabling live business records. The local demo does not depend on that future work.

## Standalone HTML delivery — 2026-11-25

The user requested an HTML file. Added `scripts/export-html.mjs`, a browser-only `scripts/offline-adapter.ts`, and `scripts/check-html.mjs`, plus `pnpm export:html` and README instructions. The exporter bundles the actual built Vue/Nuxt application, all CSS/chunks/ECharts code and the same synthetic fixture/calculation services into one HTML document, using hash routing for local opening. Normal production APIs and their demo gate are unchanged.

Delivered artifact: `/workspace/shared/zonhack-demo.html` (approximately 1.95 MB); preview: `/workspace/shared/zonhack-html-preview.png`. Offline validation passed all ten navigation screens, embedded charts, brand/product filters, saved views, CSV download, reload persistence and mobile width, with networking disabled and no external asset requests or page errors. Managed Cloud browser policy blocks direct file:// navigation, so the test fulfills only the HTML document in memory at a localhost test origin; it does not bypass that policy or claim a direct-file browser test.

Lint, strict type checking, 31 unit tests and the production build passed after adding the exporter. No new runtime dependency was added. Regenerate with `pnpm build` followed by `pnpm export:html [destination]`.
