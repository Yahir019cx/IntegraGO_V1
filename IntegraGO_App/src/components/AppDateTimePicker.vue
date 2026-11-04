<script setup lang="ts">
import { computed, ref } from "vue";
import { IonDatetime, IonModal } from "@ionic/vue";
import AppIcon from "./AppIcon.vue";
import TimeWheel from "./TimeWheel.vue";
import { mergePickerValue, pickerMinimum } from "@/utils/dateTimePicker";

const props = withDefaults(
  defineProps<{ id: string; label: string; after?: string; error?: string }>(),
  { after: "", error: "" },
);
const model = defineModel<string>({ required: true });
const emit = defineEmits<{ change: [] }>();
const open = ref(false);
const tab = ref<"date" | "time">("date");
const pending = ref("");
const minimum = ref("");
const localError = ref("");
const maximum = `${new Date().getFullYear() + 100}-12-31T23:59`;
function formatted(value: string, time = false) {
  if (!Number.isFinite(Date.parse(value))) return "";
  return new Intl.DateTimeFormat(
    "es-MX",
    time
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : { day: "numeric", month: "short", year: "numeric" },
  ).format(new Date(value));
}
const display = computed(() => formatted(model.value));
function show() {
  minimum.value = pickerMinimum(props.after);
  pending.value =
    Date.parse(model.value) >= Date.parse(minimum.value)
      ? model.value
      : minimum.value;
  tab.value = "date";
  localError.value = "";
  open.value = true;
}
function update(event: CustomEvent<{ value?: string | string[] | null }>) {
  const value = event.detail.value;
  if (typeof value !== "string") return;
  pending.value = mergePickerValue(pending.value, value, tab.value);
  localError.value = "";
}
function confirm() {
  if (
    !Number.isFinite(Date.parse(pending.value)) ||
    Date.parse(pending.value) < Date.parse(pickerMinimum(props.after))
  ) {
    localError.value = props.after
      ? "Elige una fecha y hora posterior a la entrega y al momento actual."
      : "Elige una fecha y hora futura.";
    return;
  }
  model.value = pending.value;
  emit("change");
  open.value = false;
}
function dismiss() {
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
      class="date-trigger"
      :class="{ 'has-value': display }"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="`${id}-dialog`"
      :aria-labelledby="`${id}-label ${id}-value`"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      @click="show"
    >
      <span class="date-trigger-icon">
        <AppIcon name="calendar" :size="20" />
      </span>
      <span :id="`${id}-value`" class="date-trigger-value">
        <template v-if="display">
          <strong>{{ display }}</strong>
          <span>{{ formatted(model, true) }}</span>
        </template>
        <template v-else>Selecciona fecha y hora</template>
      </span>
      <AppIcon class="date-trigger-chevron" name="arrow" :size="16" />
    </button>
    <p v-if="error" :id="`${id}-error`" class="field-error" role="alert">
      {{ error }}
    </p>
    <IonModal
      :id="`${id}-dialog`"
      :is-open="open"
      class="date-modal"
      :aria-labelledby="`${id}-title`"
      @didDismiss="dismiss"
    >
      <section class="date-sheet">
        <div class="date-sheet-handle" aria-hidden="true" />
        <header class="date-sheet-heading">
          <div>
            <h2 :id="`${id}-title`">{{ label }}</h2>
            <p>Elige el día y ajusta la hora</p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="Cancelar selección de fecha"
            @click="open = false"
          >
            <AppIcon name="close" :size="20" />
          </button>
        </header>
        <div
          class="date-segments"
          role="group"
          aria-label="Elegir fecha u hora"
        >
          <button
            type="button"
            :class="{ selected: tab === 'date' }"
            :aria-pressed="tab === 'date'"
            @click="tab = 'date'"
          >
            <AppIcon name="calendar" :size="17" />
            Fecha
          </button>
          <button
            type="button"
            :class="{ selected: tab === 'time' }"
            :aria-pressed="tab === 'time'"
            @click="tab = 'time'"
          >
            <AppIcon name="clock" :size="17" />
            Hora
          </button>
        </div>
        <div class="date-selection-preview" aria-live="polite">
          <span>{{ formatted(pending) }}</span>
          <strong>{{ formatted(pending, true) }}</strong>
        </div>
        <div class="date-picker-body">
          <IonDatetime
            v-if="tab === 'date'"
            :key="tab"
            :value="pending"
            :presentation="tab"
            locale="es-MX"
            mode="ios"
            hour-cycle="h12"
            :first-day-of-week="1"
            :min="minimum"
            :max="maximum"
            :show-default-title="false"
            :show-default-buttons="false"
            :show-adjacent-days="true"
            :aria-label="
              tab === 'date' ? 'Seleccionar día' : 'Seleccionar hora y minutos'
            "
            @ionChange="update"
          />
          <TimeWheel
            v-else
            v-model="pending"
            @update:model-value="localError = ''"
          />
        </div>
        <p v-if="localError" class="field-error" role="alert">
          {{ localError }}
        </p>
        <footer class="date-sheet-actions">
          <button
            type="button"
            class="button button-secondary"
            @click="open = false"
          >
            Cancelar
          </button>
          <button
            v-if="tab === 'date'"
            type="button"
            class="button button-primary"
            @click="tab = 'time'"
          >
            Elegir hora
            <AppIcon name="arrow" :size="17" />
          </button>
          <button
            v-else
            type="button"
            class="button button-primary"
            @click="confirm"
          >
            Confirmar
          </button>
        </footer>
      </section>
    </IonModal>
  </div>
</template>
<style scoped>
.date-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 62px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--white);
  color: var(--muted);
  text-align: left;
}
.date-trigger:hover {
  border-color: #adc5e5;
  background: #fafcff;
}
.date-trigger[aria-expanded="true"] {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px #075dce0c;
}
.field-invalid .date-trigger {
  border-color: var(--danger);
}
.date-trigger-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: var(--primary-soft);
  color: var(--primary);
  border-radius: 11px;
}
.date-trigger-value {
  display: grid;
  gap: 2px;
  flex: 1;
  font-size: 14px;
}
.date-trigger-value strong {
  font-weight: 500;
  color: var(--text);
}
.date-trigger-value > span {
  font-size: 12px;
  color: var(--muted);
}
.date-trigger-chevron {
  color: #738093;
  flex-shrink: 0;
}
</style>
<style>
ion-modal.date-modal {
  --width: min(100%, 480px);
  --height: min(720px, 94dvh);
  --border-radius: 24px 24px 0 0;
  --box-shadow: 0 -8px 48px #12254414;
  --backdrop-opacity: 0.24;
  align-items: flex-end;
}
.date-sheet {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--white);
  color: var(--text);
  padding: 12px 24px calc(20px + env(safe-area-inset-bottom, 0px));
}
.date-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 8px;
  background: #dce2eb;
  margin: 0 auto 20px;
  flex-shrink: 0;
}
.date-sheet-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.date-sheet-heading > div {
  flex: 1;
}
.date-sheet-heading h2 {
  font-size: 19px;
  margin: 0 0 6px;
}
.date-sheet-heading p {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
}
.date-sheet-heading .icon-button {
  background: var(--surface);
}
.date-segments {
  display: flex;
  flex-shrink: 0;
  padding: 4px;
  gap: 4px;
  background: var(--surface);
  border-radius: 14px;
}
.date-segments button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  color: var(--muted);
  font-weight: 500;
}
.date-segments button.selected {
  border-color: #e3eaf3;
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 5px #172c5008;
}
.date-selection-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 12px;
  padding: 16px 4px;
  color: #53637b;
  font-size: 13px;
}
.date-selection-preview strong {
  color: var(--primary);
  font-weight: 600;
}
.date-picker-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.date-picker-body ion-datetime {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  --background: white;
  --background-rgb: 255, 255, 255;
  --ion-color-primary: var(--primary);
  --ion-color-primary-contrast: white;
  --title-color: var(--text);
  --wheel-highlight-background: #edf5ff;
  --wheel-highlight-border-radius: 12px;
  --wheel-fade-background-rgb: 255, 255, 255;
  font-family: var(--font-family);
}
.date-picker-body ion-datetime::part(calendar-day) {
  border-radius: 12px;
  font-size: 14px;
}
.date-picker-body ion-datetime::part(calendar-day active) {
  background: var(--primary);
  color: white;
  box-shadow: 0 3px 8px #075dce20;
}
.date-picker-body ion-datetime::part(calendar-day today) {
  border-color: #a2c5f0;
}
.date-picker-body ion-datetime::part(calendar-days-of-week) {
  color: var(--muted);
}
.date-picker-body ion-datetime::part(wheel-item) {
  color: #64738a;
  font-size: 20px;
}
.date-picker-body ion-datetime::part(wheel-item active) {
  color: var(--primary);
  font-weight: 600;
}
.date-sheet-actions {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
  margin-top: 12px;
}
.date-sheet-actions .button {
  flex: 1;
}
@media (min-width: 768px) {
  ion-modal.date-modal {
    align-items: center;
    --border-radius: 24px;
  }
}
@media (max-width: 360px) {
  .date-sheet {
    padding-left: 16px;
    padding-right: 16px;
  }
}
@media (max-height: 560px) {
  .date-sheet-handle {
    margin-bottom: 8px;
  }
  .date-sheet-heading {
    margin-bottom: 12px;
  }
  .date-selection-preview {
    padding: 8px 4px;
  }
}
</style>
