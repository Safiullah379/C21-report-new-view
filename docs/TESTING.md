# Final verification — 2026-11-25

| Command / check | Result |
|---|---|
| pnpm lint | Passed |
| pnpm typecheck | Passed |
| pnpm test | 31 tests, 2 files, passed |
| pnpm build | Passed; 15.3 seconds |
| PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test:e2e | 9 passed; 19.9 seconds |
| Demo-disabled startup on port 3001 | HTML 200; unavailable analytics, empty source/catalog, null totals |
| Downloaded XLSX | ZIP CRCs and every XML part valid; report title included |
| Searched table CSV | Matching product and matching totals only |
| Desktop/mobile screenshots | Reviewed; six mobile module width assertions passed |
| Live Cloud preview | Final Overview visually confirmed |
| Warm synthetic API benchmark | 20 serial requests; see PERFORMANCE_BENCHMARKS.md |

Unit tests cover weighted ratios, money/null/zero/negative handling, all additive totals, profit cost reconciliation, missing financial components, brand/currency/product/parent filtering, alternate breakdown equivalence, custom comparisons, leap days, clamped months, completed/elapsed presets, ISO/Sunday/January/fiscal buckets, weekday alignment, date bounds, unavailable mode, inventory states/reorders, preference validation and inert numeric/string XLSX cells.

Playwright runs the built production bundle with explicit synthetic mode. It verifies all analytics modules, product source dialogs, layout and chart personalization/persistence without new analytics requests, saved-view lifecycle, date/native-currency/empty filters, malformed API rejection, inventory filtering, native Excel download, dark theme persistence, validated backup restore, mobile navigation/width, shared view restoration in a fresh browser, accessible chart-period drill-down, and table CSV matching search/totals.

During development the checks caught an exhaustive Zod chart-map schema and hidden detail panels remaining mounted after close; both were fixed and the final suite passed. One test invocation raced the build; it was discarded and rerun against the completed bundle. No failing tests were disabled or assertions weakened.

Run the standard checks from README. Leave port 3000 free for Playwright's server. Screenshots and downloads are under test-results/ (ignored by Git); the final user-facing screenshot is /workspace/shared/zonhack-complete-demo.jpg. No real production auth, tenant isolation, database correctness, external delivery, Docker execution or hosted deployment is claimed by these checks.

## Standalone HTML export

`node scripts/check-html.mjs /workspace/shared/zonhack-demo.html` passed against the single-file export with offline networking. The test serves only the in-memory document via Playwright routing and aborts all other network requests. It verifies all ten screens, six KPI cards, chart rendering, brand/product filtering, browser-local save/reload, CSV download and 390px mobile width. Zero external requests or page errors. Direct file:// navigation is blocked by this Cloud browser's managed policy; no policy override was attempted. The file uses embedded scripts/styles/data services and hash routing for local browser use.

## Graph-only Overview redesign

39 unit tests across three files pass. Eight new tests cover monthly alignment, missing/future null periods, equal elapsed cutoffs, partial-month labels, January-based weeks, leap year Week 53, no year-boundary double counting, weighted ratios, native currency/parent identity scoping, custom date clipping and request validation. The 10-workflow browser suite passed (26.9s), with an additional focused Overview pass after refinement. Browser assertions verify no KPI/table/filter panels on Overview, six graphs, right-side date panel placement/open/close, year choice and preference restoration, weekly/monthly changes without refetch, invalid API rejection and mobile width.

The exported HTML also passes the offline all-screen workflow, including the new year-comparison adapter. Additional assertions check the Apply button stays visible on desktop/mobile and Overview fits 730px tablet width. The new endpoint's demo-disabled startup smoke returns unavailable mode with empty weekly/monthly matrices. Desktop, panel-open and mobile screenshots were visually reviewed.

## Marketplace and SKU selectors

45 unit tests across four files pass, including six new tests for all-market conversion, counts, immutability, native-only compatibility, marketplace filtering, single/parent/all SKU differences, parent-child deduplication, null/rounding behavior and persisted selector validation. The complete 11-workflow browser suite passed in 32.7s. The new workflow checks the controls occupy the requested header area, native currency update, request scopes, parent and single selection, All resets, refresh persistence, combined market volume and mobile menu visibility/Escape handling. The standalone HTML general offline test also passed.

The dedicated standalone selector test (`scripts/check-overview-selectors-html.mjs`) also passed with networking disabled: dark theme, both dropdowns, All markets, Parent/Single SKU choices, native currency update, reload persistence and mobile menu. Zero external asset requests and zero page errors. Dark-theme screenshots were visually checked.

## GitHub handoff verification

Lint, strict types, 45 unit tests and production build passed. The full 11-workflow browser suite passed in 36.2s. Both offline checks passed against the regenerated checked-in `deliverables/zonhack-demo.html`, with screenshots written to portable `test-results/standalone*` folders. Browser executables are now optional overrides rather than hardcoded machine paths. Current previews were refreshed from these runs. Source/deliverable credential-pattern scanning found no matches. `.github/workflows/ci.yml` runs the same checks on push/PR; hosted CI status must be checked separately after the source push.
