<script setup lang="ts">
import { z } from "zod";
import { isoDate, shiftMonths } from "~~/shared/analytics/calendar";
import {
  yearComparisonSchema,
  type YearComparisonRequest,
  type YearComparisonResult,
} from "~~/shared/analytics/year-comparison";
import {
  overviewSelectionSchema,
  type OverviewSelection,
  overviewMarkets,
} from "~~/shared/analytics/overview-selection";
import type { Product, Filters } from "~~/shared/types/analytics";
const props = defineProps<{ scope: Filters; catalog: Product[] }>();
const emit = defineEmits<{ currency: [value: Filters["currency"]] }>();
const today = isoDate(new Date()),
  currentYear = Number(today.slice(0, 4)),
  availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
const settingsSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  compare: z.array(z.number().int()).min(1).max(2),
  start: z.iso.date(),
  end: z.iso.date(),
  alignElapsed: z.boolean(),
  resolution: z.enum(["weekly", "monthly"]),
});
const active = ref(
  settingsSchema.parse({
    year: currentYear,
    compare: [currentYear - 1],
    start: `${currentYear}-01-01`,
    end: `${currentYear}-12-31`,
    alignElapsed: true,
    resolution: "monthly",
  }),
);
const draft = ref({
    ...toRaw(active.value),
    compare: [...active.value.compare],
  }),
  panelOpen = ref(false),
  formError = ref(""),
  loading = ref(true),
  error = ref(""),
  data = shallowRef<YearComparisonResult | null>(null);
const calendarMonth = ref(new Date().getUTCMonth()),
  edge = ref<"start" | "end">("start");
const colors = computed(
  () =>
    Object.fromEntries(
      availableYears.map((year, i) => [
        year,
        ["#4b60eb", "#c88a47", "#9a7cc6", "#4f9b9d", "#9aa5b3"][i]!,
      ]),
    ) as Record<number, string>,
);
const selection = ref<OverviewSelection>(overviewSelectionSchema.parse({}));
function selectScope(value: OverviewSelection) {
  if (
    value.marketplace === selection.value.marketplace &&
    value.skuMode === selection.value.skuMode &&
    value.skuId === selection.value.skuId
  )
    return;
  const changedMarket = value.marketplace !== selection.value.marketplace;
  selection.value = value;
  if (changedMarket && value.marketplace !== "all") {
    const market = overviewMarkets.find((m) => m.id === value.marketplace);
    if (market) emit("currency", market.currency);
  }
  try {
    localStorage.setItem(
      "zonhack:demo:overview-scope:v1",
      JSON.stringify(value),
    );
  } catch {
    /* optional preferences */
  }
}
const lines = computed(() => data.value?.[active.value.resolution] || []);
const monthName = computed(() =>
  new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(draft.value.year, calendarMonth.value, 1)),
  ),
);
const calendarDays = computed(() => {
  const first = new Date(Date.UTC(draft.value.year, calendarMonth.value, 1)),
    offset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(
      Date.UTC(draft.value.year, calendarMonth.value, 1 - offset + i),
    );
    return {
      date: isoDate(d),
      day: d.getUTCDate(),
      current: d.getUTCMonth() === calendarMonth.value,
    };
  });
});
const dateLabel = computed(
  () =>
    `${new Date(active.value.start + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} — ${new Date(active.value.end + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`,
);
let controller: AbortController | undefined,
  timer: ReturnType<typeof setTimeout> | undefined;
