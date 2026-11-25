<script setup lang="ts">
import { init, use, connect, disconnect, type ECharts } from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { formatMetric, metrics } from "~~/shared/analytics/metrics";
import { chartKinds } from "~~/shared/analytics/workspace";
import type { AnalyticsResult, MetricId } from "~~/shared/types/analytics";
import { csvCell, downloadFile } from "~/composables/useExports";
use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);
const props = defineProps<{
  data: AnalyticsResult;
  metric: MetricId;
  compact?: boolean;
  kind?: (typeof chartKinds)[number];
  sync?: boolean;
  wide?: boolean;
  editable?: boolean;
}>();
const emit = defineEmits<{
  focus: [metric: MetricId];
  point: [date: string];
  configure: [config: { kind: (typeof chartKinds)[number]; wide: boolean }];
  remove: [];
}>();
const host = ref<HTMLElement>(),
  card = ref<HTMLElement>(),
  share = ref(false),
  fullscreenError = ref("");
let chart: ECharts | undefined, observer: ResizeObserver | undefined;
const palette = [
  "#087f72",
  "#7970bf",
  "#da9a3b",
  "#4786b9",
  "#be6c76",
  "#739c57",
  "#8f7f68",
  "#5a9d9f",
  "#ba8d42",
  "#9a77a7",
];
const color = (name: string) => {
  const known: Record<string, string> = {
    "amazon · US": "#087f72",
    "shopify · US": "#7970bf",
    "amazon · CA": "#da9a3b",
    "amazon · UK": "#4786b9",
    amazon: "#087f72",
    shopify: "#7970bf",
    US: "#087f72",
    CA: "#da9a3b",
    UK: "#4786b9",
  };
  return (
    known[name] ||
    palette[
      Math.abs([...name].reduce((n, c) => (n * 31 + c.charCodeAt(0)) | 0, 0)) %
        palette.length
    ]
  );
};
const canShare = computed(
  () =>
    [
      "sales",
      "netSales",
      "adSpend",
      "adSales",
      "units",
      "orders",
      "netProfit",
    ].includes(props.metric) &&
    props.data.series.every((s) => (s.values[props.metric] ?? 0) >= 0),
);
const bucketDates = computed(() =>
  [...new Set(props.data.series.map((p) => p.date))].sort(),
);
const selectedDate = ref("");
watch(
  bucketDates,
  (dates) => {
    if (!dates.includes(selectedDate.value))
      selectedDate.value = dates[0] || "";
  },
  { immediate: true },
);
function draw() {
  if (!chart) return;
  const dates = [...new Set(props.data.series.map((p) => p.date))].sort(),
    previousDates = [
      ...new Set(props.data.comparisonSeries?.map((p) => p.date) || []),
    ].sort();
  const dimensions = [...new Set(props.data.series.map((p) => p.dimension))];
  const index = new Map(
      props.data.series.map((p) => [
        `${p.date}|${p.dimension}`,
        p.values[props.metric],
      ]),
    ),
    previousIndex = new Map(
      props.data.comparisonSeries?.map((p) => [
        `${p.date}|${p.dimension}`,
        p.values[props.metric],
      ]),
    );
  const money = metrics[props.metric].format === "money",
    kind = props.kind || "line",
    percent = share.value && canShare.value;
  const normalize = (value: number | null | undefined, date: string) => {
    if (value == null) return null;
    if (percent) {
      const total = dimensions.reduce(
        (sum, name) => sum + (index.get(`${date}|${name}`) || 0),
        0,
      );
      return total ? (value / total) * 100 : null;
    }
    return money ? value / 100 : value;
  };
  chart.group = props.sync ? "zonhack-charts" : "";
  if (props.sync) connect("zonhack-charts");
  chart.setOption(
    {
      animation: false,
      grid: { left: 64, right: 20, top: 42, bottom: props.compact ? 32 : 85 },
      tooltip: {
        trigger: "axis",
        confine: true,
        axisPointer: { type: "cross" },
        valueFormatter: (value: unknown) =>
          typeof value === "number"
            ? percent
              ? `${value.toFixed(1)}%`
              : formatMetric(
                  props.metric,
                  money ? value * 100 : value,
                  props.data.currency,
                )
            : "Unavailable",
      },
      legend: {
        top: 0,
        type: "scroll",
        textStyle: { color: "#7b8a83", fontSize: 10 },
      },
      xAxis: {
        type: "category",
        data: dates,
        boundaryGap: kind === "bar" || kind === "stacked",
        axisLine: { lineStyle: { color: "#dce5df" } },
        axisLabel: {
          color: "#7c8a82",
          formatter: (v: string) =>
            dates.length &&
            dates[0]!.slice(0, 4) !== dates[dates.length - 1]!.slice(0, 4)
              ? v
              : v.slice(5),
        },
      },
      yAxis: {
        type: "value",
        max: percent ? 100 : undefined,
        splitLine: {
          lineStyle: { color: "#dfe6df", opacity: 0.5, type: "dashed" },
        },
        axisLabel: {
          color: "#7c8a82",
          formatter: (v: number) =>
            `${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v * 10) / 10}${percent ? "%" : ""}`,
        },
      },
      dataZoom: props.compact
        ? []
        : [
            { type: "inside" },
            {
              type: "slider",
              height: 18,
              bottom: 8,
              borderColor: "#dfe6df",
              fillerColor: "#087f7215",
            },
          ],
      series: [
        ...dimensions.map((name) => ({
          name,
          type: kind === "bar" || kind === "stacked" ? "bar" : "line",
          stack: kind === "stacked" ? "total" : undefined,
          data: dates.map((date) =>
            normalize(index.get(`${date}|${name}`), date),
          ),
          showSymbol: false,
          symbolSize: 5,
          lineStyle: { width: 2.3 },
          itemStyle: { color: color(name) },
          areaStyle: kind === "area" ? { opacity: 0.12 } : undefined,
        })),
        ...(!percent && kind !== "stacked" && props.data.previous
          ? dimensions.map((name) => ({
              name: `${name} · comparison`,
              type: "line",
              data: dates.map((_, i) => {
                const v = previousIndex.get(`${previousDates[i]}|${name}`);
                return v == null ? null : money ? v / 100 : v;
              }),
              showSymbol: false,
              lineStyle: { type: "dashed", width: 1.5, opacity: 0.45 },
              itemStyle: { color: color(name) },
            }))
          : []),
      ],
    },
    { notMerge: true },
  );
}
function exportImage() {
  const url = chart?.getDataURL({ pixelRatio: 2, backgroundColor: "#fff" });
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `demo-${props.metric}.png`;
    a.click();
  }
}
function exportCsv() {
  downloadFile(
    [
      "# SYNTHETIC DEMO DATA; money in minor currency units",
      "Date,Segment,Metric,Value,Currency",
      ...props.data.series.map((p) =>
        [
          p.date,
          p.dimension,
          metrics[props.metric].label,
          p.values[props.metric],
          props.data.currency,
        ]
          .map(csvCell)
          .join(","),
      ),
    ].join("\r\n"),
    `demo-${props.metric}.csv`,
    "text/csv;charset=utf-8",
  );
}
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await card.value?.requestFullscreen();
    fullscreenError.value = "";
  } catch {
    fullscreenError.value =
      "Full screen is unavailable in this browser. Use Focus instead.";
  }
}
function config(kind = props.kind || "line", wide = props.wide || false) {
  emit("configure", { kind, wide });
}
onMounted(() => {
  if (!host.value) return;
  chart = init(host.value);
  observer = new ResizeObserver(() => chart?.resize());
  observer.observe(host.value);
  chart.on("click", (p) => {
    if (
      p.componentType === "series" &&
      typeof p.name === "string" &&
      !String(p.seriesName).endsWith("· comparison")
    )
      emit("point", p.name);
  });
  draw();
});
watch(
  () => [
    props.data,
    props.metric,
    props.compact,
    props.kind,
    props.sync,
    share.value,
  ],
  draw,
);
onBeforeUnmount(() => {
  observer?.disconnect();
  chart?.dispose();
  if (!document.querySelectorAll(".chart-canvas").length)
    disconnect("zonhack-charts");
});
</script>
<template>
  <article ref="card" class="chart-card" :class="{ 'wide-chart': wide }">
    <header>
      <div>
        <span class="eyebrow"
          >{{ data.breakdown.length }}
          {{ data.breakdown.length === 1 ? "SERIES" : "SERIES" }}</span
        >
        <h3>
          {{ metrics[metric].label }}
          <small v-if="metrics[metric].format === 'money'">{{
            data.currency
          }}</small>
        </h3>
      </div>
      <div class="chart-actions">
        <select
          :value="kind || 'line'"
          :aria-label="`${metrics[metric].label} chart type`"
          @change="
            config(
              ($event.target as HTMLSelectElement)
                .value as (typeof chartKinds)[number],
            )
          "
        >
          <option value="line">Line</option>
          <option value="area">Area</option>
          <option value="bar">Bar</option>
          <option value="stacked">Stacked</option></select
        ><button
          :aria-label="`Focus ${metrics[metric].label}`"
          title="Focus chart"
          @click="emit('focus', metric)"
        >
          ⤢
        </button>
        <details class="chart-menu">
          <summary aria-label="Chart actions">•••</summary>
          <div>
            <button
              @click="
                chart?.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
              "
            >
              Reset zoom</button
            ><button @click="fullscreen">Full screen</button
            ><button @click="exportImage">Download PNG</button
            ><button @click="exportCsv">Download chart CSV</button
            ><button v-if="canShare" @click="share = !share">
              {{
                share ? "Absolute values" : "Percentage contribution"
              }}</button
            ><button v-if="editable" @click="config(kind, !wide)">
              {{ wide ? "Standard width" : "Full width" }}</button
            ><button v-if="editable" @click="emit('remove')">
              Remove chart
            </button>
          </div>
        </details>
      </div>
    </header>
    <div
      ref="host"
      class="chart-canvas"
      :class="{ compact }"
      role="img"
      :aria-label="`${metrics[metric].label} by selected breakdown. Exact values in the report below.`"
    ></div>
    <p
      v-if="data.previous && kind !== 'stacked' && !share"
      class="chart-footnote"
    >
      Dashed lines: comparison buckets aligned in chronological order.
      {{ data.comparisonRange?.start }} — {{ data.comparisonRange?.end }}
    </p>
    <details class="chart-drill">
      <summary>Explore underlying records</summary>
      <label
        >Period starting<select
          v-model="selectedDate"
          :aria-label="`${metrics[metric].label} source period`"
        >
          <option v-for="date in bucketDates" :key="date" :value="date">
            {{ date }}
          </option>
        </select></label
      ><button
        class="text-button"
        :disabled="!selectedDate"
        @click="emit('point', selectedDate)"
      >
        Open records →
      </button>
    </details>
    <p v-if="fullscreenError" role="status">{{ fullscreenError }}</p>
  </article>
</template>
