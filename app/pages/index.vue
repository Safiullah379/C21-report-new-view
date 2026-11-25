<script setup lang="ts">
import { aggregate, metrics, formatMetric } from "~~/shared/analytics/metrics";
import { bucket, datePresets } from "~~/shared/analytics/calendar";
import {
  metricIds,
  type MetricId,
  type AnalyticsResult,
} from "~~/shared/types/analytics";
import {
  modules,
  templates,
  defaultMetrics,
  type ModuleId,
  type Preference,
} from "~~/shared/analytics/workspace";
import { downloadFile } from "~/composables/useExports";
const appearance = useAppearance(),
  workspace = useWorkspace(),
  route = useRoute();
const {
  filters,
  layout,
  metric,
  days,
  data,
  loading,
  error,
  saved,
  visible,
  columns,
  sync,
  charts,
  defaultView,
  storageMessage,
} = workspace;
const { rawCsv } = useExports();
const page = ref<ModuleId>("overview"),
  viewName = ref(""),
  notice = ref(""),
  activeSaved = ref(""),
  dragged = ref(-1),
  showCustomize = ref(false);
const currentModule = computed(
  () => modules.find((m) => m.id === page.value) || modules[0],
);
const analytical = computed(() => !["saved", "settings"].includes(page.value)),
  summaryIds = computed<readonly MetricId[]>(() =>
    page.value === "explorer" ? visible.value : currentModule.value.metrics,
  );
const ready = computed(
  () => data.value?.mode === "demo" && !loading.value && !error.value,
);
const rendered = computed(() =>
  layout.value === "carousel" || layout.value === "focus"
    ? [metric.value]
    : visible.value,
);
const previousLayout = ref<Preference["layout"]>("carousel");
const detailOpen = ref(false);
const drill = ref<HTMLDialogElement>(),
  drillProduct = ref(""),
  drillStart = ref(""),
  drillEnd = ref("");
const drillTitle = computed(() =>
  drillProduct.value
    ? data.value?.catalog?.find((p) => p.id === drillProduct.value)?.title
    : `${drillStart.value} — ${drillEnd.value}`,
);
const productData = computed<AnalyticsResult | null>(() => {
  if (!data.value || !drillProduct.value) return null;
  const rows = data.value.rows.filter(
    (r) => r.productId === drillProduct.value,
  );
  return {
    ...data.value,
    rows,
    totals: aggregate(rows),
    previous: null,
    comparisonSeries: [],
    series: data.value.series,
  };
});
const partialCoverage = computed(() => {
  const c = data.value?.coverage;
  if (!c) return false;
  const p = data.value?.comparisonRange;
  return (
    filters.value.start < c.start ||
    filters.value.end > c.end ||
    !!(p && (p.start < c.start || p.end > c.end))
  );
});
const selectedProductNames = computed(() =>
  filters.value.products
    .map((id) => data.value?.catalog?.find((p) => p.id === id))
    .filter((p) => !!p),
);
const planTab = ref("workspace"),
  importInput = ref<HTMLInputElement>(),
  resetConfirm = ref(false),
  sourceTab = ref<"product" | "date" | "segment">("product");
