<script setup lang="ts">
import AppField from "@/components/AppField.vue";
import AppIcon from "@/components/AppIcon.vue";
import { draft } from "@/composables/useDraft";
defineProps<{ errors: Record<string, string> }>();
defineEmits<{ clearError: [key: string] }>();
</script>
<template>
  <h2>Datos del cliente</h2>
  <AppField id="client-name" label="Nombre completo" :error="errors.name ?? ''">
    <AppIcon name="user" :size="20" />
    <input
      id="client-name"
      v-model="draft.client.name"
      autocomplete="name"
      placeholder="Nombre y apellidos"
      maxlength="120"
      required
      :aria-invalid="!!errors.name"
      :aria-describedby="errors.name ? 'client-name-error' : undefined"
      @input="$emit('clearError', 'name')"
    />
  </AppField>
  <AppField
    id="client-email"
    label="Correo electrónico"
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
      required
      :aria-invalid="!!errors.email"
      :aria-describedby="errors.email ? 'client-email-error' : undefined"
      @input="$emit('clearError', 'email')"
    />
  </AppField>
  <AppField id="client-phone" label="Teléfono" :error="errors.phone ?? ''">
    <AppIcon name="phone" :size="20" />
    <input
      id="client-phone"
      v-model="draft.client.phone"
      type="tel"
      autocomplete="tel"
      placeholder="10 dígitos"
      maxlength="24"
      required
      :aria-invalid="!!errors.phone"
      :aria-describedby="errors.phone ? 'client-phone-error' : undefined"
      @input="$emit('clearError', 'phone')"
    />
  </AppField>
  <p class="form-hint">Usa únicamente datos ficticios en esta demostración.</p>
</template>
