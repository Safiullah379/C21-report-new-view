# MASTER PROJECT PROMPT — ZONHACK ANALYTICS SAAS

## 1. Your role

Act as a senior SaaS architect, full-stack Nuxt/Vue.js developer, UI/UX designer, database engineer, performance optimization specialist, data visualization engineer, Amazon marketplace analytics expert, and DevOps engineer.

You are responsible for developing, improving, testing, documenting, and maintaining a production-ready e-commerce business intelligence SaaS platform.

Treat this as a long-term commercial software product, not a temporary prototype or a basic reporting dashboard.

Think like a product owner as well as a software engineer. Proactively identify opportunities to improve functionality, usability, architecture, data accuracy, and performance.

---

## 2. Project objective

Build a modern, scalable, extremely fast, multi-tenant e-commerce analytics and reporting SaaS platform based on the existing application:

Reference application:
https://casual21.zonhackreports.com/

The objective is to replicate the existing application's verified business functionality while significantly improving:

- UI/UX design
- Dashboard functionality
- Data visualization
- Product-level analytics
- Marketplace-level analytics
- Cross-channel analytics
- Reporting flexibility
- Database performance
- Application speed
- Scalability
- User customization
- Security
- Maintainability

I will provide the existing database, database schemas, sample data, application source files where available, screenshots, and additional business requirements throughout development.

Use the existing application as a functional reference, not as a design or architectural limitation.

The final product should be substantially better than the existing platform.

### Project priorities

In order of importance:

1. Speed and responsiveness
2. Data and financial accuracy
3. Analytical functionality
4. User experience
5. Visual design
6. Scalability
7. Maintainability

Security and tenant isolation are mandatory requirements throughout development and must never be compromised for speed.

---

## 3. Technology stack

Use the following technology stack:

| Component | Technology |
|---|---|
| Full-stack framework | Nuxt 4 |
| Frontend | Vue.js 3 |
| Language | TypeScript |
| Vue architecture | Composition API and script setup |
| UI components | Nuxt UI |
| Styling | Tailwind CSS |
| State management | Pinia where necessary |
| Backend | Nuxt Nitro |
| API architecture | REST API |
| Database | Existing database initially, subject to audit |
| Preferred new database | PostgreSQL |
| ORM | Drizzle or Prisma, depending on compatibility |
| Charting | Apache ECharts |
| Data tables | TanStack Table for Vue |
| Validation | Zod |
| Caching | Nitro caching / Redis where justified |
| Authentication | Secure session-based authentication |
| Package manager | pnpm |
| Unit testing | Vitest |
| End-to-end testing | Playwright |
| Deployment | Docker-compatible |
| Version control | Git |

Use stable, compatible dependency versions.

Do not use React, Next.js, or Angular.

Prefer native Nuxt and Vue capabilities before introducing additional libraries.

Do not introduce unnecessary dependencies that increase bundle size, maintenance complexity, or infrastructure costs.

If the current project already uses compatible technologies, preserve working implementations instead of unnecessarily rebuilding them.

---

## 4. Existing application audit

Before making significant architectural or functional changes:

1. Inspect the entire existing project.
2. Read AGENTS.md and all existing documentation.
3. Understand the current application architecture.
4. Inspect existing dashboard components.
5. Review the database schema and existing API endpoints.
6. Identify existing reporting functionality.
7. Understand existing KPI calculations.
8. Identify performance bottlenecks.
9. Identify reusable components and services.
10. Identify missing functionality and design weaknesses.

Where authorized access to the reference application is available, inspect:

- Navigation
- Dashboard pages
- Reporting pages
- Date filters
- Product filters
- Marketplace filters
- Existing tables
- Existing charts
- Export functionality
- User permissions
- Calculation logic
- Reporting workflows

Create a feature parity matrix documenting:

- Existing feature
- Existing behavior
- Proposed implementation
- Planned improvement
- Implementation status
- Validation status

Do not claim to have inspected functionality or resources that are unavailable.

Clearly distinguish verified functionality from assumptions and proposed enhancements.

---

## 5. Preserve the existing dashboard

This is an important requirement.

Do not remove or replace the existing dashboard.

The application must support multiple dashboard experiences.

### Dashboard 1: Overview Dashboard

Preserve the existing dashboard design, layout, reporting functionality, tables, and KPI cards.

Improve its speed and usability where possible without unnecessarily changing its appearance or breaking existing functionality.

### Dashboard 2: Performance Explorer

Develop an entirely new, modern, graph-driven, interactive analytics dashboard.

The current dashboard is too static and does not provide enough visual analysis.

The new Performance Explorer must allow users to investigate the complete performance of a product, SKU, ASIN, parent product, brand, marketplace, or sales channel from a single workspace.

### Dashboard switcher

Provide a prominent dashboard selector:

- Overview
- Performance Explorer
- My Saved Views

Allow users to switch between dashboards instantly.

Remember the user's last selected dashboard.

Allow users to set their preferred default dashboard.

Both dashboards should share the same backend services, database access layer, calculation engine, and reporting utilities.

Do not maintain separate business logic for each dashboard.

---

## 6. Performance Explorer — Main dashboard concept

The new dashboard should be a powerful, visually engaging analytics workspace.

A user should be able to:

1. Search for a specific SKU, ASIN, or parent product.
2. Select one or multiple products.
3. Select a date range.
4. Select marketplaces and sales channels.
5. Instantly view all relevant performance metrics.
6. Compare performance across marketplaces and channels.
7. Compare against previous periods.
8. Arrange charts according to their preferences.
9. Save the resulting dashboard configuration.
10. Drill down into underlying data.

The user should not need to navigate through multiple pages to understand the complete performance of a product.

Everything should be accessible from one centralized analytics workspace.

---

## 7. Universal product search

Create a prominent, extremely fast product search component at the top of the Performance Explorer.

Support searching by:

- SKU
- Merchant SKU
- ASIN
- Parent ASIN
- Child ASIN
- Product title
- Product name
- Brand
- Product group
- Product identifier
- Other identifiers supported by the existing database

Search results should display, where available:

- Product thumbnail
- Product title
- SKU
- ASIN
- Parent ASIN
- Brand
- Available marketplaces
- Product variation
- Product status

Support:

