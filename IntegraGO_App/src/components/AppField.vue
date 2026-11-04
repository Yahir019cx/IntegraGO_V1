<script setup lang="ts">
withDefaults(defineProps<{ id: string; label: string; error?: string }>(), {
  error: "",
});
</script>
<template>
  <div class="field" :class="{ 'field-invalid': error }">
    <label :for="id">{{ label }}</label>
    <div class="field-control"><slot /></div>
    <p v-if="error" :id="`${id}-error`" class="field-error" role="alert">
      {{ error }}
    </p>
  </div>
</template>
