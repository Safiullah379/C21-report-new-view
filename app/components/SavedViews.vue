<script setup lang="ts">
import {
  templates,
  type Preference,
  type SavedView,
} from "~~/shared/analytics/workspace";
const props = defineProps<{ saved: SavedView[]; defaultView: string }>();
const emit = defineEmits<{
  open: [value: Preference];
  template: [index: number];
  rename: [id: string, name: string];
  duplicate: [id: string];
  remove: [id: string];
  default: [id: string];
}>();
const editing = ref(""),
  name = ref(""),
  pendingDelete = ref("");
function rename() {
  if (name.value.trim()) {
    emit("rename", editing.value, name.value);
    editing.value = "";
  }
}
</script>
<template>
  <div class="section-line">
    <div>
      <h2>
        Your saved views <span class="muted">{{ props.saved.length }}/30</span>
      </h2>
      <p>
        Stored in this browser. Share a configuration link from the Explorer or
        back up views in Settings.
      </p>
    </div>
  </div>
  <div class="saved-grid">
    <article v-for="view in saved" :key="view.id" class="saved-card">
      <span class="eyebrow">{{
        defaultView === view.id ? "★ DEFAULT ON START" : "SAVED PERSPECTIVE"
      }}</span>
      <form v-if="editing === view.id" @submit.prevent="rename">
        <label
          >New view name<input v-model="name" maxlength="80" required /></label
        ><button class="button primary">Save name</button
        ><button class="text-button" type="button" @click="editing = ''">
          Cancel
        </button>
      </form>
      <h2 v-else>{{ view.name }}</h2>
      <p>
        {{ view.value.layout }} · {{ view.value.filters.currency }} ·
        {{
          view.value.days === "custom"
            ? `${view.value.filters.start} — ${view.value.filters.end}`
            : view.value.days.match(/^\d+$/)
              ? `Last ${view.value.days} days`
              : view.value.days
        }}
      </p>
      <div class="view-metrics">
        <span v-for="id in view.value.visible.slice(0, 4)" :key="id">{{
          id
        }}</span
        ><span v-if="view.value.visible.length > 4"
          >+{{ view.value.visible.length - 4 }}</span
        >
      </div>
      <button class="button primary" @click="emit('open', view.value)">
        Open view →
      </button>
      <div class="saved-actions">
        <button
          @click="
            editing = view.id;
            name = view.name;
          "
        >
          Rename</button
        ><button
          :disabled="saved.length >= 30"
          @click="emit('duplicate', view.id)"
        >
          Duplicate</button
        ><button
          @click="emit('default', defaultView === view.id ? '' : view.id)"
        >
          {{
            defaultView === view.id ? "Clear default" : "Make default"
          }}</button
        ><button class="danger-text" @click="pendingDelete = view.id">
          Delete
        </button>
      </div>
      <div v-if="pendingDelete === view.id" class="inline-confirm">
        Delete this browser-local view?<button
          class="text-button danger-text"
          @click="
            emit('remove', view.id);
            pendingDelete = '';
          "
        >
          Delete view</button
        ><button class="text-button" @click="pendingDelete = ''">Keep</button>
      </div>
    </article>
    <div v-if="!saved.length" class="empty-state">
      <span class="empty-icon">☆</span>
      <h2>Your next insight, one click away.</h2>
      <p>
        Start with a template below, customize your charts, then save the view
        from Performance Explorer.
      </p>
    </div>
  </div>
  <div class="section-line">
    <div>
      <h2>Start with a perspective</h2>
      <p>Curated templates. Every chart stays customizable.</p>
    </div>
  </div>
  <div class="template-grid">
    <button
      v-for="(template, index) in templates"
      :key="template.name"
      class="template-card"
      @click="emit('template', index)"
    >
      <span class="template-icon">{{
        ["▦", "↗", "◎", "◈", "◉", "⇄", "↔", "▤"][index]
      }}</span>
      <h3>{{ template.name }}</h3>
      <p>{{ template.description }}</p>
      <span class="template-link">Use template →</span>
    </button>
  </div>
</template>
