<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import AppIcon from "./AppIcon.vue";
import { session } from "@/services/session";
const keyboardOpen = ref(false);
const viewport = window.visualViewport;
let baseline = viewport?.height ?? window.innerHeight;
function updateKeyboard() {
  const height = viewport?.height ?? window.innerHeight;
  const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(
    document.activeElement?.tagName ?? "",
  );
  if (!editing) baseline = Math.max(baseline, height);
  keyboardOpen.value = editing && baseline - height > 120;
}
onMounted(() => {
  viewport?.addEventListener("resize", updateKeyboard);
  document.addEventListener("focusout", updateKeyboard);
});
onUnmounted(() => {
  viewport?.removeEventListener("resize", updateKeyboard);
  document.removeEventListener("focusout", updateKeyboard);
});
const tabs = computed(() => [
  { to: "/home", icon: "home", label: "Inicio" },
  {
    to: session.value?.role === "counter" ? "/scan" : "/capture",
    icon: session.value?.role === "counter" ? "scan" : "capture",
    label: session.value?.role === "counter" ? "Escanear" : "Captar",
  },
  { to: "/folios", icon: "file", label: "Folios" },
  { to: "/account", icon: "user", label: "Cuenta" },
]);
</script>
<template>
  <nav
    v-show="!keyboardOpen"
    class="floating-tabs"
    aria-label="Navegación principal"
  >
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab-link">
      <span><AppIcon :name="tab.icon" /></span>
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>
