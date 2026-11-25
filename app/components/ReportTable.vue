<script setup lang="ts">
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import {
  csvCell,
  downloadFile,
  downloadWorkbook,
} from "~/composables/useExports";
import { aggregate, formatMetric, metrics } from "~~/shared/analytics/metrics";
import {
  metricIds,
  type AnalyticsResult,
  type MetricId,
  type Fact,
  type Values,
} from "~~/shared/types/analytics";
const props = defineProps<{
  data: AnalyticsResult;
  group?: "product" | "date" | "segment";
  date?: string;
  endDate?: string;
  ids?: readonly MetricId[];
  storageKey?: string;
}>();
const emit = defineEmits<{ product: [id: string] }>();
const search = ref(""),
  page = ref(1),
  size = ref(10),
  sort = ref("sales"),
  desc = ref(true);
const visible = ref<MetricId[]>([
  ...(props.ids || [
    "sales",
    "netSales",
    "netProfit",
    "margin",
    "units",
    "orders",
    "acos",
  ]),
]);
const grouped = computed(() => {
  const map = new Map<string, Fact[]>();
  for (const row of props.data.rows) {
    if (
      props.date &&
      (row.date < props.date || row.date > (props.endDate || props.date))
    )
      continue;
    const key =
      props.group === "date"
        ? row.date
        : props.group === "segment"
          ? `${row.channel} · ${row.marketplace}`
          : row.productId;
    const rows = map.get(key) || [];
    rows.push(row);
    map.set(key, rows);
  }
  return [...map].map(([id, rows]) => {
    const product = props.data.catalog?.find((p) => p.id === id);
    return {
      id,
      title: product?.title || id,
      sku: product?.sku || "",
      icon: product?.icon || "◒",
      color: product?.color || "#e4ece2",
      values: aggregate(rows),
    };
  });
});
const matched = computed(() =>
  grouped.value.filter((r) =>
    `${r.title} ${r.sku}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
type ReportRow = (typeof grouped.value)[number];
const table = useVueTable({
  get data() {
    return matched.value;
  },
  columns: [
    { accessorKey: "title", sortingFn: "alphanumeric" },
    ...metricIds.map((id) => ({
      id,
      accessorFn: (row: ReportRow) => row.values[id] ?? undefined,
      sortUndefined: "last" as const,
      sortingFn: "basic" as const,
    })),
  ],
  state: {
    get sorting() {
      return [{ id: sort.value, desc: desc.value }];
    },
    get pagination() {
      return { pageIndex: page.value - 1, pageSize: size.value };
    },
  },
  autoResetPageIndex: false,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
const sorted = computed(() =>
  table.getSortedRowModel().rows.map((row) => row.original),
);
const maxPage = computed(() => Math.max(1, table.getPageCount()));
const displayed = computed(() =>
  table.getRowModel().rows.map((row) => row.original),
);
const totals = computed<Values>(() => {
  const selected = new Set(matched.value.map((r) => r.id));
  return aggregate(
    props.data.rows.filter((r) => {
      if (
        props.date &&
        (r.date < props.date || r.date > (props.endDate || props.date))
      )
        return false;
      return selected.has(
        props.group === "date"
          ? r.date
          : props.group === "segment"
            ? `${r.channel} · ${r.marketplace}`
            : r.productId,
      );
    }),
  );
});
watch(
  [() => props.data, search, size, () => props.group, () => props.date],
  () => {
    page.value = 1;
  },
);
function exportRows() {
  return [
    ["SYNTHETIC DEMO DATA; money in native major currency units"],
    [
      "Product / segment",
      "SKU",
      "Currency",
      ...visible.value.map((id) => metrics[id].label),
    ],
    ...[...sorted.value, { title: "TOTAL", sku: "", values: totals.value }].map(
      (r) => [
        r.title,
        r.sku,
        props.data.currency,
        ...visible.value.map((id) =>
          r.values[id] === null
            ? null
            : metrics[id].format === "money"
              ? r.values[id]! / 100
              : r.values[id],
        ),
      ],
    ),
  ];
}
function exportCsv() {
  downloadFile(
    exportRows()
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n"),
    "zonhack-demo-table.csv",
    "text/csv;charset=utf-8",
  );
}
onMounted(() => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(
        `zonhack:demo:columns:${props.storageKey || "default"}`,
      ) || "null",
    );
    if (
      Array.isArray(stored) &&
      stored.length &&
      stored.every((id) => metricIds.includes(id))
    )
      visible.value = [...new Set(stored)] as MetricId[];
  } catch {
    /* use defaults */
  }
});
watch(
  visible,
  () => {
    try {
      localStorage.setItem(
        `zonhack:demo:columns:${props.storageKey || "default"}`,
        JSON.stringify(visible.value),
      );
    } catch {
      /* session-only */
    }
  },
  { deep: true },
);
function order(key: string) {
  if (sort.value === key) desc.value = !desc.value;
  else {
    sort.value = key;
    desc.value = true;
  }
}
</script>
<template>
  <div class="report-toolbar">
    <input
      v-model="search"
      aria-label="Search report"
      placeholder="Search this report…"
    />
    <details class="column-picker">
      <summary>Columns</summary>
      <div>
        <label v-for="id in Object.keys(metrics) as MetricId[]" :key="id"
          ><input v-model="visible" type="checkbox" :value="id" />{{
            metrics[id].label
          }}</label
        >
      </div>
    </details>
    <button class="text-button" @click="exportCsv">↓ Table CSV</button
    ><button
      class="text-button"
      @click="downloadWorkbook(exportRows(), 'zonhack-demo-table.xlsx')"
    >
      ↓ Table Excel</button
    ><span
      >{{ matched.length }}
      {{
        group === "date"
          ? "days"
          : group === "segment"
            ? "segments"
            : "products"
      }}</span
    >
  </div>
  <div class="table-scroll report-scroll">
    <table>
      <thead>
        <tr>
          <th
            :aria-sort="
              sort === 'title' ? (desc ? 'descending' : 'ascending') : 'none'
            "
          >
            <button @click="order('title')">
              {{
                group === "date"
                  ? "Date"
                  : group === "segment"
                    ? "Channel / marketplace"
                    : "Product / SKU"
              }}
              ↕
            </button>
          </th>
          <th
            v-for="id in visible"
            :key="id"
            :aria-sort="
              sort === id ? (desc ? 'descending' : 'ascending') : 'none'
            "
          >
            <button :title="metrics[id].definition" @click="order(id)">
              {{ metrics[id].label }} ↕
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in displayed" :key="row.id">
          <td>
            <button
              v-if="!group || group === 'product'"
              class="product-cell"
              @click="emit('product', row.id)"
            >
              <span class="product-tile" :style="{ background: row.color }">{{
                row.icon
              }}</span
              ><span
                ><strong>{{ row.title }}</strong
                ><small>{{ row.sku }} ↗</small></span
              ></button
            ><span v-else>{{ row.title }}</span>
          </td>
          <td
            v-for="id in visible"
            :key="id"
            :class="{
              negative: id === 'netProfit' && (row.values[id] ?? 0) < 0,
            }"
          >
            {{ formatMetric(id, row.values[id], data.currency) }}
          </td>
        </tr>
        <tr v-if="!displayed.length">
          <td :colspan="visible.length + 1" class="table-empty">
            No records match. Try changing the filters.
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>
            {{ search ? "Matching total" : "Total" }} · {{ data.currency }}
          </th>
          <td v-for="id in visible" :key="id">
            {{ formatMetric(id, totals[id], data.currency) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="pagination">
    <label
      >Rows
      <select v-model="size">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select></label
    ><span>Page {{ page }} of {{ maxPage }}</span
    ><button class="button secondary" :disabled="page <= 1" @click="page--">
      Previous</button
    ><button
      class="button secondary"
      :disabled="page >= maxPage"
      @click="page++"
    >
      Next
    </button>
  </div>
</template>