- Single-product selection
- Multiple-product selection
- Parent product selection
- Individual child variation selection
- Entire brand selection
- Product group selection
- All products
- Recently viewed products
- Recently searched products
- Keyboard navigation
- Search result highlighting
- Clear all selections

When selecting a parent ASIN or parent product, automatically include all associated child products.

Ensure that selecting a parent and one of its children simultaneously does not double-count sales or expenses.

Provide an expandable parent-child product structure.

Example:

Parent Product A

- SKU-A-BLACK-S
- SKU-A-BLACK-M
- SKU-A-BLACK-L
- SKU-A-WHITE-S
- SKU-A-WHITE-M
- SKU-A-WHITE-L

Users must be able to analyze the entire parent product or individual variations.

Product identity must be correctly mapped across marketplaces and sales channels.

Do not assume that identical SKU strings always represent the same product across different accounts.

Use indexed server-side search, request cancellation, result caching, and appropriate debouncing.

The search must remain fast even when the database contains tens of thousands of products.

---

## 8. Global filter bar

Create a compact, sticky, reusable global filter bar.

Include:

- Organization
- Client
- Brand
- Seller account
- Product / SKU / ASIN / Parent ASIN
- Marketplace
- Sales channel
- Date range
- Comparison period
- Reporting currency
- Time granularity
- Dashboard layout
- Saved dashboard view

All KPI cards, charts, tables, and reporting sections must respond consistently to these filters.

Support multi-select filters where applicable.

Allow users to:

- Clear individual filters
- Reset all filters
- Save filter combinations
- Restore previous filters
- Share filtered dashboard URLs where authorized
- Bookmark frequently used configurations

Use URL query parameters where appropriate so that refreshing the page does not lose the current analysis.

Avoid unnecessarily refetching data when filters have not changed.

---

## 9. Advanced date range and reporting calendar

Create a professional date range selector.

Support:

- Today
- Yesterday
- Last 7 days
- Last 14 days
- Last 30 days
- Last 60 days
- Last 90 days
- Last 180 days
- Last 365 days
- This week
- Previous week
- This month
- Previous month
- This quarter
- Previous quarter
- This year
- Previous year
- Week to date
- Month to date
- Quarter to date
- Year to date
- Custom date range
- All available history

Support the existing application's custom weekly reporting calendar.

The previously discussed reporting calendar appears to start Week 1 on January 1.

Example:

| Week | Date range |
|---|---|
| Week 1 | January 1–7 |
| Week 2 | January 8–14 |
| Week 3 | January 15–21 |
| Week 4 | January 22–28 |
| Week 5 | January 29–February 4 |

Verify this behavior against the existing application and source data before implementing it as the default.

Support configurable reporting calendars:

- January 1-based weeks
- ISO Monday–Sunday weeks
- Sunday–Saturday weeks
- Custom fiscal calendars
- Calendar months
- Calendar quarters
- Calendar years

Correctly handle:

- Leap years
- Week 53
- Cross-year reporting
- Partial weeks
- Partial months
- Time zones
- Marketplace-specific reporting dates
- Missing reporting dates
- Overlapping reporting periods

Prevent annual double counting when a reporting week overlaps the following year.

All date calculations must be centralized in a reusable, tested reporting calendar engine.

---

## 10. Period comparison engine

Allow users to compare any selected reporting period against:

- Previous period
- Previous week
- Previous month
- Previous quarter
- Previous year
- Same date range last year
- Same reporting week last year
- Equivalent weekdays last year
- Custom comparison date range

Display:

- Current period value
- Comparison period value
- Absolute difference
- Percentage difference
- Trend direction

For percentage-based KPIs, support percentage-point differences where appropriate.

Allow users to compare 2025 vs. 2026 side by side at daily, weekly, monthly, quarterly, and annual levels.

Example:

| Week | 2025 Sales | 2026 Sales | Difference | YoY % |
|---|---:|---:|---:|---:|
| Week 1 | Value | Value | Value | Value |
| Week 2 | Value | Value | Value | Value |
| Week 3 | Value | Value | Value | Value |

Provide a clear indication when comparing an incomplete current period against a completed historical period.

Allow equivalent elapsed-period comparisons.

All comparison logic must use the centralized date and calculation engines.

---

## 11. Time granularity

Allow users to change chart and reporting granularity:

- Hourly, where supported
- Daily
- Weekly
- Monthly
- Quarterly
- Yearly

Automatically recommend or select the most appropriate granularity based on the selected date range.

For example:

- Last 7 days: daily
- Last 30 days: daily
- Last 90 days: daily or weekly
- Last 365 days: weekly or monthly
- Multiple years: monthly or quarterly

Allow manual overrides.

Avoid rendering thousands of unnecessary chart points.

Preserve analytical accuracy when aggregating data.

---

## 12. KPI summary cards

At the top of the Performance Explorer, create compact, customizable KPI cards.

Default primary KPIs:

- Total Sales
- Net Sales
- Advertising Spend
- Units Sold
- Total Orders
- Net Profit
- Net Profit Margin
- ROI
- ACOS
- TACOS
- ROAS
- Conversion Rate

Each KPI card should support:

- Metric title
- Current period value
- Comparison period value
- Absolute change
- Percentage change
- Percentage-point change where applicable
- Mini sparkline
- Performance indicator
- Metric definition tooltip
- Expandable detailed chart

Make KPI cards interactive.

Clicking a KPI card should open or focus its corresponding detailed chart.

Allow users to:

- Show or hide KPI cards
- Rearrange KPI cards
- Resize where appropriate
- Select preferred metrics
- Save KPI configurations

Do not create excessively large cards that waste screen space.

Use metric-aware performance indicators.

For example, increased sales or profit may be favorable, while increased ACOS or refund rates may be unfavorable depending on business context.

Do not blindly use green for every positive numerical change.

---

## 13. Interactive performance charts

Charts are a central requirement of the new dashboard.

Do not build another dashboard dominated by static numbers and tables.

Use professional, highly interactive time-series visualizations.

### Sales and revenue charts

- Total sales
- Gross sales
- Net sales
- Organic sales
- Advertising sales
- Sales by marketplace
- Sales by channel
- Sales by brand
- Sales by product
- Sales growth
- Average order value
- Average selling price

### Advertising charts

- Advertising spend
- Advertising sales
- Advertising orders
- Advertising units
- ACOS
- TACOS
- ROAS
- Impressions
- Clicks
- CTR
- CPC
- Advertising conversion rate
- Organic versus paid sales
- Sponsored Products performance
- Sponsored Brands performance
- Sponsored Display performance

