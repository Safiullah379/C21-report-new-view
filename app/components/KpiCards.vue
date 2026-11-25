<script setup lang="ts">
import {
  aggregate,
  metrics,
  formatMetric,
  change,
} from "~~/shared/analytics/metrics";
import type { AnalyticsResult, MetricId } from "~~/shared/types/analytics";
const props = defineProps<{
  data: AnalyticsResult;
  ids: readonly MetricId[];
  active?: MetricId;
}>();
defineEmits<{ focus: [id: MetricId] }>();
const daily = computed(() => {
  const groups = new Map<string, typeof props.data.rows>();
  for (const row of props.data.rows) {
    const rows = groups.get(row.date) || [];
    rows.push(row);
    groups.set(row.date, rows);
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, rows]) => aggregate(rows));
});
function spark(id: MetricId) {
  const values = daily.value
      .map((v) => v[id])
      .filter((v): v is number => v !== null),
    low = Math.min(...values),
    high = Math.max(...values);
  return values
    .map(
      (v, i) =>
        `${(i / Math.max(1, values.length - 1)) * 100},${26 - ((v - low) / (high - low || 1)) * 22}`,
    )
    .join(" ");
}
function delta(id: MetricId) {
  const previous = props.data.previous?.[id] ?? null,
    current = props.data.totals[id],
    diff = change(current, previous);
  return metrics[id].format === "percent" && diff.absolute !== null
    ? `${diff.absolute >= 0 ? "+" : ""}${diff.absolute.toFixed(1)} pp`
    : diff.percent === null
      ? "—"
      : `${diff.percent >= 0 ? "+" : ""}${diff.percent.toFixed(1)}%`;
}
function favorable(id: MetricId) {
  const diff = change(
    props.data.totals[id],
    props.data.previous?.[id] ?? null,
  ).absolute;
  return diff === null || diff === 0
    ? "neutral"
    : diff > 0 === (metrics[id].favorable === "up")
      ? "positive"
      : "negative";
}
</script>
<template>
  <section class="kpi-grid" aria-label="Performance summary">
    <button
      v-for="id in ids"
      :key="id"
      class="kpi-card"
      :class="{ 'active-kpi': active === id }"
      :title="metrics[id].definition"
      @click="$emit('focus', id)"
    >
      <span
        >{{ metrics[id].label
        }}<span class="metric-info" aria-hidden="true">ⓘ</span></span
      ><strong>{{ formatMetric(id, data.totals[id], data.currency) }}</strong
      ><svg
        v-if="data.series.length"
        class="sparkline"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          :points="spark(id)"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          vector-effect="non-scaling-stroke"
        /></svg
      ><small :class="favorable(id)"
        >{{ data.previous ? delta(id) : "No comparison"
        }}<span v-if="data.previous"
          >was {{ formatMetric(id, data.previous[id], data.currency) }}</span
        ></small
      >
    </button>
  </section>
</template>
