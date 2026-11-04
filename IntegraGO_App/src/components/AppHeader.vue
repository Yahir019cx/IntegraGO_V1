<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
defineProps<{ title: string; backLabel?: string }>();
defineEmits<{ back: [] }>();
</script>
<template>
  <header class="app-header">
    <button
      v-if="backLabel"
      type="button"
      class="icon-button"
      :aria-label="backLabel"
      @click="$emit('back')"
    >
      <AppIcon name="back" />
    </button>
    <h1>{{ title }}</h1>
    <slot />
  </header>
</template>
