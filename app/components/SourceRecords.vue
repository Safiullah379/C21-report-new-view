<script setup lang="ts">
import type { AnalyticsResult } from "~~/shared/types/analytics";
import { aggregate, formatMetric } from "~~/shared/analytics/metrics";
const props = defineProps<{
  data: AnalyticsResult;
  productId?: string;
  start?: string;
  end?: string;
}>();
const page = ref(1),
  search = ref("");
const rows = computed(() =>
  props.data.rows
    .filter(
      (r) =>
        (!props.productId || r.productId === props.productId) &&
        (!props.start || r.date >= props.start) &&
        (!props.end || r.date <= props.end) &&
        `${r.date} ${r.channel} ${r.marketplace} ${props.data.catalog?.find((p) => p.id === r.productId)?.sku}`
          .toLowerCase()
          .includes(search.value.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date)),
);
const pages = computed(() => Math.max(1, Math.ceil(rows.value.length / 20)));
watch(
  [search, () => props.productId, () => props.start, () => props.data],
  () => (page.value = 1),
);
</script>
<template>
  <div class="report-toolbar">
    <input
      v-model="search"
      aria-label="Search source records"
      placeholder="Search date, SKU, channel…"
    /><span>{{ rows.length.toLocaleString() }} records</span>
  </div>
  <div class="table-scroll report-scroll">
    <table>
      <thead>
        <tr>
          <th>Date / product</th>
          <th>Market</th>
          <th>Channel</th>
          <th>Sales</th>
          <th>Net profit</th>
          <th>Units</th>
          <th>Ad spend</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows.slice((page - 1) * 20, page * 20)" :key="i">
          <td>
            {{ row.date
            }}<small class="cell-subtitle">{{
              data.catalog?.find((p) => p.id === row.productId)?.sku
            }}</small>
          </td>
          <td>{{ row.marketplace }}</td>
          <td>{{ row.channel }}</td>
          <td>{{ formatMetric("sales", row.sales, data.currency) }}</td>
          <td>
            {{
              formatMetric(
                "netProfit",
                aggregate([row]).netProfit,
                data.currency,
              )
            }}
          </td>
          <td>{{ row.units }}</td>
          <td>{{ formatMetric("adSpend", row.adSpend, data.currency) }}</td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="7" class="table-empty">
            No source records in this selection.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="pagination">
    <span>Page {{ page }} of {{ pages }}</span
    ><button class="button secondary" :disabled="page <= 1" @click="page--">
      Previous</button
    ><button class="button secondary" :disabled="page >= pages" @click="page++">
      Next
    </button>
  </div>
</template>
