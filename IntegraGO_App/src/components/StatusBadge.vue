<script setup lang="ts">
import type { OfferStatus } from "@/types";
import { statusLabels } from "@/services/offers";
defineProps<{ status: OfferStatus }>();
</script>
<template>
  <span class="status-badge" :class="`status-${status}`">
    {{ statusLabels[status] }}
  </span>
</template>
