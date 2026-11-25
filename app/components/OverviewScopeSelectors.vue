<script setup lang="ts">
import type { Product, Filters } from "~~/shared/types/analytics";
import {
  overviewMarkets,
  type OverviewSelection,
} from "~~/shared/analytics/overview-selection";
const props = defineProps<{
  selection: OverviewSelection;
  catalog: Product[];
  currency: Filters["currency"];
}>();
const emit = defineEmits<{ select: [value: OverviewSelection] }>();
const open = ref<"marketplace" | "sku" | null>(null),
  search = ref(""),
  draftMode = ref<OverviewSelection["skuMode"]>("all");
const root = ref<HTMLElement>(),
  marketButton = ref<HTMLButtonElement>(),
  skuButton = ref<HTMLButtonElement>();
const parents = computed(
  () =>
    new Set(
      props.catalog
        .filter((p) => props.catalog.some((c) => c.parentId === p.id))
        .map((p) => p.id),
    ),
);
const selectedProduct = computed(() =>
  props.catalog.find((p) => p.id === props.selection.skuId),
);
const marketLabel = computed(() =>
  props.selection.marketplace === "all"
    ? "All marketplaces"
    : overviewMarkets.find((m) => m.id === props.selection.marketplace)
        ?.short || "All marketplaces",
);
const results = computed(() =>
  props.catalog.filter(
    (p) =>
      (draftMode.value === "parent"
        ? parents.value.has(p.id)
        : !parents.value.has(p.id)) &&
      [p.sku, p.asin, p.title, p.brand].some((s) =>
        s.toLowerCase().includes(search.value.trim().toLowerCase()),
      ),
  ),
);
function toggle(which: "marketplace" | "sku") {
  if (open.value === which) {
    open.value = null;
    return;
  }
  open.value = which;
  search.value = "";
  draftMode.value = props.selection.skuMode;
}
function market(value: OverviewSelection["marketplace"]) {
  emit("select", { ...props.selection, marketplace: value });
  close();
}
function sku(mode: OverviewSelection["skuMode"], id = "") {
  emit("select", { ...props.selection, skuMode: mode, skuId: id });
  close();
}
function close() {
  const previous = open.value;
  open.value = null;
  nextTick(() =>
    previous === "marketplace"
      ? marketButton.value?.focus()
      : skuButton.value?.focus(),
  );
}
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = null;
}
onMounted(() => document.addEventListener("pointerdown", outside));
onBeforeUnmount(() => document.removeEventListener("pointerdown", outside));
</script>
<template>
  <div ref="root" class="overview-scope-selectors" @keydown.esc.stop="close">
    <div class="overview-scope-anchor">
      <button
        ref="marketButton"
        class="overview-scope-button"
        :class="{ expanded: open === 'marketplace' }"
        aria-label="Select marketplace"
        aria-controls="overview-marketplace-menu"
        :aria-expanded="open === 'marketplace'"
        @click="toggle('marketplace')"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7" />
          <path d="M3 10h14M10 3c4 4 4 10 0 14-4-4-4-10 0-14Z" /></svg
        ><span
          >{{ marketLabel
          }}<small>{{
            selection.marketplace === "all"
              ? `${currency} · demo FX`
              : overviewMarkets.find((m) => m.id === selection.marketplace)
                  ?.currency
          }}</small></span
        ><svg
          class="scope-chevron"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      <section
        v-if="open === 'marketplace'"
        id="overview-marketplace-menu"
        class="overview-scope-menu marketplace-menu"
        role="region"
        aria-label="Marketplace selection"
      >
        <header>MARKETPLACE</header>
        <div role="group" aria-label="Marketplace options">
          <button
            class="marketplace-choice"
            aria-label="All marketplaces"
            :aria-pressed="selection.marketplace === 'all'"
            @click="market('all')"
          >
            <span class="marketplace-code">ALL</span
            ><span
              ><strong>All marketplaces</strong
              ><small>United States, Canada & United Kingdom</small></span
            ><span class="scope-check">{{
              selection.marketplace === "all" ? "✓" : ""
            }}</span></button
          ><button
            v-for="m in overviewMarkets"
            :key="m.id"
            class="marketplace-choice"
            :aria-label="m.label"
            :aria-pressed="selection.marketplace === m.id"
            @click="market(m.id)"
          >
            <span class="marketplace-code">{{ m.id }}</span
            ><span
              ><strong>{{ m.label }}</strong
              ><small>{{ m.currency }}</small></span
            ><span class="scope-check">{{
              selection.marketplace === m.id ? "✓" : ""
            }}</span>
          </button>
        </div>
        <footer>
          Reports use {{ currency }}. Mixed currencies use illustrative demo
          rates.<small>1 USD = 1.31 CAD = 0.79 GBP</small>
        </footer>
      </section>
    </div>
    <div class="overview-scope-anchor">
      <button
        ref="skuButton"
        class="overview-scope-button sku-scope-button"
        :class="{ expanded: open === 'sku' }"
        aria-label="Select SKU"
        aria-controls="overview-sku-menu"
        :aria-expanded="open === 'sku'"
        @click="toggle('sku')"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
          aria-hidden="true"
        >
          <path d="m3 6 7-3 7 3-7 3-7-3Zm0 0v8l7 3 7-3V6M10 9v8" /></svg
        ><span
          >{{
            selection.skuMode === "all"
              ? "All SKUs"
              : selectedProduct?.sku || "Selected SKU"
          }}<small>{{
            selection.skuMode === "all"
              ? "Entire catalog"
              : selection.skuMode === "parent"
                ? "Parent SKU · all variations"
                : "Single SKU"
          }}</small></span
        ><svg
          class="scope-chevron"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      <section
        v-if="open === 'sku'"
        id="overview-sku-menu"
        class="overview-scope-menu sku-menu"
        role="region"
        aria-label="SKU selection"
      >
        <header>PRODUCT SCOPE</header>
        <div
          class="sku-mode-options"
          role="group"
          aria-label="SKU selection mode"
        >
          <button :aria-pressed="draftMode === 'all'" @click="sku('all')">
            All SKUs</button
          ><button
            :aria-pressed="draftMode === 'single'"
            @click="
              draftMode = 'single';
              search = '';
            "
          >
            Single SKU</button
          ><button
            :aria-pressed="draftMode === 'parent'"
            @click="
              draftMode = 'parent';
              search = '';
            "
          >
            Parent SKU
          </button>
        </div>
        <input
          v-model="search"
          class="scope-sku-search"
          aria-label="Search SKUs"
          placeholder="Search SKU, ASIN or product…"
          autocomplete="off"
          @input="draftMode === 'all' && (draftMode = 'single')"
        />
        <div class="scope-sku-results">
          <button
            v-for="product in results"
            :key="product.id"
            :aria-label="`Choose ${draftMode === 'parent' ? 'parent SKU' : 'SKU'} ${product.sku}`"
            :aria-pressed="
              selection.skuId === product.id && selection.skuMode === draftMode
            "
            @click="
              sku(draftMode === 'parent' ? 'parent' : 'single', product.id)
            "
          >
            <span
              class="scope-product-icon"
              :style="{ background: product.color }"
              >{{ product.icon || "▧" }}</span
            ><span
              ><strong>{{ product.sku }}</strong
              ><small>{{ product.title }}</small
              ><small v-if="draftMode === 'parent'"
                >{{
                  catalog.filter((p) => p.parentId === product.id).length
                }}
                child variations · {{ product.marketplaces.join(" / ") }}</small
              ></span
            ><span class="scope-check">{{
              selection.skuId === product.id && selection.skuMode === draftMode
                ? "✓"
                : ""
            }}</span>
          </button>
          <p v-if="!catalog.length">Loading the demo catalog…</p>
          <p v-else-if="!results.length">
            No {{ draftMode === "parent" ? "parent SKUs" : "SKUs" }} match your
            search.
          </p>
        </div>
        <footer>
          {{
            draftMode === "parent"
              ? "Parent selections include all child variations once."
              : "Select one SKU, or choose All SKUs for the entire catalog."
          }}
        </footer>
      </section>
    </div>
  </div>
</template>
