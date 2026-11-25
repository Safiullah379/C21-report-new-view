# Zonhack Analytics — complete demo workspace

**Developer: start with [DEVELOPER_HANDOFF.md](DEVELOPER_HANDOFF.md).** It covers the accepted UI, source map, setup, tests, publishing and remaining production work. The latest [standalone HTML](deliverables/zonhack-demo.html) and [preview images](deliverables/previews/) are included in this repository.

A Nuxt 4 / Vue 3 analytics application using clearly labeled **synthetic data**. Includes Overview, Performance Explorer, Sales Analytics, Advertising, Profitability, Products, Inventory, Reporting Center, Saved Views and Settings.

## Run the demo

Requires Node >=22.12 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm demo
```

Open the URL printed by Nuxt. `pnpm demo` explicitly enables the dummy dataset. No database, credentials or external services are needed. To build and run the demo as a production bundle:

```sh
pnpm build
NUXT_DEMO_MODE=true HOST=0.0.0.0 PORT=3000 pnpm preview
```

`pnpm dev` and production startup without `NUXT_DEMO_MODE=true` return an unavailable data state. This deliberate default prevents synthetic records from being confused with connected business data.

On Cloud machines with a read-only home, prefix install commands with `XDG_DATA_HOME=/workspace/.cache/data XDG_CACHE_HOME=/workspace/.cache npm_config_cache=/workspace/.cache/npm`.

## Explore

- **Overview:** graphs only, comparing calendar years by week or month; top-bar marketplace selection (All / US / Canada / UK) and searchable Single / Parent / All SKU selection; compact navigation and a collapsible date/calendar panel on the right. Up to three years, matched elapsed dates, partial-period tooltips and native currencies.
- **Explorer:** SKU/ASIN/title/brand/parent search; multi-product selection; date, brand, marketplace, channel and native currency filters; six breakdown choices; daily through yearly granularity.
- **Analysis:** 35 shared metrics covering revenue, ads, traffic, costs, profits, returns and ratios. Sparklines, previous values, metric-aware changes and percentage-point differences.
- **Charts:** carousel/grid/focus/compact, 1–4 responsive columns, metric selection/order, drag and keyboard reordering, width controls, persistent line/area/bar/stacked choices, legend controls, crosshairs, zoom/reset, full screen, contribution percentages, PNG and CSV. Accessible source-period controls and chart point drill-down.
- **Reporting:** searchable/sortable product, daily and segment tables; pagination; remembered column visibility; matching totals; table CSV/Excel exports matching the search, columns and sort. Source records and product detail dialogs.
- **Inventory:** pooled current stock, inbound/reserved units, native-currency valuation, 30-day velocity, days cover, health filters, suggested reorders and CSV export.
- **Saved views:** create, open, update, rename, duplicate, delete, default, eight templates and configuration links. Relative presets remain relative. Views are browser-local, with validated JSON backup/restore.
- **Reports:** executive, sales, advertising and profit-and-loss summaries; editable title/notes; real `.xlsx`, summary/detail/inventory CSV and print/Save as PDF.
- **Settings:** light/dark/system themes, density, collapsible sidebar, start page, workspace/data explanations and backups.

Ten sellable products, one parent collection, three fictional brands, US/CA/UK markets and Amazon/Shopify channels. Five years of generated source history supports reporting ranges of up to 1096 days. Inventory is a current pooled snapshot; its date/channel independence is labeled. Money and ratios are reconciled by the same shared engine. Other report modules keep native currencies separate. The Overview marketplace selector explicitly converts synthetic records using the displayed demo-only rates (1 USD = 1.31 CAD = 0.79 GBP) when combining markets.

## Verify

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm export:html
pnpm test:html
pnpm test:html:selectors
```

Playwright launches its own built demo server on port 3000; leave that port free. If system Chromium is unavailable, install Playwright's Chromium with `pnpm exec playwright install chromium` and omit the executable override. With a separate demo server running, use `pnpm benchmark` for a loopback API benchmark.

## Scope

This is a complete **demo application**, not a live commercial service. No real authentication, tenant permissions, database adapter, external synchronization, billing or scheduled delivery is connected. The Overview is a new demo design; the original application's source was unavailable, so legacy parity is not claimed. Before real data, complete the source/identity audit and security work described in `docs/SECURITY.md` and `docs/DATABASE_REQUIREMENTS.md`.

See `docs/PROJECT_STATUS.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/KPI_DEFINITIONS.md` and `docs/DEPLOYMENT.md`.

## Downloadable standalone HTML

Build once, then package the actual application into one self-contained HTML file:

```sh
pnpm build
pnpm export:html
```

The file is written to `exports/zonhack-demo.html`. Pass a destination path to `pnpm export:html` to change it. The exporter briefly uses local port 3107 and shuts its server down when finished. Open the resulting HTML in a modern browser; no Node server, CDN, account or internet connection is needed to run the demo. Scripts, styles, chart code, and the same synthetic fixture/calculation service are embedded. Local preferences remain browser-local. This file is a demonstration, not a live service or an internet-hosted share link.