const touchStart = ref(0);
function navigate(id: ModuleId) {
  page.value = id;
  notice.value = "";
  try {
    localStorage.setItem("zonhack:demo:page:v2", id);
  } catch {
    /* session-only */
  }
}
function focus(id: MetricId) {
  previousLayout.value = layout.value;
  metric.value = id;
  if (!visible.value.includes(id)) visible.value = [...visible.value, id];
  layout.value = "focus";
  if (page.value !== "explorer") navigate("explorer");
  nextTick(() =>
    document
      .getElementById("chart-workspace")
      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
  );
}
function cycle(direction: number) {
  const ids = visible.value;
  metric.value =
    ids[
      (Math.max(0, ids.indexOf(metric.value)) + direction + ids.length) %
        ids.length
    ]!;
}
function toggleMetric(id: MetricId) {
  if (visible.value.includes(id)) {
    if (visible.value.length === 1) {
      notice.value = "Keep at least one metric visible.";
      return;
    }
    visible.value = visible.value.filter((v) => v !== id);
    if (metric.value === id) metric.value = visible.value[0]!;
  } else visible.value = [...visible.value, id];
}
function configure(id: MetricId, config: Preference["charts"][MetricId]) {
  charts.value = { ...charts.value, [id]: config };
}
function applyTemplate(index: number) {
  const t = templates[index];
  if (!t) return;
  const s = workspace.snapshot();
  s.visible = [...t.metrics];
  s.metric = t.metrics[0]!;
  s.layout = t.layout;
  s.filters.breakdown = t.breakdown || "segment";
  if (t.days) s.days = t.days;
  if (t.comparison) s.filters.comparison = t.comparison;
  workspace.apply(s);
  activeSaved.value = "";
  navigate("explorer");
}
function openView(value: Preference, id = "") {
  workspace.apply(value);
  activeSaved.value = id;
  navigate("explorer");
}
function saveView() {
  notice.value = workspace.save(viewName.value)
    ? "View saved in this browser."
    : "Enter a name. Maximum 30 views; browser storage must be available.";
  viewName.value = "";
}
async function shareView() {
  const url = new URL(window.location.href);
  url.searchParams.set("view", JSON.stringify(workspace.snapshot()));
  url.searchParams.set("tab", "explorer");
  try {
    await navigator.clipboard.writeText(url.toString());
    notice.value =
      "View link copied. It contains demo filter and chart settings only.";
  } catch {
    notice.value = "Copy the current browser address to share this view.";
  }
}
function resetFilters() {
  const current = layout.value;
  workspace.reset();
  layout.value = current;
  notice.value = "Filters and metrics reset.";
}
function openProduct(id: string) {
  detailOpen.value = true;
  drillProduct.value = id;
  drillStart.value = "";
  drillEnd.value = "";
  drill.value?.showModal();
}
function openPoint(date: string) {
  detailOpen.value = true;
  const dates =
    data.value?.rows
      .filter(
        (r) =>
          bucket(
            r.date,
            filters.value.granularity,
            filters.value.calendar,
            filters.value.fiscalMonth,
          ) === date,
      )
      .map((r) => r.date)
      .sort() || [];
  drillProduct.value = "";
  drillStart.value = dates[0] || date;
  drillEnd.value = dates[dates.length - 1] || date;
  drill.value?.showModal();
}
function setHome() {
  try {
    localStorage.removeItem("zonhack:demo:page:v2");
    notice.value = "Start page preference saved.";
  } catch {
    notice.value = "Browser storage is unavailable.";
  }
}
function backup() {
  downloadFile(
    JSON.stringify(
      { version: 2, views: saved.value, workspace: workspace.snapshot() },
      null,
      2,
    ),
    "zonhack-demo-workspace.json",
    "application/json",
  );
}
async function importBackup(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 1000000) throw new Error("Backup must be under 1 MB");
    workspace.restoreBackup(await file.text());
    notice.value = "Workspace and saved views restored.";
  } catch (e) {
    notice.value = e instanceof Error ? e.message : "Invalid backup";
  } finally {
    input.value = "";
  }
}
function keydown(e: KeyboardEvent) {
  if (
    ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
      (e.target as HTMLElement).tagName,
    ) ||
    drill.value?.open
  )
    return;
  if (
    page.value === "explorer" &&
    layout.value === "carousel" &&
    ["ArrowRight", "ArrowLeft"].includes(e.key)
  ) {
    e.preventDefault();
    cycle(e.key === "ArrowRight" ? 1 : -1);
  }
}
onMounted(() => {
  const tab = route.query.tab;
  if (typeof tab === "string" && modules.some((m) => m.id === tab))
    page.value = tab as ModuleId;
  else {
    try {
      const last = localStorage.getItem("zonhack:demo:page:v2");
      page.value = (
        modules.some((m) => m.id === last) ? last : appearance.value.home
      ) as ModuleId;
    } catch {
      page.value = appearance.value.home;
    }
  }
  window.addEventListener("keydown", keydown);
});
onBeforeUnmount(() => window.removeEventListener("keydown", keydown));
useHead({ title: computed(() => `Zonhack · ${currentModule.value.name}`) });
</script>
<template>
  <div
    class="app-shell"
    :class="{
      'sidebar-collapsed': appearance.collapsed,
      'graph-overview': page === 'overview',
    }"
  >
    <a class="skip-link" href="#main-content">Skip to content</a>
    <aside class="sidebar">
      <NuxtLink to="/" class="wordmark"
        ><span class="logo">z</span
        ><span class="wordmark-name"
          >zonhack<span class="wordmark-dot">.</span></span
        ></NuxtLink
      >
      <div class="workspace-label">DEMO WORKSPACE</div>
      <div class="org-card">
        <span class="org-avatar">SG</span>
        <div>
          <strong>Studio Collective</strong
          ><small>3 brands · 3 marketplaces</small>
        </div>
        <span class="badge">DEMO</span>
      </div>
      <div class="nav-label">WORKSPACE</div>
      <nav aria-label="Workspace navigation">
        <button
          v-for="item in modules"
          :key="item.id"
          :class="{ selected: page === item.id }"
          :aria-current="page === item.id ? 'page' : undefined"
          :title="item.name"
          :aria-label="item.name"
          @click="navigate(item.id)"
        >
          <AppIcon :name="item.id" /><span class="nav-name">{{
            item.name
          }}</span
          ><small v-if="item.id === 'saved'">{{ saved.length }}</small>
        </button>
      </nav>
      <div class="sidebar-note">
        <span class="status-dot"></span
        ><strong>A little clarity. A lot of possibility.</strong>
        <p>Your whole business.<br />One connected perspective.</p>
      </div>
      <div class="profile">
        <span class="org-avatar">DV</span>
        <div>
          <strong>Demo visitor</strong><small>Synthetic data sandbox</small>
        </div>
        <button
          class="text-button collapse-button"
          :aria-label="
            appearance.collapsed ? 'Expand sidebar' : 'Collapse sidebar'
          "
          @click="appearance.collapsed = !appearance.collapsed"
        >
          {{ appearance.collapsed ? "»" : "«" }}
        </button>
      </div>
    </aside>
    <main id="main-content">
      <header v-if="page !== 'overview'" class="topbar">
        <div>
          <span class="muted">Studio Collective</span
          ><span class="slash">/</span><strong>{{ currentModule.name }}</strong>
        </div>
        <div class="topbar-right">
          <span class="status-dot"></span><span>Demo workspace</span
          ><button
            class="theme-toggle"
            :aria-label="
              appearance.theme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            "
            @click="
              appearance.theme = appearance.theme === 'dark' ? 'light' : 'dark'
            "
          >
            {{ appearance.theme === "dark" ? "☀" : "☾" }}</button
          ><span class="initial">DV</span>
        </div>
      </header>
      <div class="page-content">
        <div v-if="page !== 'overview'" class="page-heading">
          <div>
            <div class="eyebrow">YOUR BUSINESS, IN PERSPECTIVE</div>
            <h1>{{ currentModule.name }}</h1>
            <p>{{ currentModule.description }}</p>
          </div>
          <div v-if="analytical" class="heading-actions">
            <button
              class="button secondary"
              :disabled="!ready"
              aria-label="Refresh analysis"
              @click="workspace.fetchData(true)"
            >
              ↻</button
            ><button
              class="button secondary"
              :disabled="!ready || !data?.rows.length"
              @click="rawCsv(data!)"
            >
              ↓ Export data</button
            ><button
              v-if="page === 'explorer'"
              class="button secondary"
              @click="shareView"
            >
              ↗ Share view
            </button>
          </div>
        </div>
        <div v-if="page !== 'overview'" class="demo-banner" role="status">
          <span>◈</span><strong>Demo workspace</strong
          ><span
            >All products and figures are synthetic. No live business
            data.</span
          ><span class="badge">SAMPLE DATA</span>
        </div>
        <p v-if="notice" class="notice" role="status">
          {{ notice
          }}<button aria-label="Dismiss notification" @click="notice = ''">
            ×
          </button>
        </p>
        <p v-if="storageMessage" class="notice" role="status">
          {{ storageMessage }}
        </p>
        <SavedViews
          v-if="page === 'saved'"
          :saved="saved"
          :default-view="defaultView"
          @open="
            (value) => openView(value, saved.find((v) => v.value === value)?.id)
          "
          @template="applyTemplate"
          @rename="workspace.rename"
          @duplicate="workspace.duplicate"
          @remove="workspace.remove"
          @default="workspace.setDefault"
        />
        <template v-else-if="page === 'settings'">
          <div
            class="settings-tabs"
            role="tablist"
            aria-label="Settings categories"
          >
            <button
              v-for="tab in ['workspace', 'appearance', 'data', 'backup']"
              :key="tab"
              role="tab"
              :aria-selected="planTab === tab"
              @click="planTab = tab"
            >
              {{ tab === "data" ? "Demo data" : tab }}
            </button>
          </div>
          <section v-if="planTab === 'workspace'" class="settings-card">
            <span class="eyebrow">STUDIO COLLECTIVE</span>
            <h2>Your demo workspace</h2>
            <p>
              Explore a complete analytics workflow with fictional products and
              generated transactions. Changes to views and preferences stay in
              this browser.
            </p>
            <div class="settings-facts">
              <div>
                <span>Workspace</span><strong>Studio Collective · Demo</strong>
              </div>
              <div>
                <span>Brands</span
                ><strong>Studio Goods, Northline, Forma Home</strong>
              </div>
              <div>
                <span>Markets / channels</span
                ><strong>US, Canada, United Kingdom · Amazon, Shopify</strong>
              </div>
              <div>
                <span>Access</span
                ><strong
                  >Local demo visitor · No real accounts connected</strong
                >
              </div>
              <div>
                <span>Plan</span
                ><strong>Demo sandbox · No billing or subscription</strong>
              </div>
            </div>
            <label
              >Default start page<select v-model="appearance.home">
                <option v-for="item in modules" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select></label
            >
            <p>
              Changing this setting clears the remembered page, so your next
              fresh visit starts here.
            </p>
            <button class="button primary" @click="setHome">
              Use as start page
            </button>
          </section>
          <section v-else-if="planTab === 'appearance'" class="settings-card">
            <h2>A workspace that suits you</h2>
            <label
              >Color theme<select v-model="appearance.theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">Use system setting</option>
              </select></label
            ><label
              >Density<select v-model="appearance.density">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select></label
            ><label class="check-label"
              ><input v-model="appearance.collapsed" type="checkbox" />Collapse
              sidebar on desktop</label
            >
            <p>
              Appearance preferences are saved automatically in this browser.
            </p>
          </section>
          <section v-else-if="planTab === 'data'" class="settings-card">
            <h2>Your demo data, explained</h2>
            <p>
              Ten sellable products, three fictional brands, three marketplaces
              and two channels. Five years of generated history supports up to
              three years per report and prior-year comparisons.
            </p>
            <div class="connection-grid">
              <article>
                <span class="connection-icon">a</span><strong>Amazon</strong
                ><span class="health-badge healthy">Synthetic fixture</span
                ><small>US · CA · UK · Native currencies</small>
              </article>
              <article>
                <span class="connection-icon">S</span><strong>Shopify</strong
                ><span class="health-badge healthy">Synthetic fixture</span
                ><small>United States · USD</small>
              </article>
            </div>
            <h3>Calculation policy</h3>
            <p>
              Money is stored in integer minor units. Net sales subtract refunds
              and promotions. Net profit subtracts cost of goods, fees,
              fulfillment, storage and advertising. Combined ratios are
              recalculated from their components. Native currencies are kept
              separate.
            </p>
            <h3>Reporting calendar</h3>
            <p>
              Choose ISO, Sunday-start, January 1-based or fiscal weeks in
              global filters. All dates use UTC. Inventory is a current pooled
              snapshot, independent of reporting dates and channel selection.
            </p>
            <p class="settings-note">
              This is an interactive demo. Live authentication, tenant
              permissions, external integrations, billing and scheduled delivery
              require production services. No real connections or charges are
              created here.
            </p>
          </section>
          <section v-else class="settings-card">
            <h2>Keep your perspectives</h2>
            <p>
              Export all saved views and your active workspace settings. Restore
              a validated backup in another browser. Files contain demo
              preferences only.
            </p>
            <div class="button-row">
              <button class="button primary" @click="backup">
                ↓ Export workspace backup</button
              ><button class="button secondary" @click="importInput?.click()">
                ↑ Restore backup</button
              ><input
                ref="importInput"
                type="file"
                accept=".json,application/json"
                hidden
                @change="importBackup"
              />
            </div>
            <hr />
            <h3>Restore the default workspace</h3>
            <p>
              Resets your active filters, metrics and chart configuration. Your
              named views remain available.
            </p>
            <button
              v-if="!resetConfirm"
              class="button secondary"
              @click="resetConfirm = true"
            >
              Restore defaults
            </button>
            <div v-else class="inline-confirm">
              Reset active workspace?<button
                class="text-button"
                @click="
                  workspace.reset();
                  resetConfirm = false;
                  notice = 'Workspace defaults restored.';
                "
              >
                Reset workspace</button
              ><button class="text-button" @click="resetConfirm = false">
                Cancel
              </button>
            </div>
          </section>
        </template>
        <YearComparisonOverview
          v-else-if="page === 'overview'"
          :scope="filters"
          :catalog="data?.catalog || []"
          @currency="filters.currency = $event"
        />
        <template v-else>
          <section class="filter-panel" aria-label="Global filters">
            <ProductSearch v-model="filters.products" />
            <div v-if="selectedProductNames.length" class="selected-products">
              <button
                v-for="p in selectedProductNames"
                :key="p!.id"
                @click="
                  filters.products = filters.products.filter(
                    (id) => id !== p!.id,
                  )
                "
              >
                {{ p!.sku }} <span>×</span>
              </button>
            </div>
            <div class="filter-row">
              <label
                >Date range<select
                  :value="days"
                  @change="
                    workspace.setRange(
                      ($event.target as HTMLSelectElement)
                        .value as Preference['days'],
                    )
                  "
                >
                  <option
                    v-for="preset in datePresets"
                    :key="preset[0]"
                    :value="preset[0]"
                  >
                    {{ preset[1] }}
                  </option>
                </select></label
              ><label
                >From<input
                  v-model="filters.start"
                  type="date"
                  :max="filters.end"
                  @change="days = 'custom'" /></label
              ><label
                >To<input
                  v-model="filters.end"
                  type="date"
                  :min="filters.start"
                  @change="days = 'custom'" /></label
              ><label
                >Compare with<select v-model="filters.comparison">
                  <option value="previous">Previous period</option>
                  <option value="week">Previous week</option>
                  <option value="month">Previous month</option>
                  <option value="quarter">Previous quarter</option>
                  <option value="year">Same dates last year</option>
                  <option value="weekdays">
                    Equivalent weekdays last year
                  </option>
                  <option value="custom">Custom comparison</option>
                  <option value="none">No comparison</option>
                </select></label
              ><label
                >Granularity<select v-model="filters.granularity">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select></label
              ><label
                >Currency<select v-model="filters.currency">
                  <option>USD</option>
                  <option>CAD</option>
                  <option>GBP</option>
                </select></label
              >
            </div>
            <div class="filter-row secondary-filters">
              <label
                >Brand<select v-model="filters.brand">
                  <option value="">All brands</option>
                  <option>Studio Goods</option>
                  <option>Northline</option>
                  <option>Forma Home</option>
                </select></label
              ><label
                >Break down by<select v-model="filters.breakdown">
                  <option value="segment">Marketplace × channel</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="channel">Channel</option>
                  <option value="product">Product</option>
                  <option value="brand">Brand</option>
                  <option value="total">Combined total</option>
                </select></label
              ><label
                >Weekly calendar<select v-model="filters.calendar">
                  <option value="iso">ISO · Monday</option>
                  <option value="sunday">Sunday start</option>
                  <option value="january">January 1-based</option>
                  <option value="fiscal">Fiscal year-based</option>
                </select></label
              ><label v-if="filters.calendar === 'fiscal'"
                >Fiscal year begins<select v-model="filters.fiscalMonth">
                  <option
                    v-for="(month, index) in [
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ]"
                    :key="month"
                    :value="index + 1"
                  >
                    {{ month }}
                  </option>
                </select></label
              ><template v-if="filters.comparison === 'custom'"
                ><label
                  >Compare from<input
                    v-model="filters.compareStart"
                    type="date"
                    :max="filters.compareEnd" /></label
                ><label
                  >Compare to<input
                    v-model="filters.compareEnd"
                    type="date"
                    :min="filters.compareStart" /></label
              ></template>
            </div>
            <div class="filter-bottom">
              <fieldset>
                <legend>Marketplace</legend>
                <label
                  v-for="market in ['US', 'CA', 'UK'] as const"
                  :key="market"
                  class="filter-chip"
                  ><input
                    v-model="filters.marketplaces"
                    type="checkbox"
                    :value="market"
                  />{{ market }}</label
                >
              </fieldset>
              <fieldset>
                <legend>Channel</legend>
                <label
                  v-for="channel in ['amazon', 'shopify'] as const"
                  :key="channel"
                  class="filter-chip"
                  ><input
                    v-model="filters.channels"
                    type="checkbox"
                    :value="channel"
                  />{{ channel === "amazon" ? "Amazon" : "Shopify" }}</label
                >
              </fieldset>
              <small>UTC dates · Native currencies · No FX conversion</small
              ><button class="text-button" @click="resetFilters">
                Reset filters ↺
              </button>
            </div>
          </section>
          <div v-if="loading" class="loading-banner" role="status">
            <span class="loading-dot"></span
            >{{
              data
                ? "Updating analysis · previous results remain visible"
                : "Preparing your workspace…"
            }}
          </div>
          <div v-if="error" class="error-state" role="alert">
            <p>{{ error }}</p>
            <button class="button secondary" @click="workspace.fetchData(true)">
              Retry
            </button>
          </div>
          <section v-if="data?.mode === 'unavailable'" class="empty-state">
            <h2>The demo is switched off.</h2>
            <p>
              Start the application using the documented demo command to load
              synthetic products and reports.
            </p>
          </section>
          <div
            v-if="data?.mode === 'demo'"
            class="analytics-content"
            :class="{ 'is-updating': loading || !!error }"
            :aria-busy="loading"
            :inert="loading || !!error"
          >
            <div v-if="partialCoverage" class="coverage-note" role="status">
              Some selected dates extend outside demo history ({{
                data.coverage?.start
              }}
              — {{ data.coverage?.end }}). Totals and comparisons include
              available records only.
            </div>
            <template v-if="page === 'inventory'"
              ><InventoryPanel :data="data" @product="openProduct"
            /></template>
            <template v-else-if="page === 'reports'"
              ><ReportingCenter :data="data" :filters="filters"
            /></template>
            <template v-else>
              <div class="section-line">
                <h2>At a glance</h2>
                <span
                  >{{ filters.start }} — {{ filters.end }}
                  <span class="dot-divider">·</span>
                  {{ filters.currency }}</span
                >
              </div>
              <KpiCards
                :data="data"
                :ids="summaryIds"
                :active="page === 'explorer' ? metric : undefined"
                @focus="focus"
              />
              <div v-if="!data.rows.length" class="empty-state no-results">
                <span class="empty-icon">⌕</span>
                <h2>No records match these filters</h2>
                <p>
                  Try another currency, marketplace or product. US reports use
                  USD, Canada uses CAD, and the UK uses GBP.
                </p>
                <button class="button primary" @click="resetFilters">
                  Reset filters
                </button>
              </div>
              <template v-else>
                <section
                  v-if="page === 'explorer'"
                  id="chart-workspace"
                  class="chart-workspace"
                >
                  <div class="workspace-toolbar">
                    <div>
                      <h2>Performance over time</h2>
                      <p>Your metrics. Your perspective.</p>
                    </div>
                    <div class="workspace-controls">
                      <button
                        class="button secondary"
                        :aria-expanded="showCustomize"
                        @click="showCustomize = !showCustomize"
                      >
                        ⚙ Customize
                      </button>
                      <div class="layout-toggle" aria-label="Chart layout">
                        <button
                          v-for="mode in [
                            'carousel',
                            'grid',
                            'focus',
                            'compact',
                          ] as const"
                          :key="mode"
                          :aria-pressed="layout === mode"
                          :class="{ active: layout === mode }"
                          @click="layout = mode"
                        >
                          {{ mode }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <section v-if="showCustomize" class="customize-panel">
                    <div class="section-line">
                      <div>
                        <h3>Build your perspective</h3>
                        <p>
                          Select metrics, then drag to reorder or use the arrow
                          buttons. At least one metric stays visible.
                        </p>
                      </div>
                      <button
                        class="text-button"
                        @click="
                          visible = [...defaultMetrics];
                          metric = 'sales';
                          charts = {} as Preference['charts'];
                          columns = 2;
                        "
                      >
                        Restore chart defaults
                      </button>
                    </div>
                    <div class="customize-controls">
                      <label
                        >Grid columns<select v-model="columns">
                          <option v-for="n in 4" :key="n" :value="n">
                            {{ n }}
                          </option>
                        </select></label
                      ><label class="check-label"
                        ><input v-model="sync" type="checkbox" />Synchronize
                        chart crosshairs and zoom</label
                      >
                    </div>
                    <div class="metric-picker">
                      <button
                        v-for="id in metricIds"
                        :key="id"
                        :aria-pressed="visible.includes(id)"
                        :class="{ selected: visible.includes(id) }"
                        @click="toggleMetric(id)"
                      >
                        {{ visible.includes(id) ? "✓" : "＋" }}
                        {{ metrics[id].label }}
                      </button>
                    </div>
                    <ol class="metric-order">
                      <li
                        v-for="(id, index) in visible"
                        :key="id"
                        draggable="true"
                        @dragstart="dragged = index"
                        @dragover.prevent
                        @drop.prevent="
                          workspace.reorder(dragged, index);
                          dragged = -1;
                        "
                      >
                        <span aria-hidden="true">⠿</span
                        ><span>{{ metrics[id].label }}</span
                        ><button
                          :aria-label="`Move ${metrics[id].label} earlier`"
                          :disabled="index === 0"
                          @click="workspace.reorder(index, index - 1)"
                        >
                          ↑</button
                        ><button
                          :aria-label="`Move ${metrics[id].label} later`"
                          :disabled="index === visible.length - 1"
                          @click="workspace.reorder(index, index + 1)"
                        >
                          ↓
                        </button>
                      </li>
                    </ol>
                  </section>
                  <div
                    class="metric-tabs"
                    role="group"
                    aria-label="Metric selection"
                  >
                    <button
                      v-for="id in visible"
                      :key="id"
                      :class="{ active: metric === id }"
                      :aria-pressed="metric === id"
                      @click="metric = id"
                    >
                      {{ metrics[id].label }}
                    </button>
                    <div v-if="layout === 'carousel'" class="carousel-arrows">
                      <button aria-label="Previous metric" @click="cycle(-1)">
                        ←</button
                      ><button aria-label="Next metric" @click="cycle(1)">
                        →
                      </button>
                    </div>
                  </div>
                  <div
                    :class="['charts', `charts-${layout}`]"
                    :style="{ '--chart-columns': columns }"
                    @touchstart.passive="
                      touchStart = $event.changedTouches[0]?.clientX || 0
                    "
                    @touchend.passive="
                      layout === 'carousel' &&
                      Math.abs(
                        ($event.changedTouches[0]?.clientX || 0) - touchStart,
                      ) > 60 &&
                      cycle(
                        ($event.changedTouches[0]?.clientX || 0) > touchStart
                          ? -1
                          : 1,
                      )
                    "
                  >
                    <LazyAnalyticsChart
                      v-for="id in rendered"
                      :key="id"
                      hydrate-on-visible
                      :data="data"
                      :metric="id"
                      :compact="layout === 'compact'"
                      :kind="charts[id]?.kind"
                      :wide="charts[id]?.wide"
                      :sync="sync"
                      editable
                      @configure="configure(id, $event)"
                      @remove="toggleMetric(id)"
                      @focus="focus"
                      @point="openPoint"
                    />
                  </div>
                  <button
                    v-if="layout === 'focus'"
                    class="text-button"
                    @click="
                      layout =
                        previousLayout === 'focus' ? 'carousel' : previousLayout
                    "
                  >
                    ← Back to
                    {{
                      previousLayout === "focus" ? "carousel" : previousLayout
                    }}
                  </button>
                </section>
                <template v-else-if="page === 'profitability'"
                  ><ProfitBridge :data="data" />
                  <div class="module-charts">
                    <LazyAnalyticsChart
                      :data="data"
                      metric="netProfit"
                      :kind="charts.netProfit?.kind"
                      :sync="true"
                      @configure="configure('netProfit', $event)"
                      @focus="focus"
                      @point="openPoint"
                    /><LazyAnalyticsChart
                      :data="data"
                      metric="margin"
                      :kind="charts.margin?.kind"
                      :sync="true"
                      @configure="configure('margin', $event)"
                      @focus="focus"
                      @point="openPoint"
                    /></div
                ></template>
                <template v-else-if="page === 'sales'"
                  ><div class="module-charts">
                    <LazyAnalyticsChart
                      :data="data"
                      metric="sales"
                      :kind="charts.sales?.kind"
                      :sync="true"
                      @configure="configure('sales', $event)"
                      @focus="focus"
                      @point="openPoint"
                    /><LazyAnalyticsChart
                      :data="data"
                      metric="orders"
                      :kind="charts.orders?.kind"
                      :sync="true"
                      @configure="configure('orders', $event)"
                      @focus="focus"
                      @point="openPoint"
                    /></div
                ></template>
                <template v-else-if="page === 'advertising'"
                  ><div class="module-charts">
                    <LazyAnalyticsChart
                      v-for="id in [
                        'adSpend',
                        'adSales',
                        'acos',
                        'roas',
                      ] as const"
                      :key="id"
                      :data="data"
                      :metric="id"
                      :kind="charts[id]?.kind"
                      :sync="true"
                      @configure="configure(id, $event)"
                      @focus="focus"
                      @point="openPoint"
                    />
                  </div>
                  <div class="inventory-stats ad-stats">
                    <article
                      v-for="id in [
                        'impressions',
                        'clicks',
                        'ctr',
                        'cpc',
                      ] as const"
                      :key="id"
                    >
                      <span>{{ metrics[id].label }}</span
                      ><strong>{{
                        formatMetric(id, data.totals[id], data.currency)
                      }}</strong
                      ><small>{{ metrics[id].definition }}</small>
                    </article>
                  </div></template
                >
                <section class="table-panel">
                  <div class="section-line">
                    <div>
                      <h2>
                        {{
                          page === "products"
                            ? "Your product portfolio"
                            : "Behind the numbers"
                        }}
                      </h2>
                      <p>
                        The same filtered dataset. Reconciled across charts,
                        cards and reports.
                      </p>
                    </div>
                    <div class="button-row">
                      <select v-model="sourceTab" aria-label="Report grouping">
                        <option value="product">By product</option>
                        <option value="segment">By market / channel</option>
                        <option value="date">By date</option>
                      </select>
                    </div>
                  </div>
                  <ReportTable
                    :key="`${page}-${sourceTab}`"
                    :storage-key="`${page}-${sourceTab}`"
                    :data="data"
                    :group="sourceTab"
                    :ids="
                      page === 'advertising'
                        ? [
                            'adSpend',
                            'adSales',
                            'acos',
                            'roas',
                            'clicks',
                            'cpc',
                          ]
                        : undefined
                    "
                    @product="openProduct"
                  />
                </section>
              </template>
              <section v-if="page === 'explorer'" class="save-bar">
                <div>
                  <strong>Make this perspective yours.</strong
                  ><small
                    >Save filters, metric order, chart types and layout in this
                    browser.</small
                  >
                </div>
                <form @submit.prevent="saveView">
                  <input
                    v-model="viewName"
                    aria-label="View name"
                    placeholder="Name this view…"
                    maxlength="80"
                    required
                  /><button class="button primary" type="submit">
                    ＋ Save view
                  </button>
                </form>
                <button
                  v-if="activeSaved"
                  class="button secondary"
                  @click="
                    workspace.update(activeSaved);
                    notice = 'Saved view updated.';
                  "
                >
                  Update saved view
                </button>
              </section>
            </template>
          </div>
        </template>
        <footer v-if="page !== 'overview'" class="page-footer">
          <span>◎ Synthetic demo data · Native currency reporting · UTC</span
          ><span
            >ZONHACK ANALYTICS
            <span class="version">DEMO WORKSPACE / 02</span></span
          >
        </footer>
      </div>
    </main>
    <dialog ref="drill" class="drill-dialog" @close="detailOpen = false">
      <header>
        <div>
          <span class="eyebrow">UNDERLYING PERFORMANCE</span>
          <h2>{{ drillTitle }}</h2>
          <p>
            {{ filters.start }} — {{ filters.end }} · {{ filters.currency }} ·
            Synthetic demo records
          </p>
        </div>
        <button
          class="button secondary"
          aria-label="Close detail"
          @click="drill?.close()"
        >
          Close ×
        </button>
      </header>
      <template v-if="data && detailOpen"
        ><KpiCards
          v-if="productData"
          :data="productData"
          :ids="['sales', 'netProfit', 'units', 'orders', 'acos', 'roas']"
          @focus="
            (id) => {
              drill?.close();
              filters.products = [drillProduct];
              focus(id);
            }
          "
        /><SourceRecords
          :data="data"
          :product-id="drillProduct"
          :start="drillStart"
          :end="drillEnd"
        />
        <div v-if="drillProduct" class="dialog-footer">
          <button
            class="button primary"
            @click="
              filters.products = [drillProduct];
              drill?.close();
              navigate('explorer');
            "
          >
            Analyze this product →
          </button>
        </div></template
      >
    </dialog>
  </div>
</template>
