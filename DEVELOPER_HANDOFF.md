# Developer handoff — start here

This repository contains the complete current Zonhack demo: editable Nuxt/Vue source, synthetic data and calculations, tests, locked dependencies, deployment recipe, screenshots, product requirements and a standalone HTML demo. The UI was reviewed with the owner and refined through several iterations. No live business database or service is connected yet.

## 1. Run the editable application

Use Node **24.22.3** (`.node-version`) and pnpm **11.25.0** (`package.json`).

```sh
git clone https://github.com/Safiullah379/C21-report-new-view.git
cd C21-report-new-view
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm demo
```

Open the address printed by Nuxt. No database or credentials are required. `pnpm demo` explicitly enables synthetic data. `pnpm dev` without `NUXT_DEMO_MODE=true` deliberately returns unavailable analytics; this does not mean the demo source is missing.

For a quick preview without any tool installation, download `deliverables/zonhack-demo.html` and open it in a modern browser. It includes the application code, CSS, charts and dummy-data adapter. The Vue files, not the generated HTML, are the editable source of truth.

## 2. Preserve the accepted design

The approved Overview is a surface of graphs, with these controls:

- Six calendar-year comparison graphs; **Weekly / Monthly** switching.
- **Right-hand collapsible date panel:** reference year, one/two comparison years, date range, calendar, full year/YTD and elapsed-date matching.
- **Central header marketplace selector:** All marketplaces / United States / Canada / United Kingdom.
- **Header SKU selector:** All SKUs / searchable Single SKU / searchable Parent SKU. A parent includes its child variations once.
- Compact icon navigation, light/dark themes and responsive mobile layouts.

Do not restore KPI cards, tables, business-signal cards, product lists or a large filter block on Overview. They remain available in the specialist screens. The other screens are Explorer, Sales Analytics, Advertising, Profitability, Products, Inventory, Reporting Center, Saved Views and Settings.

`deliverables/previews/` contains the latest dark-theme reference screens. `deliverables/history/` contains earlier iterations for context; they are not the current design target.

## 3. Source map

| Area | Location |
|---|---|
| Navigation and specialist modules | `app/pages/index.vue` |
| Overview and date panel | `app/components/YearComparisonOverview.vue` |
| Marketplace / SKU menus | `app/components/OverviewScopeSelectors.vue` |
| Year comparison chart | `app/components/YearComparisonChart.client.vue` |
| Explorer charts / report tables | `app/components/AnalyticsChart.client.vue`, `ReportTable.vue`, `SourceRecords.vue` |
| Inventory / profit / reports / views | Components with corresponding names in `app/components/` |
| Workspace preferences / requests | `app/composables/useWorkspace.ts` |
| Appearance / exports | `app/composables/useAppearance.ts`, `useExports.ts` |
| Styles and themes | `app/assets/css/main.css` |
| API request/result contracts | `shared/types/analytics.ts`, `shared/analytics/year-comparison.ts` |
| Metric definitions and aggregation | `shared/analytics/metrics.ts` |
| Date/calendar/comparison rules | `shared/analytics/calendar.ts`, `year-comparison.ts` |
| Parent-child expansion | `shared/analytics/products.ts` |
| Explicit illustrative FX | `shared/analytics/demo-currency.ts` |
| API routes and analytics service | `server/api/`, `server/services/analytics.ts` |
| Dummy catalog / fact generator | `server/fixtures/demo.ts` |
| Standalone file generator / adapter | `scripts/export-html.mjs`, `scripts/offline-adapter.ts` |
| Full original product brief | `docs/PRODUCT_REQUIREMENTS.md` |

Money source fields use integer minor units. Missing required components and zero denominators produce null, not implied zero. Ratios are calculated from summed components, never by averaging percentages. Parent/child IDs deduplicate through the shared expansion helper. Weeks in Overview start January 1 (January 1–7 is Week 1); this is not ISO week-year grouping. Dates use UTC.

Overview can combine all three markets using clearly labeled, fixed **demo** rates: 1 USD = 1.31 CAD = 0.79 GBP. This policy exists only for synthetic records; it is not a production exchange-rate source. Other analytics remain native-only unless the explicit year-comparison conversion flag is enabled.

