<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import BrandWaves from "@/components/BrandWaves.vue";
import logo from "@/assets/IntegraLogo.png";
import { session } from "@/services/session";
const router = useRouter();
onMounted(() => {
  void router.replace(session.value ? "/home" : "/login");
});
</script>
<template>
  <AppShell :tabs="false" page-class="splash-page">
    <img :src="logo" alt="IntegraGo" class="integra-logo" />
    <BrandWaves />
  </AppShell>
</template>
