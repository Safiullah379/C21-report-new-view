import { workbook } from "~~/shared/analytics/xlsx";
import {
  additiveIds,
  type AnalyticsResult,
  type MetricId,
} from "~~/shared/types/analytics";
import { metrics } from "~~/shared/analytics/metrics";
export function downloadFile(text: string, name: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Neutralize spreadsheet formulas, including whitespace-prefixed cells.
export const csvCell = (value: unknown) => {
  let s = value == null ? "" : String(value);
  if (/^[\s]*[=+@-]/.test(s) && typeof value !== "number") s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
};
export function useExports() {
  function rawCsv(data: AnalyticsResult) {
    const keys = [
      "date",
      "productId",
      "marketplace",
      "channel",
      "currency",
      ...additiveIds,
    ] as const;
    const catalog = new Map(data.catalog?.map((p) => [p.id, p.sku]));
    downloadFile(
      [
        "# SYNTHETIC DEMO DATA; monetary fields are integer minor units",
        ["sku", ...keys].map(csvCell).join(","),
        ...data.rows.map((r) =>
          [catalog.get(r.productId), ...keys.map((k) => r[k])]
            .map(csvCell)
            .join(","),
        ),
      ].join("\r\n"),
      "zonhack-demo-report.csv",
      "text/csv;charset=utf-8",
    );
  }
  function summaryCsv(data: AnalyticsResult, ids: MetricId[]) {
    downloadFile(
      [
        "# SYNTHETIC DEMO DATA; money in native major currency units; percentages in percent units",
        ["Segment", "Currency", ...ids.map((id) => metrics[id].label)]
          .map(csvCell)
          .join(","),
        ...[...data.breakdown, { dimension: "TOTAL", values: data.totals }].map(
          (r) =>
            [
              r.dimension,
              data.currency,
              ...ids.map((id) =>
                r.values[id] == null
                  ? ""
                  : metrics[id].format === "money"
                    ? r.values[id]! / 100
                    : r.values[id],
              ),
            ]
              .map(csvCell)
              .join(","),
        ),
      ].join("\r\n"),
      "zonhack-demo-summary.csv",
      "text/csv;charset=utf-8",
    );
  }
  function inventoryCsv(data: AnalyticsResult) {
    const keys = [
      "productId",
      "marketplace",
      "currency",
      "available",
      "inbound",
      "reserved",
      "dailyUnits",
      "daysRemaining",
      "value",
      "reorder",
      "status",
    ] as const;
    downloadFile(
      [
        "# SYNTHETIC INVENTORY SNAPSHOT; value in minor currency units",
        keys.join(","),
        ...(data.inventory || []).map((r) =>
          keys.map((k) => csvCell(r[k])).join(","),
        ),
      ].join("\r\n"),
      "zonhack-demo-inventory.csv",
      "text/csv;charset=utf-8",
    );
  }
  function excel(
    data: AnalyticsResult,
    ids: MetricId[],
    metadata: string[] = [],
  ) {
    const rows: (string | number | null)[][] = [
      ["SYNTHETIC DEMO DATA; money in native major currency units"],
      ...metadata.map((text) => [text]),
      ["Segment", "Currency", ...ids.map((id) => metrics[id].label)],
      ...[...data.breakdown, { dimension: "TOTAL", values: data.totals }].map(
        (r) => [
          r.dimension,
          data.currency,
          ...ids.map((id) =>
            r.values[id] === null
              ? null
              : metrics[id].format === "money"
                ? r.values[id]! / 100
                : r.values[id],
          ),
        ],
      ),
    ];
    downloadWorkbook(rows, "zonhack-demo-summary.xlsx");
  }
  return { rawCsv, summaryCsv, inventoryCsv, excel };
}

export function downloadWorkbook(
  rows: (string | number | null | undefined)[][],
  filename: string,
) {
  const bytes = workbook(rows);
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
