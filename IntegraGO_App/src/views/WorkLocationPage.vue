<script setup lang="ts">
import { useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import AppHeader from "@/components/AppHeader.vue";
import WorkLocationForm from "@/components/WorkLocationForm.vue";
import { signOut } from "@/services/session";

const router = useRouter();

function back() {
  signOut();
  void router.replace("/login");
}
</script>

<template>
  <AppShell :tabs="false" page-class="work-location-page">
    <AppHeader title="Ubicación de trabajo" back-label="Volver al inicio de sesión" @back="back" />
    <WorkLocationForm submit-label="Continuar" @saved="router.replace('/home')" />
  </AppShell>
</template>

<style>
.work-location-page .page-container {
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
