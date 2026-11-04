<script setup lang="ts">
import { computed, ref } from "vue";
import AppShell from "@/components/AppShell.vue";
import AppHeader from "@/components/AppHeader.vue";
import AppIcon from "@/components/AppIcon.vue";
import FolioListItem from "@/components/FolioListItem.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import { useOfferList } from "@/composables/useOfferList";
import { statusLabels } from "@/services/offers";
import { filterOffers } from "@/utils/filterOffers";
import type { OfferFilter } from "@/utils/filterOffers";

const { items, loading, error, refresh } = useOfferList();
const search = ref("");
const filter = ref<OfferFilter>("all");
const filters = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
] as { value: OfferFilter; label: string }[];
const filtered = computed(() =>
  filterOffers(items.value, search.value, filter.value),
);
</script>
<template>
  <AppShell>
    <AppHeader title="Folios" />
    <div class="field-control search-field">
      <AppIcon name="search" :size="20" />
      <input
        v-model="search"
        type="search"
        aria-label="Buscar por folio, nombre o teléfono"
        placeholder="Buscar folio, nombre o teléfono"
      />
      <button
        v-if="search"
        type="button"
        class="icon-button"
        aria-label="Limpiar búsqueda de folios"
        @click="search = ''"
      >
        <AppIcon name="close" :size="18" />
      </button>
    </div>
    <div class="filter-list" role="group" aria-label="Filtrar por estado">
      <button
        v-for="item in filters"
        :key="item.value"
        :class="{ selected: filter === item.value }"
        :aria-pressed="filter === item.value"
        @click="filter = item.value"
      >
        {{ item.label }}
      </button>
    </div>
    <p v-if="error" class="notice notice-error" role="alert">
      {{ error }}
      <button class="text-button" @click="refresh">Reintentar</button>
    </p>
    <ListSkeleton v-if="loading" />
    <template v-else>
      <div v-if="filtered.length" class="folio-list">
        <FolioListItem
          v-for="offer in filtered"
          :key="offer.sellerReference"
          :offer="offer"
        />
      </div>
      <div v-else-if="!error" class="empty-state">
        <AppIcon name="search" :size="36" />
        <h2>Sin folios por aquí</h2>
        <p>
          {{
            search || filter !== "all"
              ? "Prueba con otra búsqueda o cambia el filtro."
              : "Tus nuevas ofertas aparecerán en esta lista."
          }}
        </p>
        <button
          v-if="search || filter !== 'all'"
          class="text-button"
          @click="
            search = '';
            filter = 'all';
          "
        >
          Limpiar filtros
        </button>
      </div>
      <p class="demo-note" role="status">
        {{ filtered.length }} {{ filtered.length === 1 ? "folio" : "folios" }} ·
        datos de demostración locales
      </p>
    </template>
  </AppShell>
</template>
