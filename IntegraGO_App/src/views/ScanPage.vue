<script setup lang="ts">
import AppShell from "@/components/AppShell.vue";
import AppHeader from "@/components/AppHeader.vue";
import AppIcon from "@/components/AppIcon.vue";
</script>
<template>
  <AppShell>
    <AppHeader title="Escanear" />
    <div class="empty-state">
      <AppIcon name="scan" :size="40" />
      <h2>Escaneo pendiente</h2>
      <p>
        La lectura de códigos QR para mostrador se implementará en una próxima
        fase.
      </p>
    </div>
  </AppShell>
</template>
