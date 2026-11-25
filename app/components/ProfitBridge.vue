<script setup lang="ts">
import type { AnalyticsResult, MetricId } from "~~/shared/types/analytics";
import { metrics, formatMetric } from "~~/shared/analytics/metrics";
const props = defineProps<{ data: AnalyticsResult }>();
const items: { id: MetricId; negative?: boolean }[] = [
  { id: "sales" },
  { id: "refunds", negative: true },
  { id: "promotions", negative: true },
  { id: "cogs", negative: true },
  { id: "fees", negative: true },
  { id: "fulfillment", negative: true },
  { id: "storage", negative: true },
  { id: "adSpend", negative: true },
  { id: "netProfit" },
];
const width = (id: MetricId) =>
  Math.max(
    0,
    Math.min(
      100,
      (Math.abs(props.data.totals[id] || 0) / (props.data.totals.sales || 1)) *
        100,
    ),
  );
</script>
<template>
  <section class="table-panel profit-bridge">
    <div class="section-line">
      <div>
        <h2>Where your revenue goes</h2>
        <p>Synthetic profit bridge · every cost included once.</p>
      </div>
      <span class="badge">{{ data.currency }}</span>
    </div>
    <div v-for="item in items" :key="item.id" class="bridge-row">
      <span>{{ metrics[item.id].label }}</span>
      <div>
        <i
          :class="{ expense: item.negative }"
          :style="{ width: `${width(item.id)}%` }"
        ></i>
      </div>
      <strong
        >{{ item.negative ? "−" : ""
        }}{{
          formatMetric(item.id, data.totals[item.id], data.currency)
        }}</strong
      >
    </div>
  </section>
</template>