### Product performance charts

- Units sold
- Total orders
- Sessions
- Page views
- Conversion rate
- Average selling price
- Refunds
- Returns
- Refund rate
- Return rate
- Product performance trends

### Profitability charts

- Gross profit
- Net profit
- Gross profit margin
- Net profit margin
- ROI
- Contribution margin
- Cost of goods sold
- Amazon fees
- Fulfillment expenses
- Storage fees
- Referral fees
- Refund costs
- Promotional expenses
- Total operating costs

### Inventory charts

Where reliable inventory data exists:

- Available inventory
- Inbound inventory
- Reserved inventory
- Inventory velocity
- Days of inventory remaining
- Stockout risk
- Overstock risk
- Inventory value
- Restock requirements

Only expose metrics supported by verified source data.

Never fabricate financial data or display unsupported metrics as zero.

---

## 14. Cross-marketplace and cross-channel charts

This is one of the most important requirements.

When a user searches for a specific SKU, ASIN, parent ASIN, or product group and selects a date range, they must be able to see performance across all applicable marketplaces and sales channels in unified charts.

Example:

A user selects Parent Product A and the last 90 days.

The Sales chart should display separate time series for:

- Amazon US
- Amazon UK
- Amazon Germany
- Amazon Canada
- Amazon France
- Amazon Italy
- Amazon Spain
- Other connected marketplaces

Where available, users should also be able to analyze:

- Shopify
- Walmart
- eBay
- TikTok Shop
- Other connected sales channels

Keep marketplace and sales channel as separate dimensions.

The same breakdown functionality should be available for:

- Sales
- Advertising spend
- Advertising sales
- Units sold
- Orders
- Net profit
- Profit margin
- ROI
- ACOS
- TACOS
- ROAS
- Conversion rate
- Refunds
- Other supported KPIs

Each marketplace or channel should have a consistent color across the entire application.

Allow users to:

- Show or hide individual marketplaces
- Show or hide individual channels
- Compare selected marketplaces
- Display combined totals
- Display marketplace breakdowns
- Display channel breakdowns
- Display product breakdowns
- Display stacked totals
- Toggle between absolute and percentage contribution
- Drill down into individual marketplaces

Do not combine multiple currencies without a verified conversion policy.

Allow reporting currency selection where appropriate.

For combined profitability ratios, recompute from underlying aggregated monetary values rather than averaging marketplace percentages.

---

## 15. Chart interaction capabilities

All relevant charts should support:

- Interactive tooltips
- Multiple data series
- Clickable legends
- Series visibility controls
- Time-series zoom
- Date range selection
- Hover crosshairs
- Period comparison
- Expand to full screen
- Chart type selection
- Download underlying data
- Export as an image
- Drill-down
- Reset zoom
- Clear selection

Support suitable chart types:

- Line charts
- Area charts
- Grouped bar charts
- Stacked bar charts
- Combination charts
- Scatter plots
- Waterfall charts
- Heatmaps
- Donut charts where analytically useful

Line charts should be the default for time-series performance analysis.

Allow users to select different chart types without unnecessarily refetching data.

Provide synchronized crosshairs and synchronized date selections across charts where practical.

For example, hovering over November 15 in the Sales chart should optionally highlight November 15 in the Profit, Advertising Spend, and Units Sold charts.

Use chart animations sparingly.

Speed and readability are more important than decorative visual effects.

---

## 16. Dashboard layout modes

The Performance Explorer must support multiple interchangeable dashboard layouts.

### Mode A — Carousel View

Display one primary chart at a time.

The active chart should use the available space for detailed analysis.

Provide metric tabs such as:

Sales | Ad Spend | Units Sold | Orders | Net Profit | Net Margin | ROI | ACOS | TACOS | ROAS

Allow navigation through:

- Previous and next buttons
- Metric tabs
- Keyboard shortcuts
- Mobile swipe gestures

Display the currently selected metric clearly.

Keep all selected filters unchanged when switching between metrics.

Do not automatically rotate charts.

Users must remain in control.

For performance, mount only the active chart and optionally preload adjacent charts when beneficial.

### Mode B — All Charts / Grid View

Display all selected charts simultaneously.

Support:

- One-column layout
- Two-column layout
- Three-column layout
- Four-column layout where screen width permits
- Responsive automatic layouts
- Drag-and-drop arrangement
- Show or hide charts
- Chart resizing
- Chart expansion
- Full-screen mode
- Custom chart ordering

The default desktop layout should be compact and information-dense.

Do not render every off-screen chart immediately.

Use progressive rendering and lazy mounting.

### Mode C — Focus View

Allow users to expand any chart into a dedicated analytical workspace.

Include:

- Large interactive chart
- KPI summary
- Marketplace breakdown
- Channel breakdown
- Current versus comparison period
- Underlying data table
- Product-level details
- Download and export controls

Provide an easy way to return to the previous dashboard layout without losing the selected filters.

### Mode D — Compact View

Provide a lightweight, information-dense view for users who want maximum data visibility with minimal screen usage.

Use:

- Smaller KPI cards
- Compact charts
- Reduced spacing
- Minimal chart decorations
- Efficient table layouts

### Layout switcher

Create a clearly visible dashboard layout toggle:

Carousel | Grid | Focus | Compact

Switching between views must feel instant.

Layout changes must not trigger unnecessary database requests.

Reuse the already-loaded analytical dataset wherever possible.

---

## 17. Custom dashboard builder

Create a flexible dashboard personalization system.

Users should be able to:

- Add charts
- Remove charts
- Reorder charts
- Resize charts
- Change chart types
- Choose displayed KPIs
- Configure marketplace breakdowns
- Configure channel breakdowns
- Configure comparison periods
- Change chart layouts
- Customize chart visibility
- Restore default layouts

Implement a configurable chart registry.

Every chart should be defined by reusable configuration rather than requiring a completely separate implementation.

The chart registry should include:

- Metric identifier
- Metric name
- Description
- Data type
- Display format
- Available chart types
- Supported reporting dimensions
- Aggregation behavior
- Default visualization
- Comparison support
- Required data fields

Adding a new supported metric should not require rebuilding the entire dashboard.

---

## 18. Saved dashboard views

Allow users to create and save their own dashboard configurations.

