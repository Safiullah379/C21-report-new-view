import type { Filters } from "../types/analytics";
export const day = 86400000;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export function previousPeriod(start: string, end: string) {
  const duration = Date.parse(end) - Date.parse(start) + day;
  return {
    start: isoDate(new Date(Date.parse(start) - duration)),
    end: isoDate(new Date(Date.parse(start) - day)),
  };
}
export function shiftMonths(date: string, months: number) {
  const d = new Date(date + "T00:00:00Z"),
    dateOfMonth = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(dateOfMonth, last));
  return isoDate(d);
}
export function comparisonRange(f: Filters) {
  if (f.comparison === "none") return undefined;
  if (f.comparison === "custom")
    return f.compareStart && f.compareEnd
      ? { start: f.compareStart, end: f.compareEnd }
      : undefined;
  if (f.comparison === "previous") return previousPeriod(f.start, f.end);
  if (f.comparison === "week" || f.comparison === "weekdays") {
    const offset = f.comparison === "week" ? 7 : 364;
    return {
      start: isoDate(new Date(Date.parse(f.start) - offset * day)),
      end: isoDate(new Date(Date.parse(f.end) - offset * day)),
    };
  }
  const months =
    f.comparison === "month" ? -1 : f.comparison === "quarter" ? -3 : -12;
  return {
    start: shiftMonths(f.start, months),
    end: shiftMonths(f.end, months),
  };
}
export function bucket(
  date: string,
  granularity: Filters["granularity"],
  calendar: Filters["calendar"] = "iso",
  fiscalMonth = 4,
) {
  const year = Number(date.slice(0, 4)),
    month = Number(date.slice(5, 7));
  if (granularity === "monthly") return date.slice(0, 7) + "-01";
  if (granularity === "yearly") return `${year}-01-01`;
  if (granularity === "quarterly") {
    const offset = calendar === "fiscal" ? fiscalMonth - 1 : 0;
    const start = new Date(
      Date.UTC(year, month - 1 - ((month - 1 - offset + 12) % 3), 1),
    );
    return isoDate(start);
  }
  if (granularity === "daily") return date;
  const d = new Date(date + "T00:00:00Z");
  if (calendar === "january")
    return isoDate(
      new Date(Date.UTC(year, 0, 1) + (januaryWeek(date) - 1) * 7 * day),
    );
  if (calendar === "fiscal") {
    const start = Date.UTC(
      month < fiscalMonth ? year - 1 : year,
      fiscalMonth - 1,
      1,
    );
    return isoDate(
      new Date(start + Math.floor((+d - start) / (7 * day)) * 7 * day),
    );
  }
  d.setUTCDate(
    d.getUTCDate() -
      (calendar === "sunday" ? d.getUTCDay() : (d.getUTCDay() + 6) % 7),
  );
  return isoDate(d);
}
export function januaryWeek(date: string) {
  return (
    Math.floor(
      (Date.parse(date) - Date.UTC(Number(date.slice(0, 4)), 0, 1)) / day / 7,
    ) + 1
  );
}
export function relativeRange(days: number, now = new Date()) {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return {
    start: isoDate(new Date(+end - (days - 1) * day)),
    end: isoDate(end),
  };
}
export const datePresets = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["7", "Last 7 days"],
  ["14", "Last 14 days"],
  ["30", "Last 30 days"],
  ["60", "Last 60 days"],
  ["90", "Last 90 days"],
  ["180", "Last 180 days"],
  ["365", "Last 365 days"],
  ["week", "Week to date"],
  ["lastWeek", "Previous week"],
  ["month", "Month to date"],
  ["lastMonth", "Previous month"],
  ["quarter", "Quarter to date"],
  ["lastQuarter", "Previous quarter"],
  ["year", "Year to date"],
  ["lastYear", "Previous year"],
  ["all", "All reportable history"],
  ["custom", "Custom range"],
] as const;
export const presetIds = datePresets.map((p) => p[0]);
export function presetRange(preset: string, now = new Date()) {
  const today = relativeRange(1, now).end,
    year = now.getUTCFullYear(),
    month = now.getUTCMonth();
  if (/^\d+$/.test(preset)) return relativeRange(Number(preset), now);
  if (preset === "today") return { start: today, end: today };
  if (preset === "yesterday")
    return relativeRange(1, new Date(Date.parse(today) - day));
  if (preset === "all")
    return {
      start: isoDate(new Date(Date.parse(today) - 1095 * day)),
      end: today,
    };
  if (preset === "week") return { start: bucket(today, "weekly"), end: today };
  if (preset === "lastWeek") {
    const start = Date.parse(bucket(today, "weekly"));
    return {
      start: isoDate(new Date(start - 7 * day)),
      end: isoDate(new Date(start - day)),
    };
  }
  const firstMonth =
    preset.includes("Quarter") || preset === "quarter"
      ? Math.floor(month / 3) * 3
      : preset.includes("Year") || preset === "year"
        ? 0
        : month;
  const start = new Date(Date.UTC(year, firstMonth, 1));
  if (preset.startsWith("last")) {
    const end = isoDate(new Date(+start - day));
    start.setUTCMonth(
      start.getUTCMonth() -
        (preset === "lastYear" ? 12 : preset === "lastQuarter" ? 3 : 1),
    );
    return { start: isoDate(start), end };
  }
  return { start: isoDate(start), end: today };
}
