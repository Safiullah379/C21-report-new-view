import { expect, test } from "@playwright/test";
const openExplorer = async (page: import("@playwright/test").Page) => {
  await page.goto("/?tab=explorer");
  await expect(page.locator(".kpi-card")).toHaveCount(6);
  await expect(page.locator("canvas").first()).toBeVisible();
};
test("overview, all analytics modules and product source records work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".year-chart")).toHaveCount(6);
  await expect(
    page.locator(
      ".kpi-card, .filter-panel, .top-products, .insight-panel, .demo-banner, .table-panel",
    ),
  ).toHaveCount(0);
  await expect(page.locator(".comparison-date-panel")).toHaveCount(0);
  await expect(page.locator(".year-chart canvas").first()).toBeVisible();
  await page.screenshot({
    path: "test-results/overview-desktop.png",
    fullPage: true,
  });
  let requests = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/analytics")) requests++;
  });
  for (const name of [
    "Sales Analytics",
    "Advertising",
    "Profitability",
    "Products",
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".kpi-card")).toHaveCount(6);
    await expect(page.locator(".table-panel").last()).toBeVisible();
  }
  expect(requests).toBe(0);
  await page.getByLabel("Search report", { exact: true }).fill("BOTTLE");
  await expect(page.locator(".report-scroll tbody tr")).toHaveCount(1);
  await page.locator(".report-scroll .product-cell").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").locator("tbody tr").first(),
  ).toContainText("2026");
  await page.getByRole("button", { name: "Close detail" }).click();
  expect(errors).toEqual([]);
});
test("chart layouts, customization, reorder and chart types reuse analytics", async ({
  page,
}) => {
  await openExplorer(page);
  let requests = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/analytics")) requests++;
  });
  await page.getByRole("button", { name: "grid", exact: true }).click();
  await expect(page.locator(".chart-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Customize", exact: false }).click();
  await page
    .getByRole("combobox", { name: "Grid columns", exact: true })
    .selectOption("3");
  await page
    .getByRole("button", { name: "Move Net profit earlier", exact: true })
    .click();
  await expect(page.locator(".metric-order li").first()).toContainText(
    "Net profit",
  );
  await page
    .locator(".metric-picker")
    .getByRole("button", { name: "Net margin", exact: false })
    .click();
  await expect(page.locator(".chart-card")).toHaveCount(7);
  await page
    .getByLabel("Total sales chart type", { exact: true })
    .selectOption("area");
  await page.getByRole("button", { name: "compact", exact: true }).click();
  await expect(page.locator(".charts-compact")).toBeVisible();
  await page.getByRole("button", { name: "carousel", exact: true }).click();
  await expect(page.locator(".chart-card")).toHaveCount(1);
  expect(requests).toBe(0);
  await page.reload();
  await expect(page.locator(".metric-tabs>button").first()).toHaveText(
    "Net profit",
  );
  await page.getByRole("button", { name: "grid", exact: true }).click();
  await expect(
    page.getByLabel("Total sales chart type", { exact: true }),
  ).toHaveValue("area");
});
test("product selection, saved view lifecycle, shared links and data export", async ({
  page,
}) => {
  await openExplorer(page);
  await page.getByRole("combobox", { name: "Product universe" }).fill("TOTE");
  await expect(
    page.getByRole("option").filter({ hasText: "TOTE-INK" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Product universe" })
    .press("ArrowDown");
  await page.getByRole("combobox", { name: "Product universe" }).press("Enter");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Clear products" }),
  ).toBeVisible();
  await expect(page.locator(".loading-banner")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "View name", exact: true })
    .fill("My SKU perspective");
  await page.getByRole("button", { name: "Save view", exact: false }).click();
  await expect(page.getByText("View saved in this browser.")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My Saved Views/ })
    .click();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(page.locator(".saved-card")).toHaveCount(2);
  await page
    .locator(".saved-card")
    .first()
    .getByRole("button", { name: "Rename", exact: true })
    .click();
  await page.getByLabel("New view name").fill("Ink tote report");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ink tote report", exact: true }),
  ).toBeVisible();
  await page
    .locator(".saved-card")
    .first()
    .getByRole("button", { name: "Make default", exact: true })
    .click();
  await expect(page.getByText("★ DEFAULT ON START")).toBeVisible();
  await page
    .locator(".saved-card")
    .first()
    .getByRole("button", { name: "Open view", exact: false })
    .click();
  await expect(
    page.getByRole("button", { name: "Update saved view", exact: true }),
  ).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export data", exact: false }).click();
  expect((await downloaded).suggestedFilename()).toBe(
    "zonhack-demo-report.csv",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Clear products" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My Saved Views/ })
    .click();
  const second = page.locator(".saved-card").nth(1);
  await second.getByRole("button", { name: "Delete", exact: true }).click();
  await second
    .getByRole("button", { name: "Delete view", exact: true })
    .click();
  await expect(page.locator(".saved-card")).toHaveCount(1);
});
test("date comparisons, native currencies and empty results stay consistent", async ({
  page,
  request,
}) => {
  await openExplorer(page);
  await page
    .getByRole("combobox", { name: "Date range", exact: true })
    .selectOption("lastYear");
  await page
    .getByRole("combobox", { name: "Compare with", exact: true })
    .selectOption("year");
  await expect(page.locator(".loading-banner")).toHaveCount(0);
  await expect(page.locator(".kpi-card").first()).not.toContainText(
    "Unavailable",
  );
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("Northline");
  await page
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("CAD");
  await page.getByRole("checkbox", { name: "US", exact: true }).check();
  await expect(
    page.getByText("No records match these filters", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".kpi-card").first()).toContainText("Unavailable");
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await expect(page.locator(".chart-card")).toHaveCount(1);
  expect(
    (
      await request.post("/api/analytics", {
        data: { start: "bad", end: "2026-01-01" },
      })
    ).status(),
  ).toBe(400);
  const end = new Date().toISOString().slice(0, 10),
    body = await (
      await request.post("/api/analytics", {
        data: { start: end, end, currency: "CAD" },
      })
    ).json();
  expect(body.rows.length).toBeGreaterThan(0);
  expect(
    body.rows.every((r: { currency: string }) => r.currency === "CAD"),
  ).toBe(true);
  expect(
    body.inventory.every((r: { currency: string }) => r.currency === "CAD"),
  ).toBe(true);
});
test("inventory status filtering and report Excel download work", async ({
  page,
}) => {
  await page.goto("/?tab=inventory");
  await expect(
    page.getByRole("heading", { name: "Stock health", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Stock status", exact: true })
    .selectOption("Out of stock");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("Out of stock");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Reporting Center", exact: true })
    .click();
  await page
    .getByLabel("Report title", { exact: true })
    .fill("Quarterly board report");
  await page
    .getByRole("combobox", { name: "Report type", exact: true })
    .selectOption("profitability");
  await expect(page.locator(".report-preview")).toContainText(
    "Quarterly board report",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download Excel", exact: false })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("zonhack-demo-summary.xlsx");
  await file.saveAs("test-results/zonhack-demo-summary.xlsx");
  await page.screenshot({
    path: "test-results/report-desktop.png",
    fullPage: true,
  });
});
test("settings theme, backup and restore work", async ({ page }) => {
  await page.goto("/?tab=settings");
  await page.getByRole("tab", { name: "appearance", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Color theme", exact: true })
    .selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("combobox", { name: "Density", exact: true })
    .selectOption("compact");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("tab", { name: "backup", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export workspace backup", exact: false })
    .click();
  const file = await download;
  await file.saveAs("test-results/workspace-backup.json");
  await page
    .locator("input[type=file]")
    .setInputFiles("test-results/workspace-backup.json");
  await expect(
    page.getByText("Workspace and saved views restored."),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Demo data", exact: true }).click();
  await expect(page.getByText("Your demo data, explained")).toBeVisible();
});
test("mobile navigation, filters and reports do not overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const tab of [
    "overview",
    "explorer",
    "inventory",
    "reports",
    "saved",
    "settings",
  ]) {
    await page.goto(`/?tab=${tab}`);
    await expect(page.locator("h1")).toBeVisible();
    if (tab === "overview")
      await expect(page.locator(".year-chart")).toHaveCount(6);
    if (!["overview", "saved", "settings"].includes(tab))
      await expect(page.locator(".loading-banner")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      tab,
    ).toBe(true);
    if (tab === "explorer")
      await page.screenshot({
        path: "test-results/explorer-mobile.png",
        fullPage: true,
      });
  }
});

test("shared views restore in another browser and chart buckets reveal source records", async ({
  page,
  context,
  browser,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openExplorer(page);
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("Northline");
  await expect(page.locator(".loading-banner")).toHaveCount(0);
  await page.getByRole("button", { name: "Share view", exact: false }).click();
  await expect(
    page.getByText("View link copied.", { exact: false }),
  ).toBeVisible();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await other.goto(url);
  await expect(
    other.getByRole("combobox", { name: "Brand", exact: true }),
  ).toHaveValue("Northline");
  await expect(other.locator(".loading-banner")).toHaveCount(0);
  await expect(other.locator(".report-scroll tbody tr")).toHaveCount(2);
  await other.locator(".chart-drill summary").click();
  await other
    .getByRole("button", { name: "Open records", exact: false })
    .click();
  await expect(other.getByRole("dialog")).toBeVisible();
  await expect(other.getByRole("dialog").locator("tbody tr")).toHaveCount(4);
  await other.getByRole("button", { name: "Close detail" }).click();
  await fresh.close();
});

test("table exports honor its search, selected columns and visible totals", async ({
  page,
}) => {
  await page.goto("/?tab=products");
  await expect(page.locator(".loading-banner")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search report", exact: true })
    .fill("BOTTLE");
  await expect(page.locator(".report-scroll tbody tr")).toHaveCount(1);
  await expect(page.locator(".report-scroll tfoot")).toContainText(
    "Matching total",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Table CSV", exact: false }).click();
  const file = await download;
  await file.saveAs("test-results/filtered-table.csv");
  const { readFile } = await import("node:fs/promises");
  const text = await readFile("test-results/filtered-table.csv", "utf8");
  expect(text).toContain("Trail insulated bottle");
  expect(text).not.toContain("Weekender backpack");
  expect(text).toContain("TOTAL");
  expect(text.split("\r\n")).toHaveLength(4);
});

test("graph-only Overview compares years and has a collapsible date panel on the right", async ({
  page,
  request,
}) => {
  await page.goto("/?tab=overview");
  await expect(page.locator(".year-chart")).toHaveCount(6);
  await expect(page.locator(".year-chart canvas")).toHaveCount(6);
  let comparisons = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/year-comparison")) comparisons++;
  });
  await page.getByRole("button", { name: "Weekly", exact: true }).click();
  await expect(page.locator(".year-chart-canvas").first()).toHaveAttribute(
    "aria-label",
    /by week/,
  );
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await expect(page.locator(".year-chart-canvas").first()).toHaveAttribute(
    "aria-label",
    /by month/,
  );
  expect(comparisons).toBe(0);
  await page
    .getByRole("button", { name: "Date and year comparison", exact: true })
    .click();
  const panel = page.getByRole("complementary", {
    name: "Date comparison panel",
  });
  await expect(panel).toBeVisible();
  const panelBox = await panel.boundingBox();
  expect(panelBox!.x + panelBox!.width).toBeGreaterThan(1200);
  await page
    .getByRole("combobox", { name: "Reference year", exact: true })
    .selectOption("2025");
  await page.getByRole("checkbox", { name: "2024", exact: true }).check();
  await page.getByRole("checkbox", { name: "2026", exact: true }).uncheck();
  await page
    .getByRole("button", { name: "Apply comparison", exact: false })
    .click();
  await expect(panel).toHaveCount(0);
  await expect(page.locator(".comparison-date-toggle")).toContainText("2025");
  await expect(page.locator(".year-chart-legend").first()).toContainText(
    "2024",
  );
  await page.reload();
  await expect(page.locator(".comparison-date-toggle")).toContainText("2025");
  await expect(page.locator(".year-chart-legend").first()).toContainText(
    "2024",
  );
  await page
    .getByRole("button", { name: "Date and year comparison", exact: true })
    .click();
  await page.screenshot({
    path: "test-results/overview-date-panel.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Close date panel", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("h1")).toHaveText("Overview");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/overview-mobile.png",
    fullPage: true,
  });
  const response = await request.post("/api/year-comparison", {
    data: {
      year: 2026,
      years: [2026, 2025],
      start: "2026-01-01",
      end: "2026-12-31",
    },
  });
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.monthly).toHaveLength(2);
  expect(result.weekly[0].points).toHaveLength(53);
  expect(
    (
      await request.post("/api/year-comparison", {
        data: {
          year: 2026,
          years: [2026, 2026],
          start: "2026-01-01",
          end: "2026-12-31",
        },
      })
    ).status(),
  ).toBe(400);
});

test("Overview header filters all marketplaces, single SKU, parent SKU and all SKUs", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1257, height: 900 });
  await page.goto("/?tab=overview");
  await expect(page.locator(".year-chart")).toHaveCount(6);
  const marketplace = page.getByRole("button", {
      name: "Select marketplace",
      exact: true,
    }),
    sku = page.getByRole("button", { name: "Select SKU", exact: true });
  await expect(marketplace).toContainText("All marketplaces");
  await expect(sku).toContainText("All SKUs");
  const marketBounds = await marketplace.boundingBox(),
    skuBounds = await sku.boundingBox(),
    resolutionBounds = await page
      .locator(".comparison-resolution")
      .boundingBox();
  expect(marketBounds!.x).toBeGreaterThan(350);
  expect(skuBounds!.x).toBeGreaterThan(marketBounds!.x);
  expect(skuBounds!.x + skuBounds!.width).toBeLessThan(resolutionBounds!.x);
  await marketplace.click();
  await expect(
    page.getByRole("region", { name: "Marketplace selection" }),
  ).toContainText("1 USD = 1.31 CAD = 0.79 GBP");
  const caResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/year-comparison") &&
      r.request().postDataJSON()?.marketplaces[0] === "CA",
  );
  await page.getByRole("button", { name: "Canada", exact: false }).click();
  const ca = await (await caResponse).json();
  expect(ca.currency).toBe("CAD");
  expect(ca.fxPolicy).toBe("synthetic-fixed");
  await expect(marketplace).toContainText("Canada");
  await sku.click();
  await page.getByRole("button", { name: "Parent SKU", exact: true }).click();
  const parentResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/year-comparison") &&
      r.request().postDataJSON()?.products[0] === "demo:parent",
  );
  await page
    .getByRole("button", {
      name: "Choose parent SKU CARRY-PARENT",
      exact: true,
    })
    .click();
  const parent = await (await parentResponse).json();
  expect(
    parent.monthly[0].points.some(
      (p: { values: { sales: number } | null }) => p.values?.sales,
    ),
  ).toBe(true);
  await expect(sku).toContainText("CARRY-PARENT");
  await page.reload();
  await expect(marketplace).toContainText("Canada");
  await expect(sku).toContainText("CARRY-PARENT");
  await sku.click();
  await page.getByRole("button", { name: "Single SKU", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search SKUs", exact: true })
    .fill("TOTE-OLIVE");
  const singleResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/year-comparison") &&
      r.request().postDataJSON()?.products[0] === "demo:olive",
  );
  await page
    .getByRole("button", { name: "Choose SKU TOTE-OLIVE", exact: true })
    .click();
  await singleResponse;
  await expect(sku).toContainText("TOTE-OLIVE");
  await sku.click();
  const allSkuResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/year-comparison") &&
      r.request().postDataJSON()?.products.length === 0,
  );
  await page.getByRole("button", { name: "All SKUs", exact: true }).click();
  await allSkuResponse;
  await expect(sku).toContainText("All SKUs");
  await marketplace.click();
  const allMarketResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/year-comparison") &&
      r.request().postDataJSON()?.marketplaces.length === 0,
  );
  await page
    .getByRole("group", { name: "Marketplace options" })
    .getByRole("button", { name: "All marketplaces", exact: false })
    .click();
  await allMarketResponse;
  await expect(marketplace).toContainText("All marketplaces");
  const base = {
    year: 2026,
    years: [2026, 2025],
    start: "2026-01-01",
    end: "2026-12-31",
    convertCurrency: true,
  };
  const all = await (
      await request.post("/api/year-comparison", { data: base })
    ).json(),
    us = await (
      await request.post("/api/year-comparison", {
        data: { ...base, marketplaces: ["US"] },
      })
    ).json();
  expect(all.monthly[0].points[0].values.units).toBeGreaterThan(
    us.monthly[0].points[0].values.units,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await marketplace.click();
  await expect(
    page.getByRole("region", { name: "Marketplace selection" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Marketplace selection" }),
  ).toHaveCount(0);
  await sku.click();
  await expect(
    page.getByRole("region", { name: "SKU selection" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
