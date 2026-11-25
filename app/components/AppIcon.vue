<script setup lang="ts">
defineProps<{ name: string }>();
const paths: Record<string, string[]> = {
  overview: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"],
  explorer: ["M3 3v18h18", "m6 14 4-6 4 4 6-9"],
  sales: ["m3 17 6-6 4 4 8-12", "M15 3h6v6"],
  advertising: [
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20",
    "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10",
    "M12 12h.01",
  ],
  profitability: ["m12 3 9 9-9 9-9-9 9-9Z", "m12 7 5 5-5 5-5-5 5-5Z"],
  products: ["m3 7 9-4 9 4-9 4-9-4Z", "M3 7v10l9 4 9-4V7", "M12 11v10"],
  inventory: ["M3 4h18v17H3z", "M7 4v6h10V4", "M8 16h8"],
  reports: ["M5 3h10l4 4v14H5z", "M14 3v5h5", "M8 12h8", "M8 16h8"],
  saved: [
    "m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9L12 3Z",
  ],
  settings: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    "m9 3 1-1h4l1 3 3 1 2-1 2 3-2 2v4l2 2-2 3-3-1-2 1-1 3h-4l-1-3-2-1-3 1-2-3 2-2v-4L2 8l2-3 2 1 3-1V3Z",
  ],
  arrow: ["M5 19 19 5", "M5 5h14v14"],
};
</script>
<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      v-for="(path, index) in paths[name] || paths.explorer"
      :key="index"
      :d="path"
    />
  </svg>
</template>
