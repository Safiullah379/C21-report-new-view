<script setup lang="ts">
import { init, use, type ECharts } from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { formatMetric, metrics } from "~~/shared/analytics/metrics";
import type { MetricId } from "~~/shared/types/analytics";
import type { YearLine } from "~~/shared/analytics/year-comparison";
use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);
const props = defineProps<{
  lines: YearLine[];
  metric: MetricId;
  resolution: "weekly" | "monthly";
  currency: string;
  colors: Record<number, string>;
  primary: number;
  hero?: boolean;
}>();
const host = ref<HTMLElement>(),
  article = ref<HTMLElement>(),
  hidden = ref<number[]>([]);
let chart: ECharts | undefined, observer: ResizeObserver | undefined;
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function draw() {
  if (!chart) return;
  const points = props.lines[0]?.points || [],
    money = metrics[props.metric].format === "money";
  const labels = points.map((p) =>
    props.resolution === "monthly"
      ? months[p.period - 1]!
      : `W${String(p.period).padStart(2, "0")}`,
  );
  chart.setOption(
    {
      animation: false,
      grid: { left: 60, right: 18, top: 22, bottom: 32 },
      tooltip: {
        trigger: "axis",
        confine: true,
        backgroundColor: "#172236",
        borderWidth: 0,
        padding: 14,
        textStyle: { color: "#f1f4ff", fontSize: 11 },
        axisPointer: {
          type: "line",
          lineStyle: { color: "#b1bacb", type: "dashed" },
        },
        formatter: (input: unknown) => {
          const items = (Array.isArray(input) ? input : [input]) as {
            axisValue: string;
            seriesName: string;
            dataIndex: number;
            value: number | null;
            color: string;
          }[];
          return (
            `<strong>${items[0]?.axisValue || ""}</strong>` +
            items
              .map((item) => {
                const point = props.lines.find(
                  (line) => String(line.year) === item.seriesName,
                )?.points[item.dataIndex];
                return `<div style="margin-top:10px"><span style="color:${item.color}">●</span> ${item.seriesName}<strong style="float:right;margin-left:24px">${formatMetric(props.metric, item.value == null ? null : money ? item.value * 100 : item.value, props.currency)}</strong><div style="font-size:9px;opacity:.55;margin:3px 0 0 14px">${point?.start.slice(5)} – ${point?.end.slice(5)}${point?.partial ? " · partial period" : ""}</div></div>`;
              })
              .join("")
          );
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#8992a2",
          fontSize: 10,
          margin: 14,
          interval: props.resolution === "weekly" ? "auto" : 0,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 4,
        axisLabel: {
          color: "#8992a2",
          fontSize: 10,
          formatter: (v: number) =>
            `${Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : Math.round(v * 10) / 10}${metrics[props.metric].format === "percent" ? "%" : ""}`,
        },
        splitLine: {
          lineStyle: { color: "#aeb8ca", opacity: 0.16, type: "dashed" },
        },
      },
      series: props.lines
        .filter((line) => !hidden.value.includes(line.year))
        .map((line) => ({
          name: String(line.year),
          type: "line",
          data: line.points.map((point) => {
            const v = point.values?.[props.metric];
            return v == null
              ? null
              : {
                  value: money ? v / 100 : v,
                  symbol: point.partial ? "emptyCircle" : "circle",
                  symbolSize: point.partial ? 6 : 3,
                };
          }),
          smooth: false,
          showSymbol: props.resolution === "monthly",
          connectNulls: false,
          lineStyle: {
            width: line.year === props.primary ? 2.7 : 1.8,
            color: props.colors[line.year],
            type: line.year === props.primary ? "solid" : "dashed",
          },
          itemStyle: { color: props.colors[line.year] },
          areaStyle:
            line.year === props.primary
              ? { color: props.colors[line.year], opacity: 0.035 }
              : undefined,
        })),
    },
    { notMerge: true },
  );
}
function toggle(year: number) {
  if (hidden.value.includes(year))
    hidden.value = hidden.value.filter((y) => y !== year);
  else if (hidden.value.length < props.lines.length - 1)
    hidden.value = [...hidden.value, year];
}
function download() {
  const url = chart?.getDataURL({ pixelRatio: 2, backgroundColor: "#fff" });
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `demo-year-comparison-${props.metric}.png`;
    a.click();
  }
}
onMounted(() => {
  if (!host.value) return;
  chart = init(host.value);
  observer = new ResizeObserver(() => chart?.resize());
  observer.observe(host.value);
  draw();
});
watch(
  () => [
    props.lines,
    props.resolution,
    props.metric,
    props.currency,
    props.colors,
    hidden.value,
  ],
  draw,
  { deep: true },
);
onBeforeUnmount(() => {
  observer?.disconnect();
  chart?.dispose();
});
</script>
<template>
  <article
    ref="article"
    class="year-chart"
    :class="{ 'year-chart-hero': hero }"
    :data-metric="metric"
  >
    <header>
      <div>
        <span class="year-chart-index">{{
          metric === "sales"
            ? "01"
            : metric === "netProfit"
              ? "02"
              : metric === "adSpend"
                ? "03"
                : metric === "units"
                  ? "04"
                  : metric === "orders"
                    ? "05"
                    : "06"
        }}</span>
        <h2>{{ metrics[metric].label }}</h2>
        <span class="year-chart-unit">{{
          metrics[metric].format === "money"
            ? currency
            : metrics[metric].format === "percent"
              ? "PERCENT"
              : "VOLUME"
        }}</span>
      </div>
      <div class="year-chart-legend">
        <button
          v-for="line in lines"
          :key="line.year"
          :aria-pressed="!hidden.includes(line.year)"
          :style="{ '--year-color': colors[line.year] }"
          :aria-label="`Toggle ${line.year} on ${metrics[metric].label}`"
          @click="toggle(line.year)"
        >
          <i :class="{ 'legend-dashed': line.year !== primary }"></i
          >{{ line.year }}</button
        ><button
          class="year-chart-download"
          :aria-label="`Download ${metrics[metric].label} chart`"
          @click="download"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
            aria-hidden="true"
          >
            <path d="M10 3v10m-4-4 4 4 4-4M4 14v3h12v-3" />
          </svg>
        </button>
      </div>
    </header>
    <div
      ref="host"
      class="year-chart-canvas"
      role="img"
      :aria-label="`${metrics[metric].label}: ${lines.map((l) => l.year).join(' versus ')}, by ${resolution === 'weekly' ? 'week' : 'month'}.`"
    ></div>
  </article>
</template>
