import { z } from "zod";
import { presetRange } from "~~/shared/analytics/calendar";
import {
  defaultMetrics,
  preferenceSchema,
  savedSchema,
  type Preference,
  type SavedView,
} from "~~/shared/analytics/workspace";
import {
  filtersSchema,
  type AnalyticsResult,
  type Filters,
  type MetricId,
} from "~~/shared/types/analytics";
export type { Preference } from "~~/shared/analytics/workspace";
export function useWorkspace() {
  const route = useRoute(),
    router = useRouter();
  const filters = ref<Filters>(filtersSchema.parse(presetRange("30")));
  const layout = ref<Preference["layout"]>("carousel"),
    metric = ref<MetricId>("sales"),
    days = ref<Preference["days"]>("30");
  const data = shallowRef<AnalyticsResult | null>(null),
    loading = ref(false),
    error = ref("");
  const visible = ref<MetricId[]>([...defaultMetrics]),
    columns = ref(2),
    sync = ref(true),
    charts = ref<Preference["charts"]>({} as Preference["charts"]);
  const saved = ref<SavedView[]>([]),
    defaultView = ref(""),
    storageMessage = ref("");
  let controller: AbortController | undefined,
    timer: ReturnType<typeof setTimeout> | undefined;
  const snapshot = (): Preference =>
    structuredClone({
      layout: layout.value,
      metric: metric.value,
      filters: toRaw(filters.value),
      days: days.value,
      visible: toRaw(visible.value),
      columns: columns.value,
      sync: sync.value,
      charts: toRaw(charts.value),
    });
  const apply = (value: Preference) => {
    const v = preferenceSchema.parse(value);
    visible.value = v.visible.slice();
    layout.value = v.layout;
    metric.value = v.metric;
    days.value = v.days;
    columns.value = v.columns;
    sync.value = v.sync;
    charts.value = structuredClone(v.charts);
    filters.value = {
      ...v.filters,
      ...(v.days !== "custom" ? presetRange(v.days) : {}),
    };
  };
  function write(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      storageMessage.value = "";
      return true;
    } catch {
      storageMessage.value =
        "Browser storage is unavailable. Changes will last for this session.";
      return false;
    }
  }
  const persist = () => write("zonhack:demo:workspace:v2", snapshot());
  const cache = new Map<string, AnalyticsResult>();
  async function fetchData(force = false) {
    controller?.abort();
    const parsed = filtersSchema.safeParse(filters.value);
    if (!parsed.success) {
      error.value = parsed.error.issues.map((i) => i.message).join(". ");
      loading.value = false;
      return;
    }
    const key = JSON.stringify(parsed.data);
    if (!force && cache.has(key)) {
      data.value = cache.get(key)!;
      loading.value = false;
      error.value = "";
      return;
    }
    const current = new AbortController();
    controller = current;
    loading.value = true;
    error.value = "";
    try {
      const result = await $fetch<AnalyticsResult>("/api/analytics", {
        method: "POST",
        body: parsed.data,
        signal: current.signal,
      });
      if (controller === current) {
        data.value = result;
        cache.set(key, result);
        if (cache.size > 5) cache.delete(cache.keys().next().value!);
      }
    } catch (e) {
      if (!current.signal.aborted)
        error.value =
          e instanceof Error ? e.message : "Could not load analytics";
    } finally {
      if (controller === current) loading.value = false;
    }
  }
  onMounted(() => {
    try {
      const views = z
        .array(savedSchema)
        .max(30)
        .safeParse(
          JSON.parse(localStorage.getItem("zonhack:demo:views:v2") || "[]"),
        );
      if (views.success) saved.value = views.data;
      defaultView.value = JSON.parse(
        localStorage.getItem("zonhack:demo:default:v2") || '""',
      );
      const stored = preferenceSchema.safeParse(
        JSON.parse(localStorage.getItem("zonhack:demo:workspace:v2") || "null"),
      );
      if (stored.success) apply(stored.data);
      const preferred = saved.value.find((v) => v.id === defaultView.value);
      if (preferred) apply(preferred.value);
      const parsed = preferenceSchema.safeParse(
        JSON.parse(
          typeof route.query.view === "string" ? route.query.view : "null",
        ),
      );
      if (parsed.success) apply(parsed.data);
    } catch {
      storageMessage.value = "Some saved preferences could not be restored.";
    }
    void fetchData();
    watch(
      filters,
      () => {
        controller?.abort();
        loading.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
          void fetchData();
        }, 180);
      },
      { deep: true },
    );
    watch(
      [filters, layout, metric, days, visible, columns, charts, sync],
      () => {
        persist();
        void router.replace({
          query: { ...route.query, view: JSON.stringify(snapshot()) },
        });
      },
      { deep: true },
    );
  });
  onBeforeUnmount(() => {
    controller?.abort();
    clearTimeout(timer);
  });
  function setRange(value: Preference["days"]) {
    days.value = value;
    if (value !== "custom") {
      Object.assign(filters.value, presetRange(value));
      const length =
        (Date.parse(filters.value.end) - Date.parse(filters.value.start)) /
        86400000;
      filters.value.granularity =
        length > 365 ? "monthly" : length > 90 ? "weekly" : "daily";
    }
  }
  function commitViews(next: SavedView[]) {
    saved.value = next;
    return write("zonhack:demo:views:v2", next);
  }
  function save(name: string) {
    if (!name.trim() || saved.value.length >= 30) return false;
    return commitViews([
      ...saved.value,
      {
        id: crypto.randomUUID(),
        name: name.trim().slice(0, 80),
        value: snapshot(),
      },
    ]);
  }
  function remove(id: string) {
    if (defaultView.value === id) setDefault("");
    return commitViews(saved.value.filter((v) => v.id !== id));
  }
  function rename(id: string, name: string) {
    if (!name.trim()) return false;
    return commitViews(
      saved.value.map((v) =>
        v.id === id ? { ...v, name: name.trim().slice(0, 80) } : v,
      ),
    );
  }
  function duplicate(id: string) {
    const v = saved.value.find((v) => v.id === id);
    return (
      !!v &&
      saved.value.length < 30 &&
      commitViews([
        ...saved.value,
        {
          ...structuredClone(toRaw(v)),
          id: crypto.randomUUID(),
          name: (v.name + " (copy)").slice(0, 80),
        },
      ])
    );
  }
  function update(id: string) {
    return commitViews(
      saved.value.map((v) => (v.id === id ? { ...v, value: snapshot() } : v)),
    );
  }
  function setDefault(id: string) {
    defaultView.value = id;
    write("zonhack:demo:default:v2", id);
  }
  function reorder(from: number, to: number) {
    if (to < 0 || to >= visible.value.length) return;
    const next = [...visible.value];
    const [id] = next.splice(from, 1);
    if (id) next.splice(to, 0, id);
    visible.value = next;
  }
  function reset() {
    days.value = "30";
    filters.value = filtersSchema.parse(presetRange("30"));
    layout.value = "carousel";
    metric.value = "sales";
    visible.value = [...defaultMetrics];
    columns.value = 2;
    charts.value = {} as Preference["charts"];
  }
  function restoreBackup(raw: string) {
    const backup = z
      .object({
        version: z.literal(2),
        views: z.array(savedSchema).max(30),
        workspace: preferenceSchema,
      })
      .safeParse(JSON.parse(raw));
    if (!backup.success) throw new Error("Invalid workspace backup");
    apply(backup.data.workspace);
    commitViews(backup.data.views);
    setDefault("");
  }
  return {
    filters,
    layout,
    metric,
    days,
    data,
    loading,
    error,
    saved,
    visible,
    columns,
    sync,
    charts,
    defaultView,
    storageMessage,
    snapshot,
    apply,
    setRange,
    save,
    remove,
    rename,
    duplicate,
    update,
    setDefault,
    reorder,
    reset,
    restoreBackup,
    fetchData,
  };
}
