# Changelog

## 2026-11-25 — Overview marketplace and SKU selectors

Added marketplace All/US/Canada/UK and searchable All/Single/Parent SKU dropdowns to the Overview header. Selections update every graph and persist locally. Combined marketplace money uses explicitly labeled illustrative demo FX; ratio recomputation and parent-child deduplication remain shared. Added focused calculation/browser/offline coverage and refreshed the downloadable HTML.

## 2026-11-25 — Graph-only Overview

Redesigned Overview as a continuous surface of six calendar-year comparison graphs, with compact navigation and a right-side collapsible calendar/year panel. Weekly and monthly matrices share weighted calculations, date clipping and missing-value handling. Removed Overview KPI cards, insights, tables and the large filter block. Updated both the built application and offline HTML download. Added year-boundary/calculation tests and browser coverage for the new interaction.

## 2026-11-25 — Demo Workspace 02

Completed the user-requested dummy-data application: populated demo Overview, specialist sales/ads/profit/product modules, inventory snapshot workflows, reporting builder, saved-view lifecycle/templates/sharing/backups, richer calendars/comparisons, 35 reconciled metrics, chart personalization, real Excel/CSV/PNG exports, detail dialogs and responsive light/dark settings. Reused the Nuxt stack with no new runtime dependencies. Production data stays disabled by default. No real auth, external services, legacy parity, remote push or public deployment is claimed.

## 2026-11-25 — Foundation 01

Initialized the empty repository with the approved Nuxt stack, Explorer, isolated demo analytics, default unavailable-data gate, tests and documentation. The original Overview source was not available.