Provide default saved views such as:

- Executive Overview
- Sales Performance
- PPC Performance
- Product Profitability
- Marketplace Comparison
- Channel Comparison
- Parent ASIN Analysis
- SKU Performance
- Inventory Analysis
- YoY Performance
- Financial Overview

Each saved view should remember:

- Dashboard layout
- Selected KPIs
- Visible charts
- Chart order
- Chart sizes
- Chart types
- Selected products
- Selected brands
- Selected marketplaces
- Selected sales channels
- Date range preferences
- Comparison settings
- Reporting granularity
- Reporting currency

Allow users to:

- Create views
- Rename views
- Duplicate views
- Edit views
- Delete views
- Set a default view
- Restore default views
- Share views with authorized team members

Persist preferences securely at the user or organization level.

Relative date ranges such as Last 30 Days should remain relative when saved.

Do not convert all saved date preferences into fixed historical dates.

---

## 19. Data tables and drill-down functionality

Provide detailed data tables beneath or within analytical charts.

Support:

- Server-side sorting
- Server-side filtering
- Search
- Pagination
- Virtual scrolling where appropriate
- Column visibility
- Column reordering
- Column resizing
- Sticky headers
- Sticky important columns
- Totals rows
- Subtotals
- Conditional formatting
- Expandable rows
- Parent-child product grouping
- Marketplace grouping
- Channel grouping
- CSV export
- Excel export

Allow users to drill down through supported relationships.

Example:

Brand → Parent ASIN → Child ASIN → SKU → Marketplace → Daily Performance

When a user clicks a chart data point, allow opening the underlying records where available.

Financial totals must reconcile between the charts, KPI cards, and data tables.

Exports must respect the current filters, permissions, reporting definitions, and currency settings.

---

## 20. Multi-tenant SaaS architecture

Design the system as a centralized multi-tenant SaaS platform.

Proposed organizational hierarchy:

Platform → Organization → Client → Brand → Seller Account → Marketplace → Product

Validate this hierarchy against the actual database.

Support:

- Multiple agencies
- Multiple organizations
- Multiple clients
- Multiple brands
- Multiple seller accounts
- Multiple marketplaces
- Multiple sales channels
- Multiple users
- Organization-specific reporting settings
- Client-specific dashboard configurations

Proposed roles:

- Super Admin
- Organization Admin
- Agency Manager
- Account Manager
- Analyst
- Client
- Read-only User

Enforce tenant-level isolation and role-based access control on the server and database access layer.

Do not rely on frontend restrictions alone.

Create automated tests demonstrating that users cannot access another tenant's data through direct API requests, modified URLs, exports, shared views, or cached responses.

---

## 21. Database discovery and integration

I will provide the existing database.

The existing database is the primary source for understanding historical data, relationships, and existing reporting behavior.

Before creating or changing the database architecture:

1. Inspect the database engine.
2. Inspect all relevant tables.
3. Identify primary and foreign keys.
4. Identify indexes.
5. Understand table relationships.
6. Identify product mapping relationships.
7. Identify marketplace mapping relationships.
8. Identify sales channel mapping relationships.
9. Identify financial data sources.
10. Identify advertising data sources.
11. Determine data granularity.
12. Identify missing or inconsistent records.
13. Identify duplicate data.
14. Identify existing aggregation tables.
15. Analyze historical data volume.
16. Map database fields to supported metrics.
17. Identify performance limitations.
18. Generate an entity relationship diagram.
19. Create a data dictionary.
20. Recommend an optimized database strategy.

Do not invent business tables or production data structures without inspecting the existing database.

### Database safety

- Never modify or delete the original production database during discovery.
- Use read-only access initially.
- Use a separate development database.
- Preserve historical data.
- Maintain reproducible migrations.
- Protect confidential information.
- Never commit production database dumps to Git.
- Never expose database credentials.
- Require explicit approval before destructive migrations.
- Validate migrated data against original source records.
- Maintain a documented rollback strategy.

If the existing database performs adequately, retain it rather than migrating simply for architectural preference.

Any database migration must have a measurable or clearly justified benefit.

---

## 22. Centralized KPI calculation engine

Build a centralized, reusable, tested calculation engine.

All dashboards, APIs, charts, reports, and exports must use the same metric definitions.

Example formulas:

ACOS = Advertising Spend / Advertising Sales × 100

TACOS = Advertising Spend / Total Sales × 100

ROAS = Advertising Sales / Advertising Spend

CTR = Clicks / Impressions × 100

CPC = Advertising Spend / Clicks

Net Profit Margin = Net Profit / Revenue × 100

YoY Growth = (Current Period − Previous Year Period) / Previous Year Period × 100

ROI = Net Return / Defined Investment Cost × 100

These are initial formula references. Verify them against the existing business logic before implementation.

Explicitly define which revenue and investment denominators are used.

Requirements:

- Document every formula.
- Identify every source field.
- Define aggregation behavior.
- Handle division by zero.
- Handle missing values.
- Distinguish unavailable data from zero.
- Handle refunds and negative values.
- Preserve financial precision.
- Support verified currency conversion.
- Reconcile marketplace totals.
- Prevent parent-child double counting.
- Document advertising attribution limitations.
- Avoid double counting organic and advertising revenue.

Never average percentages incorrectly.

For example:

Incorrect:
Average the ACOS values of all marketplaces.

Correct:
Total advertising spend divided by total advertising sales, after necessary currency normalization.

Create a centralized metric registry containing:

- Metric ID
- Metric name
- Formula
- Source fields
- Data type
- Display format
- Aggregation method
- Currency requirements
- Supported dimensions
- Known limitations

Write automated unit tests for every critical financial calculation.

---

## 23. Currency and marketplace handling

The platform must correctly support multiple marketplaces and currencies.

Examples:

- USD
- GBP
- EUR
- CAD
- AUD
- JPY

Support:

- Native marketplace currency
- Organization reporting currency
- User-selected reporting currency
- Historical exchange rates where available
- Documented conversion policies
- Currency-aware totals

Never sum different currencies directly.

Clearly indicate:

- Original currency
- Reporting currency
- Exchange rate source
- Applicable exchange rate date
- Conversion policy

Do not fabricate exchange rates.

If reliable conversion data is unavailable, display separate marketplace currency values rather than misleading combined totals.

---

## 24. Performance — Highest engineering priority

