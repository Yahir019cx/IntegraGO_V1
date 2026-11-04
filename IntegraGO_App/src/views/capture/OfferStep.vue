<script setup lang="ts">
import AppDateTimePicker from "@/components/AppDateTimePicker.vue";
import AppField from "@/components/AppField.vue";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";
import { draft } from "@/composables/useDraft";
import type { getCatalogs } from "@/services/catalogs";
defineProps<{
  errors: Record<string, string>;
  catalogs: ReturnType<typeof getCatalogs>;
}>();
defineEmits<{ clearError: [key: string] }>();
</script>
<template>
  <h2>Detalles de la renta</h2>
  <AppSelect
    id="offer-group"
    v-model="draft.groupId"
    label="Grupo de vehículo"
    placeholder="Selecciona un grupo"
    search-placeholder="Buscar grupo de vehículo…"
    icon="car"
    :options="catalogs.groups"
    :error="errors.groupId ?? ''"
    @change="$emit('clearError', 'groupId')"
  />
  <AppSelect
    id="offer-coverage"
    v-model="draft.coverageId"
    label="Cobertura"
    placeholder="Selecciona una cobertura"
    search-placeholder="Buscar cobertura…"
    icon="shield"
    :options="catalogs.coverages"
    :error="errors.coverageId ?? ''"
    @change="$emit('clearError', 'coverageId')"
  />
  <AppDateTimePicker
    id="offer-pickup"
    v-model="draft.pickupAt"
    label="Fecha y hora de entrega"
    pickup
    :error="errors.pickupAt ?? ''"
    @change="$emit('clearError', 'pickupAt')"
  />
  <AppDateTimePicker
    id="offer-return"
    v-model="draft.returnAt"
    label="Fecha y hora de devolución"
    :error="errors.returnAt ?? ''"
    :after="draft.pickupAt"
    @change="$emit('clearError', 'returnAt')"
  />
  <AppField
    id="offer-total"
    label="Precio total ofrecido (MXN)"
    :error="errors.total ?? ''"
  >
    <AppIcon name="banknote" :size="20" />
    <input
      id="offer-total"
      v-model="draft.total"
      type="text"
      inputmode="decimal"
      maxlength="12"
      placeholder="0.00"
      required
      :aria-invalid="!!errors.total"
      :aria-describedby="errors.total ? 'offer-total-error' : undefined"
      @input="$emit('clearError', 'total')"
    />
  </AppField>
  <p class="form-hint">
    Total final de la renta, con impuestos y cobertura incluidos.
  </p>
</template>
