# Architecture

Nuxt 4 / Vue 3 script setup / strict TypeScript, Nuxt UI, Tailwind and Nitro. No new runtime dependency was needed for this expansion. ECharts provides time series. TanStack Table supplies the core, sorted and paginated row models for ReportTable, operating over the bounded already-loaded dataset.

## One analytics contract

`shared/types/analytics.ts` validates all filter inputs and defines products, facts, inventory, series and results. `shared/analytics/metrics.ts` owns all 35 metric definitions and calculations. Monetary source facts use integer minor units. Mixed currencies throw; missing components propagate null; ratios are recomputed from aggregate components. Every module, table and drill-down uses this engine. Presentation never averages segment ratios.

`server/services/analytics.ts` filters source records before grouping. Buckets cannot add out-of-range dates to totals. `server/fixtures/demo.ts` contains only fictional identities and generated records; no real schema is assumed. Facts are deterministic for the same rolling generation date and cached in process. Generated historical values may shift as the rolling demo advances; these are not immutable accounting records.

## APIs and bounds

- `POST /api/analytics`: validated inclusive ISO dates (up to 1096 days); product IDs (max 100); US/CA/UK; Amazon/Shopify; USD/CAD/GBP; brand; daily/weekly/monthly/quarterly/yearly; ISO/Sunday/January/fiscal calendar; fiscal start month; segment/marketplace/channel/product/brand/total breakdown; previous/week/month/quarter/year/weekday/custom/none comparison. Returns totals, previous totals, current/comparison series, groups, source rows, catalog, current inventory and coverage dates. Invalid inputs return 400.
- `GET /api/products?q=`: bounded 100-character query, maximum 20 fixture matches; title/SKU/ASIN/brand/variation and parent SKU/ASIN search. Parent expansion deduplicates child identities.

Both routes set `Cache-Control: no-store`. Production defaults to unavailable data. Explicit server-only `NUXT_DEMO_MODE=true` enables public synthetic fixtures. This is not authentication. Real data requires authenticated server scope and authorization before source integration.

## Client data flow

`useWorkspace` owns a single dataset across module navigation. Only filters fetch analytics. Requests are debounced and aborted when obsolete; obsolete responses cannot overwrite newer results. A five-entry browser-memory cache avoids identical repeat requests. Loading retains previous results with a visible stale-results notice and disables export until the new request succeeds. Invalid input cannot export stale results. Large source-row ranges can produce substantial payloads; this is a bounded demo, not a server-pagination implementation.

Charts register line/bar, grid, tooltips, legends, zoom and the canvas renderer explicitly. Carousel/focus mount one chart; grids use lazy hydration. The shared registry defines labels/formats/definitions. Chart type, width, layout, order, crosshair synchronization and contribution views reuse loaded data. Comparison buckets align ordinally and are labeled accordingly. They are not claimed to reproduce unverified legacy calendar behavior.

## Preferences and delivery

Version 2 Zod-validated workspace and saved-view schemas use browser-local storage. Relative presets resolve again at load. URLs contain demo filter/chart configuration, not reporting records or access grants. Named views can be backed up/restored, but do not synchronize between accounts. Table columns persist separately per module/group. Appearance settings are browser-local.

`shared/analytics/xlsx.ts` writes a small standards-based OOXML ZIP workbook with numeric and inline-string cells and no executable formulas; no spreadsheet parser dependency is shipped. CSV labels its monetary unit and escapes strings. Table exports use matching sorted rows, selected columns and recomputed matching totals. Report Center exports the selected global breakdown. Printing uses a dedicated report-only print stylesheet.

Native currencies remain separate. No external database, ORM, authentication, multi-tenant cache, billing or production provider is invented.

## Year-comparison Overview

`shared/analytics/year-comparison.ts` validates the reference year, 2–3 distinct series years, a same-year date range and existing native-currency/product/brand/channel/market scope. It filters before grouping, clips elapsed dates and returns a compact weekly/monthly matrix without raw records. Weekly buckets start January 1 and never cross calendar years. `POST /api/year-comparison` retains the explicit server-only synthetic gate; the HTML export uses the identical shared function in its browser-only adapter. Overview resolution/legend changes are presentation-only. Its independent preference key stores dates/years/resolution locally; the active range and comparison years are edited in a right-side collapsible panel and applied together. The Overview contains six graphs and no KPI cards, tables, insights, product lists or filter banner.

## Overview marketplace / SKU header controls

`OverviewScopeSelectors` is a controlled, accessible dropdown pair. It reuses the workspace catalog and emits one validated `OverviewSelection`; Single excludes parent containers while Parent lists products with children. All SKUs sends no product restriction. Market/selection preferences have their own versioned local key, so applying calendar changes cannot reset newer SKU choices.

All marketplaces sends an unrestricted market list with explicit demo conversion enabled. `shared/analytics/demo-currency.ts` converts source monetary components with fixed illustrative rates, preserves counts and nulls, and emits integral reporting minor units. `compareYears` then uses the same aggregate engine for profit/ratios. `fxPolicy: synthetic-fixed` identifies converted results. Existing native-only consumers retain their behavior because `convertCurrency` defaults false. This policy is for fictional fixture records, not a production currency adapter. The offline export uses the same code.