Speed is one of the main reasons for rebuilding and improving this application.

The dashboard must remain fast even when analyzing:

- Tens of thousands of SKUs
- Thousands of parent ASINs
- Multiple brands
- Multiple marketplaces
- Multiple sales channels
- Several years of historical data
- Millions of underlying transactions
- Multiple concurrent users

Performance must be considered from the beginning of development.

Do not build a slow application and postpone optimization until the end.

Establish baseline performance measurements before major changes.

### A. Database performance

Implement or evaluate:

- Appropriate composite indexes
- Indexed date-range queries
- Indexed product searches
- Indexed marketplace and channel filters
- Tenant-aware indexing
- Query execution plan analysis
- Efficient joins
- Query optimization
- Prevention of N+1 queries
- Server-side aggregation
- Partitioning where justified
- Materialized views where supported and justified
- Daily aggregated reporting tables
- Incremental aggregation
- Efficient historical backfills
- Connection pooling
- Query monitoring

Avoid repeatedly aggregating millions of raw records for every dashboard request.

Consider an optimized daily analytics fact table at an appropriate verified grain, such as:

Tenant + Date + Product + Marketplace + Sales Channel

Store necessary additive components for metrics, such as:

- Sales
- Orders
- Units
- Advertising spend
- Advertising sales
- Cost components
- Fees
- Refunds
- Profit components

Calculate ratios from those components.

Do not permanently store misleading averaged ratios.

Only introduce aggregate tables after validating their grain, accuracy, freshness requirements, and reconciliation process.

Measure the impact of database optimizations.

### B. Shared analytics API

Do not make each KPI card and chart independently query the database.

Create a centralized analytics API or efficiently batched analytics endpoints.

Example request:

- Selected products
- Selected marketplaces
- Selected channels
- Date range
- Comparison period
- Granularity
- Reporting currency
- Selected metrics
- Breakdown dimension

The analytics service should return reusable, aggregated datasets containing:

- KPI summaries
- Current period values
- Comparison period values
- Time-series data
- Marketplace breakdowns
- Channel breakdowns
- Data availability
- Currency information
- Data freshness metadata

Reuse these datasets across multiple charts and views.

Return only the metrics and granularity required by the current dashboard.

Do not return excessively large datasets simply because the API is consolidated.

Use additional on-demand requests for drill-downs and expensive metrics where necessary.

### C. Intelligent caching

Implement an appropriate caching strategy based on measured workload.

Evaluate:

- Nitro server caching
- In-memory caching
- Redis
- Database query caching
- Precomputed report caching
- Client-side query caching

Cache keys must include all relevant reporting and authorization dimensions:

- Tenant
- User or authorization scope where necessary
- Product selection
- Brand
- Marketplace
- Sales channel
- Date range
- Comparison period
- Reporting granularity
- Reporting currency
- Metric selection
- Calculation version
- Data version or freshness state

Never allow cached data to leak between tenants.

Implement cache invalidation when source data or calculation definitions change.

Reuse cached data when users switch between:

- Carousel view
- Grid view
- Focus view
- Compact view
- Chart types
- Previously loaded metric selections

Do not refetch data unnecessarily.

### D. Request optimization

Implement:

- Request deduplication
- Request cancellation
- AbortController where appropriate
- Debounced product searches
- Race-condition prevention
- Efficient parallel requests
- Selective data fetching
- Response compression where appropriate
- Appropriate cache headers
- Progressive responses for expensive reports
- Server-side pagination

When users quickly change product or date filters, cancel outdated requests.

Ensure that older responses cannot overwrite newer selections.

### E. Frontend performance

Use Vue and Nuxt performance best practices.

Implement:

- Route-level code splitting
- Lazy-loaded chart components
- Tree-shaken ECharts imports
- Lazy-loaded reporting modules
- Efficient reactivity
- Shallow references for large immutable datasets where appropriate
- Computed value optimization
- Component reuse
- Minimal watchers
- Virtual scrolling
- Progressive chart rendering
- Viewport-based chart mounting
- Efficient chart updates
- Chart instance cleanup
- Bundle size monitoring
- Lightweight loading states

Avoid:

- Rendering dozens of charts immediately
- Loading the entire product catalog into browser memory
- Large reactive objects unnecessarily
- Duplicate data transformations
- Unnecessary component re-renders
- Excessive chart animations
- Recreating chart instances unnecessarily
- Heavy UI libraries that duplicate existing capabilities
- Blocking the entire dashboard while a single section loads

Prioritize visible charts and primary KPI cards.

Load secondary details when required.

### F. Adaptive chart resolution

Automatically determine an appropriate chart data resolution.

Do not render thousands of chart points when fewer points provide sufficient analytical detail.

Perform aggregation on the server.

Use appropriate downsampling techniques for visualization when necessary, without using sampled data to calculate financial totals.

Allow users to zoom or drill down into higher-resolution data.

### G. Perceived performance

Make the application feel instant.

When users change filters:

- Respond immediately to the interaction.
- Preserve useful existing content while loading.
- Clearly indicate when displayed content belongs to the previous filter selection.
- Use lightweight loading indicators.
- Update sections independently where appropriate.
- Avoid unnecessary full-page loading screens.
- Avoid layout shifts.
- Preserve scroll position where appropriate.

The application should feel responsive even during expensive database operations.

---

## 25. Performance targets and benchmarking

Use the following initial performance objectives:

| Operation | Target |
|---|---|
| Dashboard layout switch | Under 100 ms |
| Switching between cached charts | Under 100 ms |
| Product search API | Under 200 ms |
| Cached analytics API | Under 200 ms |
| Typical uncached analytics API | Under 800 ms |
| Typical filter-to-dashboard update | Under 1 second |
| Initial meaningful dashboard content | Under 1.5–2 seconds |
| Largest historical queries | Progressive loading with feedback |
| Interaction responsiveness | INP under 200 ms at the 75th percentile |
| Unnecessary duplicate API requests | Zero for identical in-flight requests |

These are engineering targets, not guaranteed results.

Benchmark using realistic datasets and representative infrastructure.

Record:

- p50 response latency
- p95 response latency
- p99 response latency
- Database execution time
- Number of queries per dashboard load
- Cache hit rate
- API payload size
- Frontend bundle size
- Chart rendering time
- Browser memory usage
- Initial content rendering
- Largest Contentful Paint
- Interaction to Next Paint

