<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { onIonViewWillEnter } from "@ionic/vue";
import AppShell from "@/components/AppShell.vue";
import AppIcon from "@/components/AppIcon.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import FolioListItem from "@/components/FolioListItem.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import { useOfferList } from "@/composables/useOfferList";
import { session } from "@/services/session";
import { profilePhoto } from "@/services/profilePhoto";
import { roleLabels } from "@/services/catalogs";
import { initials } from "@/utils/format";

const { items, loading, error, refresh } = useOfferList();
const currentHour = ref(new Date().getHours());
const greeting = computed(() => {
  const hour = currentHour.value;
  return hour < 12
    ? "Buenos días,"
    : hour < 19
      ? "Buenas tardes,"
      : "Buenas noches,";
});
const active = computed(
  () =>
    items.value.filter((offer) =>
      offer.status === "active",
    ).length,
);
const converted = computed(
  () => items.value.filter((offer) => offer.status === "converted").length,
);
onIonViewWillEnter(() => {
  currentHour.value = new Date().getHours();
  document.title = "Inicio · IntegraOne";
});
</script>
<template>
  <AppShell>
    <template v-if="session">
      <header>
        <div class="brand-row">
          <BrandLogo :brand="session.brand" />
          <RouterLink to="/account" class="avatar" aria-label="Ver mi cuenta">
            <img v-if="profilePhoto" class="home-profile-photo" :src="profilePhoto" alt="" />
            <template v-else>{{ initials(session.name) }}</template>
          </RouterLink>
        </div>
        <p class="greeting">{{ greeting }}</p>
        <h1>{{ session.name }}</h1>
        <p class="home-role">{{ roleLabels[session.role] }}</p>
        <p class="profile-airport home-airport">
          <AppIcon name="pin" :size="18" aria-hidden="true" />
          <span>{{ [session.airport.name, session.airport.counter].filter(Boolean).join(" · ") }}</span>
          <span class="airport-code">{{ session.airport.code }}</span>
        </p>
      </header>
      <div v-if="error" class="notice notice-error" role="alert">
        {{ error }}
        <button class="text-button" @click="refresh">Reintentar</button>
      </div>
      <section class="stats" aria-label="Resumen de folios">
        <div class="stat">
          <strong>{{ loading ? "—" : active }}</strong>
          <div class="stat-label">
            <AppIcon name="file" :size="14" aria-hidden="true" />
            <span>Folios activos</span>
          </div>
        </div>
        <div class="stat">
          <strong>{{ loading ? "—" : converted }}</strong>
          <div class="stat-label">
            <AppIcon class="stat-converted-icon" name="capture" :size="14" aria-hidden="true" />
            <span>Canjeadas</span>
          </div>
        </div>
      </section>
      <section>
        <div class="section-heading">
          <h2>Actividad reciente</h2>
          <RouterLink to="/folios">Ver todos</RouterLink>
        </div>
        <ListSkeleton v-if="loading" />
        <div v-else-if="items.length" class="folio-list">
          <FolioListItem
            v-for="offer in items.slice(0, 3)"
            :key="offer.sellerReference"
            :offer="offer"
          />
        </div>
        <div v-else-if="!error" class="empty-state">
          <AppIcon name="file" :size="32" />
          <h2>Tu actividad comienza aquí</h2>
          <p>Los folios que generes aparecerán en esta sección.</p>
        </div>
      </section>
    </template>
  </AppShell>
</template>
<style scoped>
.brand-row {
  margin-bottom: 24px;
}
.home-profile-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.home-role {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 14px;
}
.home-airport {
  margin: 16px 0 0;
}
</style>
