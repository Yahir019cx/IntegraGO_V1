<script setup lang="ts">
import { RouterLink } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import { session } from "@/services/session";
</script>
<template>
  <AppShell :tabs="false">
    <div class="empty-state">
      <h1>Página no encontrada</h1>
      <p>Esta dirección no está disponible.</p>
      <RouterLink
        class="button button-primary"
        :to="session ? '/home' : '/login'"
      >
        Volver al inicio
      </RouterLink>
    </div>
  </AppShell>
</template>
