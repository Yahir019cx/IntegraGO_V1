<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { IonModal } from "@ionic/vue";
import { toDataURL } from "qrcode";
import { clientReferenceFor } from "@/services/offers";
import { session } from "@/services/session";

const props = defineProps<{ sellerReference: string }>();
const titleId = useId();
const open = ref(false);
const printStarted = ref(false);
const trigger = ref<HTMLButtonElement>();
const qr = ref("");
const qrError = ref(false);
const reference = computed(() => session.value &&
  clientReferenceFor(session.value, props.sellerReference));

async function showPass() {
  if (!reference.value) return;
  qr.value = "";
  qrError.value = false;
  printStarted.value = false;
  open.value = true;
  try {
    qr.value = await toDataURL(`integrago:${reference.value}`, {
      errorCorrectionLevel: "M",
      width: 240,
    });
  } catch {
    qrError.value = true;
  }
}
</script>

<template>
  <button ref="trigger" type="button" class="button button-primary button-block"
    aria-haspopup="dialog" @click="showPass">
    Mostrar al cliente
  </button>
  <IonModal :is-open="open" class="client-pass-modal" :aria-labelledby="titleId"
    @didPresent="printStarted = true"
    @didDismiss="open = false; trigger?.focus()">
    <section class="client-pass">
      <h2 :id="titleId">Tu folio de oferta</h2>
      <p>Toma una foto de esta pantalla o anota el folio.</p>
      <div class="client-pass-print-window">
        <div class="reservation-ticket client-pass-paper" :class="{ 'is-printing': printStarted }">
          <div v-if="!qrError" class="client-pass-qr" :aria-busy="!qr">
            <img v-if="qr" :src="qr" width="240" height="240" alt="QR de tu oferta" />
          </div>
          <p v-else role="status">Puedes usar el folio en mostrador.</p>
          <strong class="client-pass-code">{{ reference }}</strong>
          <p>Muestra el código en mostrador junto con tu identificación.</p>
        </div>
      </div>
      <button
        type="button"
        class="button button-secondary button-block client-pass-close"
        :class="{ 'is-closing': !open }"
        @click="open = false"
      >
        Cerrar
      </button>
    </section>
  </IonModal>
</template>

<style>
ion-modal.client-pass-modal {
  --width: min(100%, 440px);
  --height: auto;
  --max-height: 90dvh;
  --border-radius: 24px 24px 0 0;
  align-items: flex-end;
}
.client-pass {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 24px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  text-align: center;
}
.client-pass p {
  color: var(--muted);
}
.client-pass-print-window {
  width: 100%;
  overflow: hidden;
}
.client-pass .client-pass-paper {
  display: grid;
  justify-items: center;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding: 12px 16px 20px;
  visibility: hidden;
}
.client-pass-paper.is-printing {
  visibility: visible;
  animation: client-pass-feed 1050ms cubic-bezier(0.3, 0.65, 0.35, 1) both;
}
.client-pass-close {
  transition: background-color 120ms ease-out, border-color 120ms ease-out, color 120ms ease-out;
}
.client-pass-close:active,
.client-pass-close.is-closing {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--white);
}
.client-pass-qr {
  width: min(184px, 100%);
  aspect-ratio: 1;
}
.client-pass-qr img {
  display: block;
  width: 100%;
  height: auto;
}
@keyframes client-pass-feed {
  from { transform: translateY(105%); }
  to { transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .client-pass-paper.is-printing {
    animation: none;
  }
  .client-pass-close {
    transition: none;
  }
}
.client-pass-code {
  color: var(--text);
  font-size: clamp(32px, 10vw, 44px);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.15em;
  user-select: all;
}
</style>
