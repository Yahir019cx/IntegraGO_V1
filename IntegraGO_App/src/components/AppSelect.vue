<script setup lang="ts" generic="T extends string">
import { computed, ref, watch } from "vue";
import { IonModal } from "@ionic/vue";
import AppIcon from "./AppIcon.vue";

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    placeholder?: string;
    searchPlaceholder?: string;
    icon?: string;
    error?: string;
    options: { id: T; name: string }[];
  }>(),
  {
    placeholder: "Selecciona una opción",
    searchPlaceholder: "Buscar opciones…",
    icon: "",
    error: "",
  },
);
const model = defineModel<T>({ required: true });
const emit = defineEmits<{ change: [value: T] }>();
const open = ref(false);
const query = ref("");
const active = ref(0);
const searchInput = ref<HTMLInputElement>();
const selected = computed(() =>
  props.options.find((option) => option.id === model.value),
);
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
const filtered = computed(() =>
  props.options.filter((option) =>
    normalize(option.name).includes(normalize(query.value)),
  ),
);
watch(query, () => {
  active.value = 0;
});
function show() {
  query.value = "";
  active.value = Math.max(
    0,
    props.options.findIndex((option) => option.id === model.value),
  );
  open.value = true;
}
function choose(value: T) {
  model.value = value;
  emit("change", value);
  open.value = false;
}
function onKey(event: KeyboardEvent) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    active.value = Math.max(
      0,
      Math.min(
        filtered.value.length - 1,
        active.value + (event.key === "ArrowDown" ? 1 : -1),
      ),
    );
    document
      .getElementById(`${props.id}-option-${active.value}`)
      ?.scrollIntoView({ block: "nearest" });
  } else if (event.key === "Enter") {
    event.preventDefault();
    const option = filtered.value[active.value];
    if (option) choose(option.id);
  } else if (event.key === "Escape") {
    event.preventDefault();
    open.value = false;
  }
}
function onDismiss() {
  open.value = false;
  document.getElementById(props.id)?.focus();
}
</script>

<template>
  <div class="field" :class="{ 'field-invalid': error }">
    <label :id="`${id}-label`" :for="id">{{ label }}</label>
    <button
      :id="id"
      type="button"
      class="select-trigger"
      :class="{ 'is-placeholder': !selected }"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="`${id}-dialog`"
      :aria-labelledby="`${id}-label ${id}-value`"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      @click="show"
    >
      <AppIcon v-if="icon" :name="icon" :size="20" />
      <span :id="`${id}-value`">{{ selected?.name ?? placeholder }}</span>
      <AppIcon class="select-chevron" name="arrow" :size="16" />
    </button>
    <p v-if="error" :id="`${id}-error`" class="field-error" role="alert">
      {{ error }}
    </p>
    <IonModal
      :id="`${id}-dialog`"
      :is-open="open"
      class="select-modal"
      :aria-labelledby="`${id}-title`"
      @didDismiss="onDismiss"
      @didPresent="searchInput?.focus()"
    >
      <section class="select-sheet">
        <div class="select-sheet-handle" aria-hidden="true" />
        <header class="select-sheet-header">
          <div>
            <h2 :id="`${id}-title`">{{ label }}</h2>
            <p>Encuentra y selecciona una opción</p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="Cerrar selector"
            @click="open = false"
          >
            <AppIcon name="close" :size="20" />
          </button>
        </header>
        <div class="select-search field-control">
          <AppIcon name="search" :size="20" />
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            role="combobox"
            :aria-label="`Buscar ${label.toLocaleLowerCase('es')}`"
            aria-autocomplete="list"
            :aria-expanded="true"
            :aria-controls="`${id}-options`"
            :aria-activedescendant="
              filtered.length ? `${id}-option-${active}` : undefined
            "
            :placeholder="searchPlaceholder"
            autocomplete="off"
            @keydown="onKey"
          />
          <button
            v-if="query"
            type="button"
            class="icon-button"
            aria-label="Limpiar búsqueda"
            @click="
              query = '';
              searchInput?.focus();
            "
          >
            <AppIcon name="close" :size="18" />
          </button>
        </div>
        <p class="select-count" role="status">
          {{ filtered.length }}
          {{
            filtered.length === 1 ? "opción disponible" : "opciones disponibles"
          }}
        </p>
        <div
          :id="`${id}-options`"
          class="select-options"
          role="listbox"
          :aria-label="label"
        >
          <button
            v-for="(option, index) in filtered"
            :id="`${id}-option-${index}`"
            :key="option.id"
            type="button"
            role="option"
            tabindex="-1"
            class="select-option"
            :class="{
              'is-selected': model === option.id,
              'is-highlighted': active === index,
            }"
            :aria-selected="model === option.id"
            @click="choose(option.id)"
          >
            <span class="select-option-icon">
              <AppIcon :name="icon || 'file'" :size="20" />
            </span>
            <span class="select-option-name">{{ option.name }}</span>
            <span
              class="select-option-check"
              :class="{ checked: model === option.id }"
            >
              <AppIcon v-if="model === option.id" name="check" :size="14" />
            </span>
          </button>
        </div>
        <div v-if="!filtered.length" class="select-empty">
          <AppIcon name="search" :size="28" />
          <h3>Sin coincidencias</h3>
          <p>Prueba con otro nombre.</p>
          <button
            type="button"
            class="text-button"
            @click="
              query = '';
              searchInput?.focus();
            "
          >
            Limpiar búsqueda
          </button>
        </div>
      </section>
    </IonModal>
  </div>