## 4. Verify and regenerate the HTML

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
pnpm export:html
pnpm test:html
pnpm test:html:selectors
```

Leave port **3000** free while Playwright runs: the suite starts and stops its own demo server. The HTML exporter temporarily uses **3107**. `pnpm export:html` writes `exports/zonhack-demo.html`; pass a destination path to choose another location. To update the checked-in preview explicitly:

```sh
pnpm export:html deliverables/zonhack-demo.html
```

By default, browser checks use Playwright's installed Chromium. If using an existing compatible system browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its path. Standalone checks write screenshots under `test-results/standalone*`; set `DEMO_SCREENSHOT_DIR` to override. No `/workspace` directory is required on the developer's machine.

The standalone checks fulfill only the HTML document in memory and disable network requests. This validates embedded assets and functionality without relying on a backend. Direct `file://` navigation is blocked by the managed Cloud test browser; no policy bypass was used.

GitHub Actions runs lint, types, unit tests, build, browser workflows and both offline checks. It uploads fresh HTML and test evidence as a build artifact. It does not deploy or enable any live integration.

## 5. Publish a demo

### Node deployment

```sh
pnpm install --frozen-lockfile
pnpm build
NUXT_DEMO_MODE=true HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs
```

Deploy the generated `.output/` to a Node-capable host and use its assigned port. Supply `NUXT_DEMO_MODE=true` explicitly for a synthetic demonstration. Without it, the current server returns unavailable data because a live adapter has not been implemented. A successful optimized build is not evidence that live authentication or reporting is production-ready.

### Container recipe

```sh
docker build -t zonhack-demo .
docker run --rm -p 3000:3000 -e NUXT_DEMO_MODE=true zonhack-demo
```

The Dockerfile uses a non-root Node runtime. Container execution has not been validated in this workspace; build and smoke-test it before selecting it for hosting.

### Static demo

`deliverables/zonhack-demo.html` can be served as a static file or opened directly. It uses hash routing, embeds all dummy data logic, and needs no CDN. Browser-local preferences stay local to each browser. This artifact cannot become a live SaaS merely by adding credentials to the HTML.

No external website has been deployed by this handoff. The developer should choose the hosting account/domain with the owner.

## 6. Finish before connecting real business data

1. Obtain the real database schema/anonymized examples, original reports/source/screenshots and known totals. Audit tenant/account/product identity, calendar, fee/refund/attribution and currency policies. See `docs/DATABASE_REQUIREMENTS.md`.
2. Implement server-authenticated sessions, trusted tenant/account scope, authorization, CSRF protection where needed, isolation tests, rate limits, audit logs and secure configuration. The demo flag and browser filters are not authentication.
3. Implement a read-only source adapter, indexed product search, server-side report pagination/exports and measured caching. Keep one shared calculation engine and reconcile KPI/chart/table/export totals against verified source reports.
4. Replace demo FX and inventory assumptions with verified production policies. Preserve unavailable values where source support is absent.
5. Move saved views/preferences to secure user/team persistence if required; current views are browser-local. Add real integrations, account administration, scheduled delivery and billing only with the chosen providers and approved scope.
6. Add production observability, backups/recovery, deployment configuration and a release checklist, then validate the actual host and user flows.

The initial repository and original Overview source were unavailable, so legacy feature/calculation parity has not been verified. The accepted new Overview design should be preserved while the real business functionality is audited with the owner.

## 7. What is intentionally not committed

`node_modules`, `.nuxt`, `.output`, caches, browser downloads, temporary logs, `.env` secrets, local browser storage and credentials are not source artifacts. Dependencies and builds are reproducible from the lockfile and commands above. `deliverables/zonhack-demo.html` and the preview images are committed so the repo remains independently reviewable without this chat or its Cloud computer.

For the full status and evidence, see `docs/PROJECT_STATUS.md`, `docs/TESTING.md`, `docs/SECURITY.md`, `docs/FEATURE_PARITY.md`, and `docs/DEPLOYMENT.md`.
