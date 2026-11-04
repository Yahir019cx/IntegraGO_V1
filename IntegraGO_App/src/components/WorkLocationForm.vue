<script setup lang="ts">
import { computed, ref, useId } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { demoBranches, demoRegion, selectWorkLocation } from "@/services/session";

const props = defineProps<{ submitLabel: string; staged?: boolean }>();
const emit = defineEmits<{ saved: [] }>();
const groupId = useId();
const branchCode = ref("");
const branch = computed(() => demoBranches.find(({ code }) => code === branchCode.value));
const counterId = ref("");
const choosingCounter = ref(false);
const hasCounters = computed(() => Boolean(branch.value?.counters.length));
const advanceToCounter = computed(() => props.staged && hasCounters.value && !choosingCounter.value);

function submit() {
  if (advanceToCounter.value) {
    choosingCounter.value = true;
    return;
  }
  if (selectWorkLocation(branchCode.value, counterId.value)) emit("saved");
}
</script>

<template>
  <form class="location-form" @submit.prevent="submit">
    <div class="location-region">
      <span class="location-pin"><AppIcon name="pin" :size="26" /></span>
      <p>Región asignada</p>
      <strong>{{ demoRegion }}</strong>
    </div>
    <fieldset v-if="!choosingCounter">
      <legend>Elige tu sucursal</legend>
      <label v-for="item in demoBranches" :key="item.code" class="location-option">
        <span>{{ item.name }}</span>
        <input v-model="branchCode" type="radio" :name="groupId + '-branch'" :value="item.code" @change="counterId = ''" />
      </label>
    </fieldset>
    <fieldset v-if="branch && hasCounters && (!staged || choosingCounter)" class="location-counters">
      <legend>Elige tu counter</legend>
      <p v-if="choosingCounter" class="location-branch-caption">{{ branch.name }}</p>
      <label v-for="item in branch.counters" :key="item.id" class="location-option">
        <span>{{ item.name }}</span>
        <input v-model="counterId" type="radio" :name="groupId + '-counter'" :value="item.id" />
      </label>
    </fieldset>
    <button class="button button-primary button-block" type="submit"
      :disabled="!branch || (hasCounters && !advanceToCounter && !counterId)">
      {{ advanceToCounter ? "Continuar" : submitLabel }}
    </button>
    <button v-if="choosingCounter" class="text-button" type="button" @click="choosingCounter = false">
      Volver a sucursales
    </button>
  </form>
</template>

<style scoped>
.location-region {
  display: grid;
  justify-items: center;
  gap: 4px;
  text-align: center;
}
.location-pin {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  border-radius: 18px;
  background: var(--primary-soft);
  color: var(--primary);
}
.location-region p {
  color: var(--muted);
  font-size: 12px;
}
.location-region strong {
  font-size: 28px;
  line-height: 1.2;
}
.location-form {
  display: grid;
  gap: 24px;
  width: min(100%, 440px);
  margin: auto;
}
.location-form fieldset {
  display: grid;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.location-form legend {
  padding: 0;
  margin-bottom: 12px;
  font-weight: 600;
}
.location-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
}
.location-option:has(input:checked) {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}
.location-option input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--primary);
}
.location-form .location-counters {
  padding-inline-start: 12px;
  border-inline-start: 2px solid var(--border);
}
.location-branch-caption {
  color: var(--muted);
  font-size: 13px;
}
</style>