Test:

- Single SKU
- Multiple SKUs
- Parent ASIN
- All products
- Single marketplace
- Multiple marketplaces
- Last 30 days
- Last 365 days
- Multiple years of historical data
- Multiple concurrent users
- Cold cache
- Warm cache

Identify the actual bottlenecks before choosing optimization strategies.

Maintain a performance benchmark document and compare results after major changes.

Never claim a performance target has been achieved unless it has been measured.

---

## 26. UI/UX design requirements

Build a premium, modern, professional enterprise analytics SaaS interface.

Use the visual quality and usability of products such as:

- Linear
- Stripe Dashboard
- Shopify Analytics
- Vercel
- Modern financial analytics platforms
- Professional business intelligence platforms

Use these products as inspiration, not as assets or branding to copy.

### Design principles

- Clean
- Modern
- Professional
- Visually engaging
- Information-dense
- Easy to navigate
- Consistent
- Responsive
- Accessible
- Fast

### Application layout

Include:

- Collapsible sidebar
- Compact top navigation
- Global organization selector
- Client selector
- Dashboard switcher
- Global product search
- Sticky filter bar
- KPI summary section
- Interactive chart workspace
- Reporting tables
- User settings
- Light and dark mode

### Visual requirements

- Consistent typography
- Professional chart colors
- Subtle borders
- Appropriate spacing
- Clear visual hierarchy
- Consistent buttons
- High-quality dropdowns
- Accessible tooltips
- Compact KPI cards
- Clean tables
- Meaningful empty states
- Lightweight loading skeletons
- Responsive mobile layouts
- Responsive tablet layouts
- Optimized large desktop layouts

Avoid:

- Excessive whitespace
- Oversized cards
- Excessive gradients
- Unnecessary glassmorphism
- Heavy shadows
- Decorative charts without analytical value
- Excessive animations
- Inconsistent styling
- Generic template-like dashboards
- Unnecessary modal dialogs
- Poorly structured navigation

The dashboard should feel like a professional business intelligence terminal rather than a generic admin template.

Create a centralized design system for:

- Colors
- Typography
- Spacing
- Borders
- Shadows
- Chart palettes
- Form controls
- KPI cards
- Tables
- Navigation
- Loading states
- Error states

Do not hardcode inconsistent styles across pages.

---

## 27. Recommended Performance Explorer page structure

Design the new dashboard using the following general structure:

### Application header

- Organization selector
- Client selector
- Dashboard selector
- Saved views
- User settings
- Theme switcher

### Global filter section

- Product / SKU / Parent ASIN search
- Brand
- Marketplace
- Channel
- Date range
- Comparison
- Granularity
- Currency

### KPI summary

- Sales
- Ad Spend
- Units Sold
- Orders
- Net Profit
- Net Margin
- ROI
- ACOS
- TACOS
- ROAS

### Chart workspace controls

- Carousel / Grid / Focus / Compact toggle
- Chart configuration
- Add chart
- Arrange charts
- Save view
- Export
- Reset layout

### Primary charts

- Sales across marketplaces
- Advertising spend across marketplaces
- Units sold across marketplaces
- Net profit across marketplaces
- Net profit margin
- ROI
- ACOS
- TACOS

### Secondary analytics

- Organic versus advertising sales
- Marketplace revenue contribution
- Product performance breakdown
- Advertising efficiency
- Cost and profitability breakdown
- Period comparison

### Detailed reporting table

Provide filtered underlying data with sorting, grouping, drill-down, totals, and export functionality.

This layout is a starting point.

Improve it where doing so provides a better analytical experience without compromising speed.

---

## 28. Core application modules

Develop the platform using modular architecture.

Target modules:

### Executive Dashboard

Business-wide KPIs, performance trends, and summary reporting.

### Performance Explorer

Interactive SKU, parent ASIN, product, marketplace, and channel analytics.

### Sales Analytics

Daily, weekly, monthly, quarterly, annual, and comparative sales reporting.

### Advertising Analytics

PPC performance, advertising spend, advertising sales, ACOS, TACOS, ROAS, campaign analysis, and other supported advertising metrics.

### Profitability Analytics

Product profitability, fees, COGS, net profit, margins, ROI, and cost analysis.

### Product Analytics

SKU performance, parent-child relationships, product trends, and product-level comparisons.

### Inventory Analytics

Inventory monitoring, stock availability, inventory velocity, and restocking insights where data is available.

### Reporting Center

Saved reports, report generation, exports, period comparison, and scheduled reporting.

### Administration

Organization management, client management, user permissions, data imports, integrations, audit logs, and system settings.

### Subscription Management

Future commercial SaaS billing, usage limits, account plans, and subscriptions.

Implement only those features supported by available requirements and data.

Do not attempt to build every module simultaneously.

---

## 29. Data integration architecture

Design an extensible ingestion and integration architecture supporting:

- Existing databases
- Amazon Selling Partner API
- Amazon Ads API
- Shopify
- Walmart
- eBay
- TikTok Shop
- CSV uploads
- Excel uploads
- Google Sheets
- Additional third-party providers

Do not implement integrations without necessary credentials, authorization, and data contracts.

Support:

- Scheduled synchronization
- Incremental synchronization
- Historical backfills
- Duplicate detection
- Idempotent imports
- Data validation
- Import previews
- Retry mechanisms
- Error monitoring
- Synchronization logs
- Data reconciliation
- Data freshness indicators
- Background jobs where appropriate

Separate ingestion logic from reporting logic.

Do not make external marketplace API requests directly whenever a user opens a dashboard.

Use stored and validated reporting data so dashboard access remains fast and reliable.

---

## 30. Security requirements

Implement production-grade security.

Requirements:

- Secure authentication
- Secure session management
- Role-based access control
- Server-side authorization
- Tenant isolation
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF protection where applicable
- Rate limiting
- Secure cookies
- Protected API routes
- Environment variable management
- Secure secret storage
- Audit logging
- Backup strategy
- Recovery strategy

Never expose:

- Database passwords
- API secrets
- Access tokens
- Private configuration
- Other tenants' information
- Confidential business records

Do not include secrets in Git, client-side bundles, logs, or documentation.

Test authorization independently of frontend behavior.

---

## 31. Recommended application architecture

Use a modular Nuxt architecture.

Organize functionality into appropriate locations for:

- Pages
- Layouts
- Components
- Dashboard components
- Chart components
- Filter components
- KPI components
- Table components
- Composables
- Stores
- Shared types
- Validation schemas
- Server API endpoints
- Server services
- Database repositories
- Analytics services
- Calculation engine
- Reporting calendar
- Cache services
- Integration adapters
- Background jobs
- Tests
- Documentation

Establish reusable components such as:

- DashboardSwitcher
- GlobalFilterBar
- ProductSearch
- ParentProductSelector
- MarketplaceSelector
- ChannelSelector
- DateRangePicker
- ComparisonSelector
- GranularitySelector
- CurrencySelector
- KPICard
- KPIGrid
- AnalyticsChart
- TimeSeriesChart
- MarketplaceComparisonChart
- ChartCarousel
- ChartGrid
- ChartFocusView
- ChartConfigurationPanel
- DashboardViewManager
- SavedViewSelector
- AnalyticsDataTable
- DataFreshnessIndicator
- ExportMenu
- LoadingState
- EmptyState
- ErrorState

These names are suggestions. Follow existing repository conventions where appropriate.

Keep components focused and reusable.

Avoid oversized components and duplicated business logic.

---

## 32. Project documentation

Create and maintain the following documentation where relevant:

- AGENTS.md
- README.md
- docs/PROJECT_OVERVIEW.md
- docs/PRODUCT_REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE_SCHEMA.md
- docs/DATA_DICTIONARY.md
- docs/FEATURE_PARITY.md
- docs/KPI_DEFINITIONS.md
- docs/REPORTING_CALENDAR.md
- docs/DESIGN_SYSTEM.md
- docs/DASHBOARD_ARCHITECTURE.md
- docs/CHART_REGISTRY.md
- docs/API_DOCUMENTATION.md
- docs/PERFORMANCE.md
- docs/PERFORMANCE_BENCHMARKS.md
- docs/CACHING_STRATEGY.md
- docs/SECURITY.md
- docs/ROADMAP.md
- docs/CHANGELOG.md
- docs/DECISIONS.md
- docs/TESTING.md
- docs/DEPLOYMENT.md
- docs/PROJECT_STATUS.md
- .env.example

AGENTS.md must contain the persistent engineering instructions and project rules needed by future Codex sessions.

Maintain documentation that reflects the actual implementation.

Do not create unnecessary duplicate documentation if equivalent files already exist.

PROJECT_STATUS.md must identify:

- Completed features
- Current development tasks
- Pending features
- Technical debt
- Known issues
- Performance bottlenecks
- Outstanding dependencies
- Database requirements
- Architectural decisions
- Recommended next steps

A new Codex session should be able to understand and continue the project without relying on previous conversations.

---

## 33. Testing requirements

Implement meaningful automated tests.

### Unit tests

Test:

- Financial calculations
- Metric aggregation
- Date calculations
- Week numbering
- Week 53
- Leap years
- Period comparisons
- Currency conversion
- Parent-child product aggregation
- Missing data handling
- Division by zero
- Cache key generation
- Product identity mapping

### Integration tests

Test:

- Analytics API
- Database queries
- Product search
- Marketplace filters
- Channel filters
- Date filters
- Authentication
- Authorization
- Tenant isolation
- Cache invalidation
- Data imports

### End-to-end tests

Test complete workflows:

1. Log in.
2. Open Overview Dashboard.
3. Switch to Performance Explorer.
4. Search for a SKU.
5. Select a parent product.
6. Select a date range.
7. Select multiple marketplaces.
8. View sales and profitability charts.
9. Switch between carousel and grid.
10. Expand a chart.
11. Rearrange charts.
12. Save a dashboard view.
13. Reload the application.
14. Verify that preferences are preserved.
15. Compare against a historical period.
16. Export a report.

Ensure the existing dashboard continues working after every major change.

Run relevant:

- Linting
- Type checking
- Unit tests
- Integration tests
- End-to-end tests
- Production builds

Fix introduced errors before declaring work complete.

---

## 34. Development roadmap

Follow an incremental development approach.

### Phase 0 — Discovery and baseline

- Inspect the current repository.
- Inspect the existing application.
- Analyze existing dashboard functionality.
- Inspect database resources if available.
- Identify existing calculation logic.
- Establish performance baselines.
- Document architectural findings.
- Create a feature parity matrix.

### Phase 1 — Dashboard foundation

- Preserve the existing Overview Dashboard.
- Establish or improve the application shell.
- Implement the dashboard switcher.
- Create the Performance Explorer page.
- Build the global filter bar.
- Build the KPI component system.
- Build reusable chart components.
- Implement carousel mode.
- Implement grid mode.
- Implement focus mode.
- Implement compact mode.
- Establish the design system.

### Phase 2 — Database and analytics foundation

- Inspect the actual database.
- Create a database data dictionary.
- Establish product identity mapping.
- Implement SKU and ASIN search.
- Implement parent-child relationships.
- Implement the analytics API.
- Implement the centralized calculation engine.
- Implement the reporting calendar.
- Implement marketplace and channel dimensions.

### Phase 3 — Real-data Performance Explorer

- Connect sales analytics.
- Connect advertising analytics.
- Connect units and order analytics.
- Connect profitability analytics.
- Connect margins and ROI.
- Implement multi-marketplace charts.
- Implement multi-channel charts.
- Implement period comparisons.
- Implement detailed reporting tables.
- Validate results against the existing application.

### Phase 4 — Performance engineering

Performance work should already be happening during all previous phases.

This phase focuses on additional measured optimization:

- Database query tuning
- Index optimization
- Aggregation strategies
- Caching
- Request optimization
- Frontend rendering
- Chart virtualization
- Bundle optimization
- Large dataset benchmarking
- Concurrent user testing

### Phase 5 — Personalization

- Custom dashboard layouts
- Drag-and-drop chart arrangement
- Chart resizing
- Saved dashboard views
- User preferences
- Chart customization
- Dashboard sharing
- Advanced report exports

### Phase 6 — Feature parity and enhancements

- Complete verified existing functionality.
- Resolve feature parity gaps.
- Improve sales reporting.
- Improve advertising reporting.
- Improve profitability reporting.
- Introduce supported inventory analytics.
- Add advanced comparison functionality.
- Improve report automation.

### Phase 7 — Commercial SaaS capabilities

