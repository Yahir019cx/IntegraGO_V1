<script setup lang="ts">
import AppField from "@/components/AppField.vue";
import AppIcon from "@/components/AppIcon.vue";
import { draft } from "@/composables/useDraft";
defineProps<{ errors: Record<string, string> }>();
const emit = defineEmits<{ clearError: [key: string] }>();

function updateClientInput(event: Event, field: "name" | "phone") {
  if (event instanceof InputEvent && event.isComposing) return;
  const input = event.currentTarget as HTMLInputElement;
  const invalidCharacters = field === "name" ? /[^\p{L}\p{M} ]/gu : /\D/g;
  const value = input.value.replace(invalidCharacters, "");
  if (value !== input.value) {
    const cursor = input.value.slice(0, input.selectionStart ?? input.value.length)
      .replace(invalidCharacters, "").length;
    input.value = value;
    input.setSelectionRange(cursor, cursor);
  }
  draft.client[field] = value;
  emit("clearError", field);
}
</script>
<template>
  <h2>Datos del cliente</h2>
  <AppField id="client-name" label="Nombre completo" :error="errors.name ?? ''">
    <AppIcon name="user" :size="20" />
    <input
      id="client-name"
      :value="draft.client.name"
      autocomplete="name"
      placeholder="Nombre y apellidos"
      maxlength="120"
      required
      :aria-invalid="!!errors.name"
      :aria-describedby="errors.name ? 'client-name-error' : undefined"
      @input="updateClientInput($event, 'name')"
      @compositionend="updateClientInput($event, 'name')"
    />
  </AppField>
  <AppField
    id="client-email"
    label="Correo electrónico (opcional)"
    :error="errors.email ?? ''"
  >
    <AppIcon name="mail" :size="20" />
    <input
      id="client-email"
      v-model="draft.client.email"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder="correo@ejemplo.com"
      maxlength="160"
      :aria-invalid="!!errors.email"
      :aria-describedby="errors.email ? 'client-email-error' : undefined"
      @input="$emit('clearError', 'email')"
    />
  </AppField>
  <AppField id="client-phone" label="Teléfono" :error="errors.phone ?? ''">
    <AppIcon name="phone" :size="20" />
    <input
      id="client-phone"
      :value="draft.client.phone"
      type="tel"
      inputmode="numeric"
      autocomplete="tel"
      placeholder="10 a 15 dígitos"
      maxlength="24"
      required
      :aria-invalid="!!errors.phone"
      :aria-describedby="errors.phone ? 'client-phone-error' : undefined"
      @input="updateClientInput($event, 'phone')"
    />
  </AppField>
</template>
