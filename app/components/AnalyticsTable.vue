<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type SortingState,
} from "@tanstack/vue-table";
import type { AnalyticsResult } from "~~/shared/types/analytics";
import { formatMetric } from "~~/shared/analytics/metrics";
const props = defineProps<{ data: AnalyticsResult }>();
const sorting = ref<SortingState>([]);
const table = useVueTable({
  get data() {
    return props.data.breakdown;
  },
  columns: [
    { accessorKey: "dimension", header: "Channel / marketplace" },
    ...(["sales", "adSpend", "units", "orders", "acos", "roas"] as const).map(
      (id) => ({
        id,
        accessorFn: (row: AnalyticsResult["breakdown"][number]) =>
          row.values[id],
        header: {
          sales: "Sales",
          adSpend: "Ad spend",
          units: "Units",
          orders: "Orders",
          acos: "ACOS",
          roas: "ROAS",
        }[id],
        cell: (info: { getValue: () => unknown }) =>
          formatMetric(
            id,
            info.getValue() as number | null,
            props.data.currency,
          ),
      }),
    ),
  ],
  state: {
    get sorting() {
      return sorting.value;
    },
  },
  onSortingChange: (updater) => {
    sorting.value =
      typeof updater === "function" ? updater(sorting.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
</script>
<template>
  <div class="table-scroll">
    <table>
      <thead>
        <tr v-for="group in table.getHeaderGroups()" :key="group.id">
          <th
            v-for="header in group.headers"
            :key="header.id"
            :aria-sort="
              header.column.getIsSorted() === 'asc'
                ? 'ascending'
                : header.column.getIsSorted() === 'desc'
                  ? 'descending'
                  : 'none'
            "
          >
            <button @click="header.column.getToggleSortingHandler()?.($event)">
              <FlexRender
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <span aria-hidden="true">↕</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </td>
        </tr>
        <tr v-if="!data.breakdown.length">
          <td colspan="7">No data for the selected filters.</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>Total · {{ data.currency }}</th>
          <td
            v-for="id in [
              'sales',
              'adSpend',
              'units',
              'orders',
              'acos',
              'roas',
            ] as const"
            :key="id"
          >
            {{ formatMetric(id, data.totals[id], data.currency) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