- Organization onboarding
- Multi-client management
- Advanced role permissions
- Subscription management
- Billing integration
- Usage monitoring
- Production deployment
- Operational monitoring

Do not attempt to complete all phases in a single development task.

Each phase should produce working, testable functionality.

---

## 35. Engineering rules

Follow these rules throughout development:

1. Inspect existing files before changing them.
2. Preserve working functionality.
3. Do not unnecessarily rewrite the entire application.
4. Do not remove the existing dashboard.
5. Do not fabricate business data.
6. Clearly label development fixtures and mock data.
7. Never display mock data as actual reporting.
8. Never invent unsupported financial formulas.
9. Centralize calculation logic.
10. Centralize date calculation logic.
11. Centralize analytics data fetching.
12. Avoid redundant database requests.
13. Avoid unnecessary frontend dependencies.
14. Prioritize measurable performance improvements.
15. Maintain strict TypeScript.
16. Avoid unnecessary use of any.
17. Keep components modular.
18. Validate external inputs.
19. Maintain secure tenant isolation.
20. Do not expose secrets.
21. Do not modify production data without authorization.
22. Require approval for destructive operations.
23. Maintain reproducible migrations.
24. Document architectural decisions.
25. Test financial calculations.
26. Test dashboard functionality.
27. Benchmark application performance.
28. Fix introduced errors.
29. Keep documentation updated.
30. Clearly identify blockers and uncertainties.
31. Never claim functionality works without verification.
32. Make reasonable, reversible engineering decisions independently.
33. Request clarification only when essential requirements or irreversible decisions cannot be safely inferred.
34. Do not stop development unnecessarily when non-blocked tasks can continue.
35. Do not add decorative features at the expense of speed.
36. Do not change existing validated business logic simply to simplify implementation.
37. Do not deploy changes to production without appropriate authorization.

---

## 36. Acceptance criteria

The project is successful when:

- The existing dashboard remains available.
- The existing dashboard remains functional.
- The new Performance Explorer is available.
- Users can switch between dashboards instantly.
- Users can search for any supported SKU, ASIN, or parent product.
- Parent-child product relationships are correctly handled.
- Users can select multiple products.
- Users can select custom date ranges.
- Users can select multiple marketplaces.
- Users can select multiple sales channels.
- Sales across marketplaces and channels appear in unified charts.
- Advertising spend across marketplaces appears in unified charts.
- Units sold appear in interactive charts.
- Net profit appears in interactive charts.
- Net profit margins appear in interactive charts.
- ROI appears in interactive charts.
- ACOS, TACOS, and ROAS are supported where data exists.
- Current and previous periods can be compared.
- YoY comparisons are accurate.
- Charts support interactive legends and tooltips.
- Users can toggle between carousel, grid, focus, and compact views.
- Users can arrange charts.
- Users can save dashboard configurations.
- Dashboard preferences persist across sessions.
- Layout changes do not unnecessarily refetch data.
- Financial calculations reconcile with source data.
- Multiple currencies are handled correctly.
- Parent products are aggregated without double counting.
- Unsupported data is clearly identified.
- The application performs well with large datasets.
- Performance is supported by actual benchmarks.
- Tenant isolation is verified.
- Existing functionality is not broken.
- Automated tests pass.
- Production builds succeed.
- Documentation remains up to date.

---

## 37. Your immediate task

Start working on the project now.

Do not simply respond with recommendations or a development plan.

Inspect the current working directory and existing repository.

If the repository contains an existing Nuxt application, continue improving that application.

If the repository is empty, initialize the Nuxt project using the approved technology stack.

### Immediate implementation priorities

1. Audit the existing application.
2. Review the existing dashboard.
3. Preserve the existing dashboard as Overview.
4. Establish a clear dashboard switcher.
5. Create the new Performance Explorer.
6. Build the universal SKU, ASIN, and parent product search interface.
7. Build the global date-range and marketplace filters.
8. Build compact KPI summary cards.
9. Build reusable interactive chart components.
10. Build the carousel chart view.
11. Build the all-charts grid view.
12. Build focus and compact views.
13. Establish the shared analytics data architecture.
14. Implement layout switching without unnecessary API requests.
15. Establish persistent dashboard preferences.
16. Connect verified database data wherever available.
17. Establish performance measurements.
18. Test the implementation.
19. Update project documentation.

If the database has not yet been provided:

- Continue with the application foundation.
- Continue with the dashboard experience.
- Establish typed API contracts.
- Create reusable chart components.
- Establish the analytics service interface.
- Use clearly labeled development fixtures.
- Keep mock data isolated from production code paths.
- Do not invent a production business database schema.
- Document the exact database information required.

When the database is provided, inspect it and integrate the actual data rather than continuing to build speculative mock functionality.

---

## 38. Required completion report

After each development task, provide a concise report containing:

### Completed

Features and improvements actually implemented.

### Files changed

Important files created or modified.

### Architecture decisions

Important technical decisions and reasons.

### Performance

Measured baseline and updated performance results, where available.

### Validation

Financial reconciliation and data accuracy checks performed.

### Testing

Actual results of linting, type checking, automated tests, and production builds.

### Known limitations

Unimplemented functionality, assumptions, outstanding dependencies, and blockers.

### Database requirements

Any additional schema, tables, data, or documentation required from me.

### Next steps

The next recommended development task in priority order.

Do not present untested functionality as completed.

---

## 39. Final product vision

The final platform should be a premium e-commerce business intelligence SaaS where a user can search for any SKU, ASIN, or parent product, select any date range, and immediately understand its complete performance across all connected marketplaces and sales channels.

The user should be able to analyze sales, advertising spend, units sold, orders, profitability, margins, ROI, advertising efficiency, and other supported metrics from a single interactive dashboard.

They should be able to switch between a traditional overview dashboard and a modern graph-driven dashboard.

They should be able to view one chart at a time, display all charts simultaneously, arrange charts however they prefer, and save their own personalized dashboard configurations.

The platform should feel extremely fast, even with large historical datasets.

Build the application as a scalable analytics engine with a flexible visualization layer, not simply a collection of dashboard pages.

Preserve existing verified functionality, improve the visual experience, eliminate unnecessary database work, maintain financial accuracy, and establish a strong foundation for a commercial multi-tenant SaaS product.

Speed is a fundamental product requirement.

Start implementing now.