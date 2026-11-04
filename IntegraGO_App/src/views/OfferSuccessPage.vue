<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import AppIcon from "@/components/AppIcon.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import ClientOfferPass from "@/components/ClientOfferPass.vue";
import { useOfferList } from "@/composables/useOfferList";
import { matchesSellerReference } from "@/services/offers";
const router = useRouter();
const route = useRoute();
const { items, loading, error } = useOfferList();
const offer = computed(() =>
  items.value.find((item) => matchesSellerReference(item, route.params.reference)),
);
const feedback = ref("");
async function copy() {
  if (!offer.value) return;
  try {
    await navigator.clipboard.writeText(offer.value.sellerReference);
    feedback.value = "Folio de seguimiento copiado.";
  } catch {
    feedback.value =
      "No se pudo copiar. Puedes seleccionar el folio para copiarlo manualmente.";
  }
}
</script>
<template>
  <AppShell :tabs="false">
    <button
      class="icon-button"
      aria-label="Finalizar y volver al inicio"
      @click="router.replace('/home')"
    >
      <AppIcon name="close" />
    </button>
    <ListSkeleton v-if="loading" />
    <p v-else-if="error" role="alert" class="notice notice-error">
      {{ error }}
    </p>
    <section v-else-if="offer" class="success-content seller-confirmation">
      <div class="success-symbol"><AppIcon name="check" :size="40" /></div>
      <h1>Oferta generada</h1>
      <p class="success-description">
        Tu oferta quedó registrada. Usa este folio para consultar su
        seguimiento.
      </p>
      <div class="folio-code">
        <div>
          <span>Tu folio de seguimiento</span>
          <strong>{{ offer.sellerReference }}</strong>
        </div>
        <button
          class="icon-button"
          aria-label="Copiar folio de seguimiento"
          @click="copy"
        >
          <AppIcon name="copy" :size="20" />
        </button>
      </div>
      <p class="seller-reference-note">
        Esta referencia es de uso interno del vendedor. No sirve para canjear ni
        validar la oferta.
      </p>
      <div class="success-actions">
        <ClientOfferPass v-if="offer.status === 'active'" :seller-reference="offer.sellerReference" />
        <button class="button button-secondary" @click="router.replace('/home')">
          Finalizar
        </button>
      </div>
      <p v-if="feedback" class="feedback-message" role="status">
        {{ feedback }}
      </p>
      <p v-if="offer.status === 'active'" class="demo-note">
        {{ offer.client.email ? "El cliente dejó correo. El envío por correo aún está pendiente." : "El cliente no dejó correo." }}
        Usa «Mostrar al cliente» para que pueda fotografiar su QR o anotar su folio.
      </p>
    </section>
    <div v-else class="empty-state">
      <h2>Folio no encontrado</h2>
      <p>Revisa tus folios de seguimiento guardados en este dispositivo.</p>
      <button class="text-button" @click="router.replace('/folios')">
        Ir a Folios
      </button>
    </div>
  </AppShell>
</template>
<style scoped>
.seller-confirmation {
  padding-top: 36px;
}
.seller-confirmation .folio-code {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  text-align: center;
  margin-top: 32px;
  padding: 20px 16px;
  border: 1px solid var(--border);
}
.seller-confirmation .folio-code > div {
  grid-column: 2;
}
.seller-confirmation .success-actions {
  flex-direction: column;
}
.seller-reference-note {
  max-width: 300px;
  margin: 16px auto 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}
</style>
