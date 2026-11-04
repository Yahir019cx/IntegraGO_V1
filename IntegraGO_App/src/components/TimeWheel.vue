<script setup lang="ts">
import { computed } from "vue";
import { IonPicker, IonPickerColumn, IonPickerColumnOption } from "@ionic/vue";
import { changeTimePart } from "@/utils/dateTimePicker";
const props = defineProps<{ slots: string[] | null }>();
const model = defineModel<string>({ required: true });
const timeFormat = new Intl.DateTimeFormat("es-MX", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const hour24 = computed(() => Number(model.value.slice(11, 13)));
const hour = computed(() => hour24.value % 12 || 12);
const minute = computed(() => Number(model.value.slice(14, 16)));
const period = computed(() => (hour24.value >= 12 ? "pm" : "am"));
const minutes = Array.from({ length: 60 }, (_, index) => index);
function selectSlot(event: CustomEvent<{ value: string | number | undefined }>) {
  const value = event.detail.value;
  if (typeof value === "string" && props.slots?.includes(value)) model.value = value;
}
function update(
  part: "hour" | "minute" | "period",
  event: CustomEvent<{ value: string | number | undefined }>,
) {
  if (event.detail.value === undefined) return;
  model.value = changeTimePart(model.value, part, event.detail.value);
}
</script>
<template>
  <IonPicker
    class="time-wheel"
    mode="ios"
    aria-label="Seleccionar hora y minutos"
  >
    <IonPickerColumn
      v-if="slots"
      :value="model"
      aria-label="Horario de entrega"
      @ionChange="selectSlot"
    >
      <IonPickerColumnOption v-for="slot in slots" :key="slot" :value="slot">
        {{ timeFormat.format(new Date(slot)) }}
      </IonPickerColumnOption>
    </IonPickerColumn>
    <template v-else>
      <IonPickerColumn
        :value="hour"
        aria-label="Hora"
        @ionChange="update('hour', $event)"
      >
        <IonPickerColumnOption v-for="value in 12" :key="value" :value="value">
          {{ String(value).padStart(2, "0") }}
        </IonPickerColumnOption>
      </IonPickerColumn>
      <IonPickerColumn
        :value="minute"
        aria-label="Minutos"
        @ionChange="update('minute', $event)"
      >
        <IonPickerColumnOption
          v-for="value in minutes"
          :key="value"
          :value="value"
        >
          {{ String(value).padStart(2, "0") }}
        </IonPickerColumnOption>
      </IonPickerColumn>
      <IonPickerColumn
        :value="period"
        aria-label="Periodo del día"
        @ionChange="update('period', $event)"
      >
        <IonPickerColumnOption value="pm">p.m.</IonPickerColumnOption>
        <IonPickerColumnOption value="am">a.m.</IonPickerColumnOption>
      </IonPickerColumn>
    </template>
  </IonPicker>
</template>
<style scoped>
.time-wheel {
  width: 100%;
  --background: white;
  --highlight-background: var(--primary-soft);
  --highlight-border-radius: 12px;
  --fade-background-rgb: 255, 255, 255;
  padding-inline: 8px;
}
ion-picker-column {
  color: var(--primary);
  font-family: var(--font-family);
}
ion-picker-column-option {
  font-size: 20px;
  font-weight: 500;
}
</style>