</template>

<style scoped>
.select-trigger {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--white);
  color: var(--text);
  text-align: left;
}
.select-trigger > svg {
  color: #4f5968;
  flex-shrink: 0;
}
.select-trigger > span {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.select-trigger.is-placeholder {
  color: #6e7785;
}
.select-trigger:hover {
  border-color: #adc5e5;
  background: #fafcff;
}
.select-trigger[aria-expanded="true"] {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--ion-color-primary-rgb), 0.05);
}
.select-trigger .select-chevron {
  transform: rotate(90deg);
  color: #738093;
}
.field-invalid .select-trigger {
  border-color: var(--danger);
}
</style>

<style>
/* IonModal se presenta fuera del árbol de la vista mediante un overlay de Ionic. */
ion-modal.select-modal {
  --width: min(100%, 520px);
  --height: min(580px, 88dvh);
  --border-radius: 24px 24px 0 0;
  --box-shadow: 0 -8px 48px #12254414;
  --backdrop-opacity: 0.24;
  align-items: flex-end;
}
.select-sheet {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 24px calc(20px + env(safe-area-inset-bottom, 0px));
  background: var(--white);
  color: var(--text);
}
.select-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 8px;
  background: #dce2eb;
  margin: 0 auto 20px;
  flex-shrink: 0;
}
.select-sheet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.select-sheet-header > div {
  flex: 1;
}
.select-sheet-header h2 {
  font-size: 20px;
  margin: 0 0 6px;
}
.select-sheet-header p {
  color: var(--muted);
  font-size: 12px;
  margin: 0;
}
.select-sheet-header .icon-button {
  background: var(--surface);
}
.select-search {
  flex-shrink: 0;
  border-color: #dce5f0;
}
.select-search input {
  font-size: 16px;
}
.select-count {
  color: var(--muted);
  font-size: 12px;
  margin: 16px 0 12px;
}
.select-options {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 2px 2px 8px;
}
.select-option {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-height: 64px;
  width: 100%;
  text-align: left;
  padding: 12px;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  background: var(--white);
  color: var(--text);
}
.select-option.is-highlighted {
  border-color: #bfd4ed;
  background: #fafcff;
}
.select-option.is-selected {
  border-color: #a5c8f4;
  background: var(--primary-soft);
}
.select-option-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: var(--surface);
  color: #657287;
  flex-shrink: 0;
}
.is-selected .select-option-icon {
  background: #dfeeff;
  color: var(--primary);
}
.select-option-name {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
}
.select-option-check {
  display: grid;
  place-items: center;
  height: 22px;
  width: 22px;
  border: 1px solid #d6dee9;
  border-radius: 50%;
  flex-shrink: 0;
}
.select-option-check.checked {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
.select-empty {
  text-align: center;
  padding: 20px 0;
  color: var(--muted);
}
.select-empty > svg {
  margin-bottom: 12px;
  color: #8190a4;
}
.select-empty h3 {
  font-size: 16px;
  color: var(--text);
  margin: 0 0 8px;
}
.select-empty p {
  margin: 0;
  font-size: 13px;
}
@media (min-width: 768px) {
  ion-modal.select-modal {
    align-items: center;
    --border-radius: 24px;
  }
}
@media (max-height: 500px) {
  .select-sheet {
    padding-top: 8px;
  }
  .select-sheet-handle {
    margin-bottom: 8px;
  }
  .select-sheet-header {
    margin-bottom: 12px;
  }
  .select-count {
    margin-top: 10px;
  }
}
</style>
