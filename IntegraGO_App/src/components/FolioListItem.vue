<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { Offer } from "@/types";
import { relativeTime } from "@/utils/format";
import StatusBadge from "./StatusBadge.vue";
import AppIcon from "./AppIcon.vue";
defineProps<{ offer: Offer }>();
</script>
<template>
  <RouterLink :to="`/folios/${offer.sellerReference}`" class="folio-item">
    <AppIcon name="user" />
    <div class="folio-person">
      <strong>{{ offer.sellerReference }}</strong>
      <span>{{ offer.client.name }}</span>
    </div>
    <div class="folio-meta">
      <time :datetime="offer.createdAt">
        {{ relativeTime(offer.createdAt) }}
      </time>
      <StatusBadge :status="offer.status" />
    </div>
    <AppIcon name="arrow" :size="16" />
  </RouterLink>
</template>
