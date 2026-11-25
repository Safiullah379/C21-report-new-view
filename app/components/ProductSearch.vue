<script setup lang="ts">
import type { Product } from "~~/shared/types/analytics";
const selected = defineModel<string[]>({ required: true });
const query = ref(""),
  open = ref(false),
  results = ref<Product[]>([]),
  status = ref(""),
  active = ref(0);
let timer: ReturnType<typeof setTimeout> | undefined,
  controller: AbortController | undefined;
const cache = new Map<string, Product[]>();
async function search() {
  controller?.abort();
  const key = query.value.trim().toLowerCase();
  if (cache.has(key)) {
    results.value = cache.get(key)!;
    status.value = "";
    return;
  }
  const current = new AbortController();
  controller = current;
  status.value = "Searching…";
  try {
    const result = await $fetch<{ products: Product[]; mode: string }>(
      "/api/products",
      { query: { q: key }, signal: current.signal },
    );
    if (controller !== current) return;
    results.value = result.products;
    cache.set(key, result.products);
    status.value =
      result.mode === "unavailable"
        ? "Connect a product catalog to search."
        : result.products.length
          ? ""
          : "No matching products.";
  } catch {
    if (!current.signal.aborted) status.value = "Search failed. Try again.";
  }
}
watch(query, () => {
  controller?.abort();
  clearTimeout(timer);
  active.value = 0;
  timer = setTimeout(() => {
    void search();
  }, 200);
});
function toggle(product: Product) {
  selected.value = selected.value.includes(product.id)
    ? selected.value.filter((id) => id !== product.id)
    : [...selected.value, product.id];
}
function keydown(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    open.value = true;
    active.value = Math.max(
      0,
      Math.min(
        results.value.length - 1,
        active.value + (event.key === "ArrowDown" ? 1 : -1),
      ),
    );
  }
  if (event.key === "Enter" && open.value && results.value[active.value]) {
    event.preventDefault();
    toggle(results.value[active.value]!);
  }
}
onBeforeUnmount(() => {
  clearTimeout(timer);
  controller?.abort();
});
</script>
<template>
  <div
    class="product-search"
    @focusout="
      (event) => {
        if (
          !(event.currentTarget as HTMLElement).contains(
            event.relatedTarget as Node,
          )
        )
          open = false;
      }
    "
  >
    <label for="product-search">Product universe</label>
    <div class="search-input">
      <span aria-hidden="true">⌕</span
      ><input
        id="product-search"
        v-model="query"
        role="combobox"
        aria-controls="product-results"
        :aria-expanded="open"
        :aria-activedescendant="
          open && results.length ? `product-${active}` : undefined
        "
        placeholder="Search SKU, ASIN, product or brand…"
        autocomplete="off"
        @focus="
          open = true;
          search();
        "
        @keydown="keydown"
      /><button
        v-if="selected.length"
        aria-label="Clear products"
        @click="selected = []"
      >
        {{ selected.length }} selected ×
      </button>
    </div>
    <div v-if="open" class="search-results">
      <p v-if="status" role="status">{{ status }}</p>
      <ul id="product-results" role="listbox" aria-multiselectable="true">
        <li
          v-for="(product, index) in results"
          :id="`product-${index}`"
          :key="product.id"
          role="option"
          :aria-selected="selected.includes(product.id)"
          :class="{ active: active === index }"
          @mousedown.prevent="toggle(product)"
        >
          <span class="product-symbol">{{ product.parentId ? "↳" : "▧" }}</span>
          <div>
            <strong>{{ product.title }}</strong
            ><small
              >{{ product.sku }} · {{ product.asin }} ·
              {{ product.brand }}</small
            ><small
              >{{ product.variation }} ·
              {{ product.marketplaces.join(", ") }}</small
            >
          </div>
          <span>{{ selected.includes(product.id) ? "✓" : "+" }}</span>
        </li>
      </ul>
      <small>Parent selections include every child once.</small
      ><button class="text-button" @click="open = false">Done</button>
    </div>
  </div>
</template>
