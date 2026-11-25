<script setup lang="ts">
import type {
  AnalyticsResult,
  Filters,
  MetricId,
} from "~~/shared/types/analytics";
import { metrics, formatMetric } from "~~/shared/analytics/metrics";
defineProps<{ data: AnalyticsResult; filters: Filters }>();
const { rawCsv, summaryCsv, inventoryCsv, excel } = useExports();
const title = ref("Business performance report"),
  report = ref<"executive" | "sales" | "advertising" | "profitability">(
    "executive",
  ),
  note = ref("");
const presets: Record<typeof report.value, MetricId[]> = {
  executive: [
    "sales",
    "netSales",
    "netProfit",
    "margin",
    "orders",
    "conversion",
  ],
  sales: ["sales", "netSales", "organicSales", "units", "orders", "aov"],
  advertising: ["adSpend", "adSales", "acos", "tacos", "roas", "ctr", "cpc"],
  profitability: [
    "sales",
    "refunds",
    "promotions",
    "netSales",
    "cogs",
    "operatingCosts",
    "netProfit",
    "margin",
    "roi",
  ],
};
const ids = computed(() => presets[report.value]);
function print() {
  window.print();
}
</script>
<template>
  <div class="report-builder">
    <section class="settings-card report-options">
      <span class="eyebrow">REPORT BUILDER</span>
      <h2>The right numbers. Ready to share.</h2>
      <label
        >Report title<input
          v-model="title"
          maxlength="100"
          placeholder="Business performance report" /></label
      ><label
        >Report type<select v-model="report">
          <option value="executive">Executive summary</option>
          <option value="sales">Sales performance</option>
          <option value="advertising">Advertising efficiency</option>
          <option value="profitability">Profit and loss</option>
        </select></label
      ><label
        >Notes<textarea
          v-model="note"
          rows="4"
          maxlength="1500"
          placeholder="Add context for your report…"
        ></textarea>
      </label>
      <p>
        Uses the current global filters and native {{ data.currency }} values.
        All exports are marked as synthetic demo data.
      </p>
      <button
        class="button primary"
        :disabled="!data.rows.length"
        @click="
          excel(data, ids, [
            title,
            `${filters.start} — ${filters.end} · ${data.currency}`,
            note,
          ])
        "
      >
        ↓ Download Excel</button
      ><button
        class="button secondary"
        :disabled="!data.rows.length"
        @click="summaryCsv(data, ids)"
      >
        ↓ Download summary CSV</button
      ><button class="button secondary" @click="print">
        Print / Save as PDF
      </button>
    </section>
    <section class="report-preview">
      <div class="report-brand">
        <strong>zonhack<span>.</span></strong
        ><span>BUSINESS INTELLIGENCE</span>
      </div>
      <p
        v-if="
          data.coverage &&
          (filters.start < data.coverage.start ||
            filters.end > data.coverage.end ||
            (data.comparisonRange &&
              (data.comparisonRange.start < data.coverage.start ||
                data.comparisonRange.end > data.coverage.end)))
        "
        class="coverage-note"
      >
        Partial data coverage. Demo history: {{ data.coverage.start }} —
        {{ data.coverage.end }}. Available records only.
      </p>
      <span class="report-watermark">SYNTHETIC DEMO REPORT</span>
      <h2>{{ title || "Business performance report" }}</h2>
      <p>
        {{ filters.start }} — {{ filters.end }} · {{ data.currency }} ·
        {{ filters.brand || "All brands" }}
      </p>
      <p>
        Marketplaces: {{ filters.marketplaces.join(", ") || "All" }} · Channels:
        {{ filters.channels.join(", ") || "All" }} ·
        {{
          filters.products.length
            ? `${filters.products.length} selected product identities`
            : "All products"
        }}
      </p>
      <p v-if="note" class="report-note">{{ note }}</p>
      <div class="report-summary">
        <div v-for="id in ids" :key="id">
          <span>{{ metrics[id].label }}</span
          ><strong>{{
            formatMetric(id, data.totals[id], data.currency)
          }}</strong
          ><small v-if="data.previous"
            >Comparison:
            {{ formatMetric(id, data.previous[id], data.currency) }}</small
          >
        </div>
      </div>
      <h3>Performance by {{ filters.breakdown }}</h3>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Segment</th>
              <th v-for="id in ids.slice(0, 4)" :key="id">
                {{ metrics[id].label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="segment in data.breakdown" :key="segment.dimension">
              <td>{{ segment.dimension }}</td>
              <td v-for="id in ids.slice(0, 4)" :key="id">
                {{ formatMetric(id, segment.values[id], data.currency) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="data.comparisonRange" class="report-disclaimer">
        Comparison dates: {{ data.comparisonRange.start }} —
        {{ data.comparisonRange.end }}. Periods may have different lengths.
      </p>
      <footer>
        Generated {{ new Date(data.generatedAt).toISOString().slice(0, 10) }} ·
        Sample figures for demonstration only.
      </footer>
    </section>
  </div>
  <section class="settings-card data-downloads">
    <div>
      <h2>Take the details with you</h2>
      <p>Download the exact source records or the latest inventory snapshot.</p>
    </div>
    <button
      class="button secondary"
      :disabled="!data.rows.length"
      @click="rawCsv(data)"
    >
      ↓ Detailed records CSV</button
    ><button
      class="button secondary"
      :disabled="!data.inventory?.length"
      @click="inventoryCsv(data)"
    >
      ↓ Inventory CSV
    </button>
  </section>
</template>