function request(): YearComparisonRequest {
  return yearComparisonSchema.parse({
    year: active.value.year,
    years: [active.value.year, ...active.value.compare],
    start: active.value.start,
    end: active.value.end,
    alignElapsed: active.value.alignElapsed,
    currency: props.scope.currency,
    convertCurrency: true,
    products: selection.value.skuMode === "all" ? [] : [selection.value.skuId],
    brand: "",
    marketplaces:
      selection.value.marketplace === "all"
        ? []
        : [selection.value.marketplace],
    channels: [],
  });
}
async function load() {
  controller?.abort();
  const current = new AbortController();
  controller = current;
  loading.value = true;
  error.value = "";
  try {
    const result = await $fetch<YearComparisonResult>("/api/year-comparison", {
      method: "POST",
      body: request(),
      signal: current.signal,
    });
    if (controller === current) data.value = result;
  } catch (e) {
    if (!current.signal.aborted)
      error.value =
        e instanceof Error ? e.message : "Could not load comparison";
  } finally {
    if (controller === current) loading.value = false;
  }
}
function openPanel() {
  if (!panelOpen.value) {
    draft.value = {
      ...toRaw(active.value),
      compare: [...active.value.compare],
    };
    formError.value = "";
  }
  panelOpen.value = !panelOpen.value;
}
function changeYear(value: string) {
  const year = Number(value),
    old = draft.value.year;
  draft.value.start = shiftMonths(draft.value.start, (year - old) * 12);
  draft.value.end = shiftMonths(draft.value.end, (year - old) * 12);
  draft.value.year = year;
  draft.value.compare = draft.value.compare.filter((y) => y !== year);
  if (!draft.value.compare.length)
    draft.value.compare = [availableYears.find((y) => y !== year)!];
}
function selectDay(date: string) {
  if (edge.value === "start") {
    draft.value.start = date;
    if (date > draft.value.end) draft.value.end = date;
    edge.value = "end";
  } else {
    if (date < draft.value.start) draft.value.start = date;
    draft.value.end = date;
    edge.value = "start";
  }
}
function preset(elapsed: boolean) {
  draft.value.start = `${draft.value.year}-01-01`;
  draft.value.end = elapsed
    ? shiftMonths(today, (draft.value.year - currentYear) * 12)
    : `${draft.value.year}-12-31`;
}
function apply() {
  const value = { ...draft.value, resolution: active.value.resolution };
  const parsed = yearComparisonSchema.safeParse({
    ...value,
    years: [value.year, ...value.compare],
  });
  if (!parsed.success) {
    formError.value = parsed.error.issues.map((i) => i.message).join(". ");
    return;
  }
  active.value = { ...value, compare: [...value.compare] };
  panelOpen.value = false;
  persist();
}
function persist() {
  try {
    localStorage.setItem(
      "zonhack:demo:year-overview:v1",
      JSON.stringify(toRaw(active.value)),
    );
  } catch {
    /* preferences are optional */
  }
}
watch(() => active.value.resolution, persist);
onMounted(() => {
  try {
    const stored = settingsSchema.safeParse(
      JSON.parse(
        localStorage.getItem("zonhack:demo:year-overview:v1") || "null",
      ),
    );
    if (
      stored.success &&
      yearComparisonSchema.safeParse({
        ...stored.data,
        years: [stored.data.year, ...stored.data.compare],
      }).success
    )
      active.value = stored.data;
  } catch {
    /* use current-year defaults */
  }
  try {
    const saved = overviewSelectionSchema.safeParse(
      JSON.parse(
        localStorage.getItem("zonhack:demo:overview-scope:v1") || "null",
      ),
    );
    if (saved.success) selection.value = saved.data;
  } catch {
    /* use defaults */
  }
  void load();
  watch(
    () => [
      active.value.year,
      active.value.compare,
      active.value.start,
      active.value.end,
      active.value.alignElapsed,
      props.scope.currency,
      selection.value,
    ],
    () => {
      controller?.abort();
      clearTimeout(timer);
      timer = setTimeout(() => void load(), 120);
    },
    { deep: true },
  );
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  controller?.abort();
});
</script>
<template>
  <section
    class="comparison-workspace"
    :class="{ 'comparison-panel-open': panelOpen }"
    aria-label="Yearly comparison workspace"
    @keydown.esc="panelOpen = false"
  >
    <header class="comparison-toolbar">
      <div class="comparison-title">
        <h1>Overview</h1>
        <span class="comparison-title-divider"></span><span>Year over year</span
        ><span
          class="comparison-demo"
          title="All figures are synthetic demo data"
          >DEMO</span
        >
      </div>
      <OverviewScopeSelectors
        :selection="selection"
        :catalog="catalog"
        :currency="scope.currency"
        @select="selectScope"
      />
      <div class="comparison-controls">
        <div class="comparison-resolution" aria-label="Comparison resolution">
          <button
            :class="{ active: active.resolution === 'weekly' }"
            :aria-pressed="active.resolution === 'weekly'"
            @click="active.resolution = 'weekly'"
          >
            Weekly</button
          ><button
            :class="{ active: active.resolution === 'monthly' }"
            :aria-pressed="active.resolution === 'monthly'"
            @click="active.resolution = 'monthly'"
          >
            Monthly
          </button>
        </div>
        <button
          class="comparison-date-toggle"
          :class="{ active: panelOpen }"
          aria-controls="comparison-date-panel"
          :aria-expanded="panelOpen"
          aria-label="Date and year comparison"
          @click="openPanel"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
            aria-hidden="true"
          >
            <path d="M4 5h12v12H4zM4 8h12M7 3v4m6-4v4" /></svg
          ><span
            >{{ active.year }} <span class="date-versus">vs</span>
            {{ active.compare.join(" / ") }}<small>{{ dateLabel }}</small></span
          ><svg
            class="date-chevron"
            :class="{ open: panelOpen }"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="m6 4 4 4-4 4" />
          </svg>
        </button>
      </div>
    </header>
    <div class="comparison-layout">
      <div class="comparison-plots" :aria-busy="loading">
        <div v-if="error" class="comparison-error" role="alert">
          {{ error }}<button @click="load">Retry</button>
        </div>
        <div
          v-else-if="loading && !data"
          class="comparison-skeleton"
          role="status"
          aria-label="Loading yearly graphs"
        >
          <span></span><span></span><span></span>
        </div>
        <div v-else-if="data?.mode === 'unavailable'" class="comparison-error">
          Demo data is switched off.
        </div>
        <div
          v-else-if="data"
          class="year-chart-grid"
          :class="{ 'comparison-refreshing': loading }"
        >
          <LazyYearComparisonChart
            v-for="(id, index) in [
              'sales',
              'netProfit',
              'adSpend',
              'units',
              'orders',
              'acos',
            ] as const"
            :key="id"
            :metric="id"
            :lines="lines"
            :resolution="active.resolution"
            :currency="data.currency"
            :primary="active.year"
            :colors="colors"
            :hero="index === 0 || index === 5"
          />
        </div>
      </div>
      <aside
        v-if="panelOpen"
        id="comparison-date-panel"
        class="comparison-date-panel"
        aria-label="Date comparison panel"
      >
        <header>
          <div>
            <span>YEARLY COMPARISON</span>
            <h2>Date range</h2>
          </div>
          <button aria-label="Close date panel" @click="panelOpen = false">
            ×
          </button>
        </header>
        <div class="date-panel-content">
          <label class="reference-year"
            >Reference year<select
              :value="draft.year"
              @change="changeYear(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select></label
          >
          <fieldset class="comparison-year-options">
            <legend>Compare with</legend>
            <label
              v-for="year in availableYears.filter((y) => y !== draft.year)"
              :key="year"
              ><input
                v-model="draft.compare"
                type="checkbox"
                :value="year"
                :disabled="
                  draft.compare.length >= 2 && !draft.compare.includes(year)
                "
              /><i :style="{ background: colors[year] }"></i>{{ year }}</label
            >
          </fieldset>
          <div class="date-range-presets">
            <button @click="preset(false)">Full year</button
            ><button @click="preset(true)">Year to date</button>
          </div>
          <div class="comparison-date-inputs">
            <label :class="{ focused: edge === 'start' }"
              >From<input
                v-model="draft.start"
                type="date"
                :min="`${draft.year}-01-01`"
                :max="draft.end"
                @focus="edge = 'start'" /></label
            ><label :class="{ focused: edge === 'end' }"
              >To<input
                v-model="draft.end"
                type="date"
                :min="draft.start"
                :max="`${draft.year}-12-31`"
                @focus="edge = 'end'"
            /></label>
          </div>
          <div class="comparison-calendar">
            <header>
              <strong>{{ monthName }} {{ draft.year }}</strong>
              <div>
                <button
                  :disabled="calendarMonth === 0"
                  aria-label="Previous calendar month"
                  @click="calendarMonth--"
                >
                  ‹</button
                ><button
                  :disabled="calendarMonth === 11"
                  aria-label="Next calendar month"
                  @click="calendarMonth++"
                >
                  ›
                </button>
              </div>
            </header>
            <div class="calendar-weekdays">
              <span
                v-for="(day, index) in ['M', 'T', 'W', 'T', 'F', 'S', 'S']"
                :key="index"
                >{{ day }}</span
              >
            </div>
            <div class="calendar-date-grid">
              <button
                v-for="day in calendarDays"
                :key="day.date"
                :aria-label="`Select ${day.date}`"
                :aria-pressed="
                  day.date === draft.start || day.date === draft.end
                "
                :disabled="!day.current"
                :class="{
                  'outside-month': !day.current,
                  'in-range':
                    day.current &&
                    day.date > draft.start &&
                    day.date < draft.end,
                  'range-end':
                    day.date === draft.start || day.date === draft.end,
                  'is-today': day.date === today,
                }"
                @click="selectDay(day.date)"
              >
                {{ day.day }}
              </button>
            </div>
          </div>
          <label class="elapsed-option"
            ><input v-model="draft.alignElapsed" type="checkbox" /><span
              >Match elapsed dates<small
                >Compare the same part of each year.</small
              ></span
            ></label
          ><label class="comparison-currency"
            >Reporting currency<select
              :value="scope.currency"
              @change="
                emit(
                  'currency',
                  ($event.target as HTMLSelectElement)
                    .value as Filters['currency'],
                )
              "
            >
              <option>USD</option>
              <option>CAD</option>
              <option>GBP</option>
            </select></label
          >
          <p class="date-panel-note">
            {{
              active.resolution === "weekly"
                ? "Weeks run January 1–7, January 8–14, and so on. Week 53 may be partial."
                : "Months use calendar boundaries."
            }}
            Dates are UTC. Current-year figures stop at
            {{ data?.today || today }}; missing periods stay empty.
          </p>
          <p v-if="formError" class="date-panel-error" role="alert">
            {{ formError }}
          </p>
        </div>
        <footer>
          <button class="apply-year-comparison" @click="apply">
            Apply comparison
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M3 13 13 3M3 3h10v10" />
            </svg>
          </button>
        </footer>
      </aside>
    </div>
  </section>
</template>
