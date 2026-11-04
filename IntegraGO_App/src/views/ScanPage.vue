<script setup lang="ts">
import { computed, ref } from "vue";
import jsQR from "jsqr";
import AppShell from "@/components/AppShell.vue";
import AppHeader from "@/components/AppHeader.vue";
import { lookupClientOffer, redeemClientOffer, statusLabels } from "@/services/offers";
import { session } from "@/services/session";
import { dateTime } from "@/utils/format";
import { isOfferReference, normalizeOfferReference } from "@/utils/offerReference";

const code = ref("");
const photoInput = ref<HTMLInputElement>();
const match = ref<ReturnType<typeof lookupClientOffer>>();
const identityChecked = ref(false);
const reading = ref(false);
const redeeming = ref(false);
const error = ref("");
const redeemed = ref(false);
const available = computed(() => match.value?.status === "active");
const normalizedCode = computed(() => normalizeOfferReference(code.value));

function resetResult() {
  match.value = undefined;
  identityChecked.value = false;
  redeemed.value = false;
  error.value = "";
}

function lookup() {
  resetResult();
  const user = session.value;
  if (!user || !isOfferReference(normalizedCode.value)) return;
  code.value = normalizedCode.value;
  try {
    match.value = lookupClientOffer(user, code.value);
    if (!match.value) error.value = "No encontramos ese folio de cliente en esta sucursal.";
  } catch {
    error.value = "No se pudo consultar el folio. Intenta de nuevo.";
  }
}

async function readPhoto(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  resetResult();
  reading.value = true;
  try {
    const image = await createImageBitmap(file);
    try {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(pixels.data, pixels.width, pixels.height);
      const reference = result?.data.startsWith("integrago:")
        ? result.data.slice("integrago:".length)
        : undefined;
      if (!isOfferReference(reference)) throw new Error("Invalid QR");
      code.value = reference;
      lookup();
    } finally {
      image.close();
    }
  } catch {
    error.value = "No pudimos leer el QR. Captura el folio o intenta con otra foto.";
  } finally {
    reading.value = false;
  }
}

async function redeem() {
  const user = session.value;
  if (!user || !identityChecked.value || !available.value || redeeming.value) return;
  redeeming.value = true;
  error.value = "";
  try {
    await redeemClientOffer(user, code.value);
    match.value = undefined;
    redeemed.value = true;
  } catch {
    lookup();
    error.value = "No se pudo registrar el canje. Revisa el estado del folio.";
  } finally {
    redeeming.value = false;
  }
}
</script>
<template>
  <AppShell>
    <AppHeader title="Escanear" />
    <section class="counter-lookup">
      <h2>Buscar oferta del cliente</h2>
      <p>Selecciona una foto del QR o captura el folio del cliente.</p>
      <input ref="photoInput" type="file" accept="image/*" hidden @change="readPhoto" />
      <button type="button" class="button button-secondary button-block" :disabled="reading || redeeming"
        @click="photoInput?.click()">
        {{ reading ? "Leyendo QR…" : "Leer QR de una foto" }}
      </button>
      <form class="counter-lookup" @submit.prevent="lookup">
        <label for="counter-code">Folio del cliente</label>
        <div class="field-control">
          <input id="counter-code" v-model.trim="code" type="text" placeholder="ABC-7K2"
            maxlength="7" autocapitalize="characters" autocomplete="off" spellcheck="false"
            :disabled="reading || redeeming" @input="resetResult" />
        </div>
        <button class="button button-primary button-block" :disabled="!isOfferReference(normalizedCode) || reading || redeeming">
          Buscar folio
        </button>
      </form>
      <p v-if="error" class="notice notice-error" role="alert">{{ error }}</p>
      <p v-if="redeemed" class="notice" role="status">Canje registrado.</p>
      <section v-if="match" class="counter-lookup" aria-label="Resultado de la búsqueda">
        <h3>{{ match.name }}</h3>
        <p>Entrega {{ dateTime(match.pickupAt) }}</p>
        <p>{{ statusLabels[match.status] }}</p>
        <template v-if="available">
          <label class="identity-check">
            <input v-model="identityChecked" type="checkbox" :disabled="redeeming" />
            Verifiqué que la identificación coincide con el titular de la oferta.
          </label>
          <button type="button" class="button button-primary button-block"
            :disabled="!identityChecked || redeeming" @click="redeem">
            Registrar canje
          </button>
        </template>
      </section>
    </section>
  </AppShell>
</template>
<style scoped>
.counter-lookup {
  display: grid;
  gap: 12px;
}
.counter-lookup form,
.counter-lookup section {
  margin-top: 12px;
}
.identity-check {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}
</style>
