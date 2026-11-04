<script setup lang="ts">
import type { Brand } from "@/types";
import avis from "@/assets/BRANDS/AVIS_L.png";
import budget from "@/assets/BRANDS/BUDGET_L.png";
import payless from "@/assets/BRANDS/Payless_L.png";
defineProps<{ brand: Brand }>();
const logos: Record<Brand, string> = {
  AVIS: avis,
  Budget: budget,
  Payless: payless,
};
</script>
<template><img class="brand-logo" :src="logos[brand]" :alt="brand" /></template>
