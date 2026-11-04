<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useRoute, useRouter } from "vue-router";
import { IonModal } from "@ionic/vue";
import AppShell from "@/components/AppShell.vue";
import AppHeader from "@/components/AppHeader.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import OfferSummary from "@/components/OfferSummary.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import { useOfferList } from "@/composables/useOfferList";
import { dateTime } from "@/utils/format";
const route = useRoute();
const router = useRouter();
const { items, loading, error, refresh } = useOfferList();
const offer = computed(() =>
  items.value.find((item) => item.sellerReference === route.params.reference),
);
const resendOpen = ref(false);
const resendTrigger = ref<HTMLButtonElement>();
const resendDialogId = useId();
function closeResend() {
  resendOpen.value = false;
  resendTrigger.value?.focus();
}
</script>
<template>
  <AppShell :tabs="false">
    <AppHeader
      title="Detalle del folio"
      back-label="Volver a folios"
      @back="router.push('/folios')"
    />
    <ListSkeleton v-if="loading" />
    <p v-else-if="error" role="alert" class="notice notice-error">
      {{ error }}
      <button class="text-button" @click="refresh">Reintentar</button>
    </p>
    <article
      v-else-if="offer"
      class="reservation-ticket"
      aria-label="Comprobante de seguimiento de oferta"
    >
      <header class="ticket-header">
        <div class="ticket-brand-line">
          <BrandLogo :brand="offer.brand" />
          <span>{{ offer.airport.code }}</span>
        </div>
        <div class="ticket-caption-line">
          <span>Folio de seguimiento</span>
          <StatusBadge :status="offer.status" />
        </div>
        <h2>{{ offer.sellerReference }}</h2>
        <p class="ticket-issued">{{ dateTime(offer.createdAt) }}</p>
      </header>
      <OfferSummary
        :client="offer.client"
        :group="offer.group.name"
        :coverage="offer.coverage.name"
        :pickup-at="offer.pickupAt"
        :return-at="offer.returnAt"
        :currency="offer.currency"
        :total="offer.total"
      />
      <footer class="ticket-footer">
        <button
          ref="resendTrigger"
          type="button"
          class="button button-secondary button-block resend-trigger"
          aria-haspopup="dialog"
          :aria-controls="resendDialogId"
          :aria-expanded="resendOpen"
          @click="resendOpen = true"
        >
          Reenviar QR al cliente
        </button>
        <p>Referencia interna del vendedor</p>
        <p>No válida para canjear la oferta.</p>
        <span>Datos de demostración</span>
      </footer>
      <IonModal
        :id="resendDialogId"
        :is-open="resendOpen"
        class="resend-sheet-modal"
        :aria-labelledby="`${resendDialogId}-title`"
        @didDismiss="closeResend"
      >
        <section class="resend-sheet">
          <div class="resend-sheet-handle" aria-hidden="true" />
          <h2 :id="`${resendDialogId}-title`">Reenviar QR al cliente</h2>
          <dl>
            <dt>Correo registrado</dt>
            <dd>{{ offer.client.email }}</dd>
          </dl>
          <p>
            El envío todavía no está disponible. Cuando se habilite, el QR se
            enviará directamente al correo del cliente.
          </p>
          <button
            type="button"
            class="button button-primary button-block"
            @click="resendOpen = false"
          >
            Entendido
          </button>
        </section>
      </IonModal>
    </article>
    <div v-else class="empty-state">
      <h2>Folio no encontrado</h2>
      <p>Este folio no está disponible en los datos locales de tu sesión.</p>
    </div>
  </AppShell>
</template>
<style scoped>
.reservation-ticket {
  position: relative;
  padding: 24px 20px 28px;
  border: 1px solid #e1e6ed;
  border-top: 3px solid var(--primary);
  background: var(--white);
  box-shadow: 0 4px 12px #172c5005;
  margin-bottom: 12px;
}
.reservation-ticket::after {
  content: "";
  position: absolute;
  left: -1px;
  right: -1px;
  bottom: -7px;
  height: 8px;
  background: #e1e6ed;
  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    95% 0,
    90% 100%,
    85% 0,
    80% 100%,
    75% 0,
    70% 100%,
    65% 0,
    60% 100%,
    55% 0,
    50% 100%,
    45% 0,
    40% 100%,
    35% 0,
    30% 100%,
    25% 0,
    20% 100%,
    15% 0,
    10% 100%,
    5% 0,
    0 100%
  );
}
.ticket-header {
  padding-bottom: 22px;
  border-bottom: 1px dashed #d5dce5;
}
.ticket-brand-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.ticket-brand-line :deep(.brand-logo) {
  width: min(144px, 70%);
  height: 52px;
}
.ticket-brand-line > span {
  font-size: 12px;
  letter-spacing: 1.5px;
  color: var(--muted);
}
.ticket-caption-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.ticket-caption-line > span:first-child {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.ticket-header h2 {
  margin: 10px 0 8px;
  font-size: clamp(15px, 4.5vw, 19px);
  font-weight: 600;
  letter-spacing: 0.2px;
  overflow-wrap: anywhere;
}
.ticket-issued {
  color: var(--muted);
  font-size: 11px;
}
.ticket-footer {
  border-top: 1px dashed #d5dce5;
  margin-top: 24px;
  padding-top: 20px;
  text-align: center;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
.ticket-footer > span {
  display: block;
  margin-top: 12px;
  font-size: 10px;
  letter-spacing: 0.5px;
}
.resend-trigger {
  margin-bottom: 16px;
}
@media (max-width: 360px) {
  .reservation-ticket {
    padding-inline: 16px;
  }
}
</style>
<style>
ion-modal.resend-sheet-modal {
  --width: min(100%, 480px);
  --height: auto;
  --max-height: 85dvh;
  --border-radius: 24px 24px 0 0;
  --backdrop-opacity: 0.24;
  align-items: flex-end;
}
.resend-sheet {
  overflow-y: auto;
  padding: 12px 24px calc(20px + env(safe-area-inset-bottom, 0px));
}
.resend-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 8px;
  background: var(--border);
  margin: 0 auto 20px;
}
.resend-sheet h2 {
  font-size: 19px;
  margin: 0 0 20px;
}
.resend-sheet dl {
  margin: 0 0 16px;
}
.resend-sheet dt {
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 4px;
}
.resend-sheet dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.resend-sheet p {
  color: var(--muted);
  margin-bottom: 24px;
}
@media (min-width: 768px) {
  ion-modal.resend-sheet-modal {
    align-items: center;
    --border-radius: 24px;
  }
}
</style>
