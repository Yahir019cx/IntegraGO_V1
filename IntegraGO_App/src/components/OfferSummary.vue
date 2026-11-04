<script setup lang="ts">
import type { Client, Currency } from "@/types";
import { money } from "@/utils/format";

defineProps<{
  client: Client;
  group: string;
  coverage: string;
  pickupAt: string;
  returnAt: string;
  currency: Currency;
  total: number;
}>();
function schedule(value: string, time = false) {
  if (!Number.isFinite(Date.parse(value))) return "Fecha pendiente";
  return new Intl.DateTimeFormat(
    "es-MX",
    time
      ? { hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "short", year: "numeric" },
  ).format(new Date(value));
}
</script>
<template>
  <div class="ticket-details">
    <section class="ticket-section" aria-label="Datos del cliente">
      <h2>Cliente</h2>
      <p class="ticket-client-name">{{ client.name }}</p>
      <dl class="ticket-rows">
        <div>
          <dt>Correo</dt>
          <dd>{{ client.email || "Sin correo" }}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{{ client.phone }}</dd>
        </div>
      </dl>
    </section>
    <section class="ticket-section" aria-label="Detalles de la renta">
      <h2>Datos de la renta</h2>
      <dl class="ticket-rows">
        <div>
          <dt>Vehículo</dt>
          <dd>{{ group }}</dd>
        </div>
        <div>
          <dt>Cobertura</dt>
          <dd>{{ coverage }}</dd>
        </div>
      </dl>
      <dl class="ticket-rows ticket-dates">
        <div>
          <dt>Entrega</dt>
          <dd>
            <time :datetime="pickupAt">
              {{ schedule(pickupAt) }}
              <span>{{ schedule(pickupAt, true) }}</span>
            </time>
          </dd>
        </div>
        <div>
          <dt>Devolución</dt>
          <dd>
            <time :datetime="returnAt">
              {{ schedule(returnAt) }}
              <span>{{ schedule(returnAt, true) }}</span>
            </time>
          </dd>
        </div>
      </dl>
    </section>
    <section class="ticket-total" aria-label="Precio total de la oferta">
      <div class="ticket-total-line">
        <h2>Total ofrecido</h2>
        <strong>
          {{ money(total, currency) }}
          <span>{{ currency }}</span>
        </strong>
      </div>
      <p>Incluye impuestos y cobertura</p>
    </section>
  </div>
</template>
<style scoped>
.ticket-section {
  padding: 24px 0;
  border-bottom: 1px dashed #d5dce5;
}
.ticket-section h2 {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.ticket-client-name {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.3px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.ticket-rows {
  margin: 0;
  display: grid;
  gap: 12px;
}
.ticket-rows > div {
  display: grid;
  grid-template-columns: minmax(72px, 0.7fr) minmax(0, 1.5fr);
  align-items: baseline;
  gap: 12px;
}
.ticket-rows dt {
  color: var(--muted);
  font-size: 12px;
}
.ticket-rows dd {
  margin: 0;
  color: var(--text);
  font-size: 13px;
  text-align: right;
  overflow-wrap: anywhere;
}
.ticket-dates {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #edf0f4;
  gap: 16px;
}
.ticket-dates time {
  display: block;
  font-weight: 500;
}
.ticket-dates time span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 400;
  margin-top: 3px;
}
.ticket-total {
  padding-top: 24px;
}
.ticket-total-line {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}
.ticket-total-line h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.ticket-total-line strong {
  font-size: 26px;
  line-height: 1.25;
  font-weight: 650;
  letter-spacing: -0.8px;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.ticket-total-line strong span {
  display: block;
  margin-top: 4px;
  text-align: right;
  font-size: 11px;
  letter-spacing: 0.7px;
  font-weight: 500;
  color: var(--muted);
}
.ticket-total > p {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 11px;
}
</style>
