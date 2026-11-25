<script setup lang="ts">
import type { AnalyticsResult } from "~~/shared/types/analytics";
import { formatMetric } from "~~/shared/analytics/metrics";
const props = defineProps<{ data: AnalyticsResult }>();
defineEmits<{ product: [id: string] }>();
const status = ref("All"),
  search = ref("");
const rows = computed(() =>
  (props.data.inventory || []).filter(
    (r) =>
      (status.value === "All" || r.status === status.value) &&
      `${product(r.productId)?.title} ${product(r.productId)?.sku}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);
const all = computed(() => props.data.inventory || []);
function product(id: string) {
  return props.data.catalog?.find((p) => p.id === id);
}
const { inventoryCsv } = useExports();
</script>
<template>
  <div class="inventory-note">
    <span class="status-dot"></span> Snapshot as of {{ data.inventoryAsOf }} ·
    Pooled stock across channels · Velocity based on the latest 30 days. Date
    and channel filters apply to performance reports, not this snapshot.
  </div>
  <div class="inventory-stats">
    <article>
      <span>Available units</span
      ><strong>{{
        all.reduce((n, r) => n + r.available, 0).toLocaleString()
      }}</strong
      ><small>Ready to sell</small>
    </article>
    <article>
      <span>Inventory value</span
      ><strong>{{
        formatMetric(
          "sales",
          all.reduce((n, r) => n + r.value, 0),
          data.currency,
        )
      }}</strong
      ><small>At demo cost of goods</small>
    </article>
    <article>
      <span>Needs attention</span
      ><strong>{{
        all.filter(
          (r) => r.status === "Low stock" || r.status === "Out of stock",
        ).length
      }}</strong
      ><small>SKU / market combinations</small>
    </article>
    <article>
      <span>Inbound units</span
      ><strong>{{
        all.reduce((n, r) => n + r.inbound, 0).toLocaleString()
      }}</strong
      ><small>On the way to warehouse</small>
    </article>
  </div>
  <section class="table-panel">
    <div class="section-line">
      <div>
        <h2>Stock health</h2>
        <p>A 45-day target cover, including inbound stock.</p>
      </div>
      <button class="button secondary" @click="inventoryCsv(data)">
        ↓ Export inventory
      </button>
    </div>
    <div class="report-toolbar">
      <input
        v-model="search"
        aria-label="Search inventory"
        placeholder="Search products…"
      /><select v-model="status" aria-label="Stock status">
        <option>All</option>
        <option>Healthy</option>
        <option>Low stock</option>
        <option>Out of stock</option>
        <option>Overstock</option></select
      ><span>{{ rows.length }} positions</span>
    </div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Product / marketplace</th>
            <th>Status</th>
            <th>Available</th>
            <th>Inbound</th>
            <th>Reserved</th>
            <th>Units / day</th>
            <th>Days cover</th>
            <th>Suggested reorder</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="`${row.productId}-${row.marketplace}`">
            <td>
              <button
                class="product-cell"
                @click="$emit('product', row.productId)"
              >
                <span
                  class="product-tile"
                  :style="{ background: product(row.productId)?.color }"
                  >{{ product(row.productId)?.icon }}</span
                ><span
                  ><strong>{{ product(row.productId)?.title }}</strong
                  ><small
                    >{{ product(row.productId)?.sku }} ·
                    {{ row.marketplace }}</small
                  ></span
                >
              </button>
            </td>
            <td>
              <span
                class="health-badge"
                :class="
                  row.status === 'Healthy'
                    ? 'healthy'
                    : row.status === 'Overstock'
                      ? 'overstock'
                      : 'low'
                "
                >{{ row.status }}</span
              >
            </td>
            <td>{{ row.available.toLocaleString() }}</td>
            <td>{{ row.inbound.toLocaleString() }}</td>
            <td>{{ row.reserved }}</td>
            <td>{{ row.dailyUnits.toFixed(1) }}</td>
            <td>
              <span class="cover-bar"
                ><i
                  :style="{ width: `${Math.min(100, row.daysRemaining)}%` }"
                ></i></span
              >{{ row.daysRemaining.toFixed(0) }}d
            </td>
            <td>{{ row.reorder.toLocaleString() }}</td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="8" class="table-empty">
              No inventory matches these filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
