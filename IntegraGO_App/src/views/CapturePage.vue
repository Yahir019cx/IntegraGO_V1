<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import AppHeader from "@/components/AppHeader.vue";
import AppIcon from "@/components/AppIcon.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import ClientStep from "./capture/ClientStep.vue";
import OfferStep from "./capture/OfferStep.vue";
import OfferSummary from "@/components/OfferSummary.vue";
import { draft, resetDraft } from "@/composables/useDraft";
import { validateClient, validateOffer } from "@/utils/validation";
import { getCatalogs } from "@/services/catalogs";
import { session } from "@/services/session";
import { createOffer } from "@/services/offers";

const route = useRoute();
const router = useRouter();
const step = computed(() =>
  route.query.step === "2" ? 2 : route.query.step === "3" ? 3 : 1,
);
const stepProgress = computed(() => {
  const clientStep = step.value === 1;
  const pending = clientStep ? validateClient(draft.client) : validateOffer(draft);
  const fieldCount = clientStep ? 2 + Number(Boolean(draft.client.email.trim())) : 5;
  return Math.round((1 - Object.keys(pending).length / fieldCount) * 100);
});
const catalogs = computed(() => getCatalogs(session.value?.brand ?? "Budget"));
const errors = ref<Record<string, string>>({});
const saving = ref(false);
const saveError = ref("");
const form = ref<HTMLFormElement>();
const shell = ref<InstanceType<typeof AppShell>>();
watch(step, async () => {
  await nextTick();
  shell.value?.scrollToTop();
});
const groupName = computed(
  () =>
    catalogs.value.groups.find((group) => group.id === draft.groupId)?.name ??
    "",
);
const coverageName = computed(
  () =>
    catalogs.value.coverages.find(
      (coverage) => coverage.id === draft.coverageId,
    )?.name ?? "",
);
async function goTo(value: number) {
  errors.value = {};
  saveError.value = "";
  await router.push({ path: "/capture", query: { step: value } });
}
function back() {
  if (step.value > 1) void goTo(step.value - 1);
  else void router.push("/home");
}
async function focusError() {
  await nextTick();
  form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}
async function advance() {
  errors.value =
    step.value === 1 ? validateClient(draft.client) : validateOffer(draft);
  if (Object.keys(errors.value).length) {
    await focusError();
    return;
  }
  await goTo(step.value + 1);
}
async function generate() {
  if (saving.value || !session.value) return;
  const clientErrors = validateClient(draft.client);
  const offerErrors = validateOffer(draft);
  if (Object.keys(clientErrors).length) {
    await goTo(1);
    errors.value = clientErrors;
    await focusError();
    return;
  }
  if (Object.keys(offerErrors).length) {
    await goTo(2);
    errors.value = offerErrors;
    await focusError();
    return;
  }
  saving.value = true;
  saveError.value = "";
  try {
    const offer = await createOffer(draft, session.value);
    resetDraft();
    await router.replace(`/offers/${offer.sellerReference}/success`);
  } catch (cause) {
    saveError.value =
      cause instanceof Error
        ? cause.message
        : "No fue posible generar la oferta.";
  } finally {
    saving.value = false;
  }
}
</script>
<template>
  <AppShell ref="shell" :tabs="false">
    <AppHeader title="Nueva oferta" back-label="Volver" @back="back" />
    <ol class="stepper" aria-label="Pasos de nueva oferta">
      <li
        v-for="(label, index) in ['Cliente', 'Oferta', 'Resumen']"
        :key="label"
        :class="{ current: step === index + 1, complete: step > index + 1 }"
        :aria-current="step === index + 1 ? 'step' : undefined"
      >
        <span class="step-number">
          <AppIcon v-if="step > index + 1" name="check" :size="17" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span>{{ label }}</span>
      </li>
    </ol>
    <form
      ref="form"
      novalidate
      class="wizard-form"
      @submit.prevent="step === 3 ? generate() : advance()"
    >
      <div class="form-body">
        <div v-if="step < 3" class="capture-form-panel" :class="{ 'capture-offer-panel': step === 2 }">
          <div
            class="capture-form-progress"
            role="progressbar"
            aria-label="Progreso del formulario"
            :aria-valuenow="stepProgress"
            :style="{ '--capture-progress': stepProgress / 100 }"
          />
          <ClientStep
            v-if="step === 1"
            :errors="errors"
            @clear-error="delete errors[$event]"
          />
          <OfferStep
            v-else
            :errors="errors"
            :catalogs="catalogs"
            @clear-error="delete errors[$event]"
          />
        </div>
        <template v-else>
          <h2>Revisa tu oferta</h2>
          <article v-if="session && draft.pickupAt && draft.returnAt"
            class="reservation-ticket" aria-label="Resumen de la oferta">
            <header class="ticket-header ticket-brand-line">
              <BrandLogo :brand="session.brand" />
              <span>{{ session.airport.code }}</span>
            </header>
            <OfferSummary
              :client="draft.client"
              :group="groupName"
              :coverage="coverageName"
              :pickup-at="draft.pickupAt"
              :return-at="draft.returnAt"
              currency="MXN"
              :total="Number(draft.total)"
            />
          </article>
          <p v-else class="notice">
            Completa los pasos anteriores antes de generar tu oferta.
          </p>
          <p v-if="saveError" role="alert" class="notice notice-error">
            {{ saveError }}
          </p>
        </template>
      </div>
      <div class="form-actions">
        <button
          v-if="step > 1"
          class="button button-secondary"
          type="button"
          :disabled="saving"
          @click="back"
        >
          Anterior
        </button>
        <button class="button button-primary" type="submit" :disabled="saving">
          {{
            step === 3
              ? saving
                ? "Guardando…"
                : "Generar oferta"
              : "Continuar"
          }}
        </button>
      </div>
    </form>
  </AppShell>
</template>
<style scoped>
.capture-form-panel {
  position: relative;
  margin-inline: calc(-1 * var(--space));
  padding: 24px var(--space) 20px;
}
.capture-offer-panel :deep(.select-trigger > svg),
.capture-offer-panel :deep(.date-trigger-chevron),
.capture-offer-panel :deep(.field-control > svg) {
  color: var(--primary);
}
.capture-form-progress {
  position: absolute;
  inset-block: 24px;
  inset-inline-start: calc(var(--space) / 2);
  width: 2px;
  background: var(--border);
  pointer-events: none;
}
.capture-form-progress::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--primary);
  transform: scaleY(var(--capture-progress));
  transform-origin: top;
  transition: transform 200ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .capture-form-progress::before {
    transition: none;
  }
}
</style>
