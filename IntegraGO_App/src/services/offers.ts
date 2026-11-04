import { shallowRef } from "vue";
import type { Brand, Offer, OfferDraft, OfferStatus, User } from "@/types";
import { getCatalogs } from "./catalogs";
import { validateClient, validateOffer } from "@/utils/validation";
import { isOfferReference } from "@/utils/offerReference";
import { pickupMinimum } from "@/utils/dateTimePicker";

type StoredOffer = Offer & { id: string; clientReference: string; previousSellerReference?: string };
const legacyStatuses = {
  generated: "active",
  presented: "active",
  "not-converted": "expired",
} as const;
type LegacyOffer = Omit<StoredOffer, "sellerReference" | "clientReference" | "status"> & {
  sellerReference?: string;
  clientReference?: string;
  status: OfferStatus | keyof typeof legacyStatuses;
};
const KEY = "integrago.demo-offers.v1";
const offers = shallowRef<StoredOffer[]>([]);
export const statusLabels: Record<OfferStatus, string> = {
  active: "Activa",
  converted: "Canjeada",
  expired: "Vencida",
};
const prefixes: Record<Brand, string> = {
  AVIS: "AVI",
  Budget: "BUD",
  Payless: "PAY",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function hasStrings(value: unknown, keys: string[]): boolean {
  return isRecord(value) && keys.every((key) => typeof value[key] === "string");
}
function isOffer(value: unknown): value is LegacyOffer {
  if (!isRecord(value)) return false;
  return (
    hasStrings(value, ["id", "ownerId", "pickupAt", "returnAt", "createdAt"]) &&
    typeof value.brand === "string" &&
    Object.hasOwn(prefixes, value.brand) &&
    typeof value.status === "string" &&
    (Object.hasOwn(statusLabels, value.status) || Object.hasOwn(legacyStatuses, value.status)) &&
    (value.currency === "MXN" || value.currency === "USD") &&
    typeof value.total === "number" &&
    Number.isFinite(value.total) &&
    value.total > 0 &&
    hasStrings(value.client, ["name", "email", "phone"]) &&
    hasStrings(value.airport, ["code", "name"]) &&
    hasStrings(value.group, ["id", "name"]) &&
    hasStrings(value.coverage, ["id", "name"]) &&
    ["pickupAt", "returnAt", "createdAt"].every((key) =>
      Number.isFinite(Date.parse(String(value[key]))),
    )
  );
}
function readStored(): StoredOffer[] | null {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isOffer))
    throw new Error(
      "Los datos locales de prueba no son válidos. Revisa el almacenamiento del navegador.",
    );
  const reserved = new Set<string>();
  for (const item of parsed) {
    for (const reference of [item.sellerReference, item.clientReference]) {
      if (isOfferReference(reference)) reserved.add(reference);
    }
  }
  const claimed = new Set<string>();
  function migrateReference(reference: string | undefined) {
    if (isOfferReference(reference) && !claimed.has(reference)) {
      claimed.add(reference);
      return reference;
    }
    return allocateReference(reserved);
  }
  let migrated = false;
  const records = parsed.map((item) => {
    const status = item.status === "generated" || item.status === "presented" || item.status === "not-converted"
      ? legacyStatuses[item.status]
      : item.status;
    const sellerReference = migrateReference(item.sellerReference);
    const clientReference = migrateReference(item.clientReference);
    const previousSellerReference =
      typeof item.sellerReference === "string" && !isOfferReference(item.sellerReference)
        ? item.sellerReference
        : item.previousSellerReference;
    if (status !== item.status || sellerReference !== item.sellerReference || clientReference !== item.clientReference) migrated = true;
    return {
      ...item,
      status,
      sellerReference,
      clientReference,
      ...(previousSellerReference ? { previousSellerReference } : {}),
    };
  });
  if (migrated) localStorage.setItem(KEY, JSON.stringify(records));
  return records;
}
function belongsToUser(offer: StoredOffer, user: User) {
  return offer.ownerId === user.id && offer.brand === user.brand &&
    offer.airport.code === user.airport.code;
}

function seed(user: User, existing: StoredOffer[]): StoredOffer[] {
  const { groups, coverages } = getCatalogs(user.brand);
  const group = groups[0];
  const coverage = coverages[0];
  if (!group || !coverage) return [];
  const statuses: OfferStatus[] = ["active", "converted", "expired"];
  const used = new Set(existing.flatMap((item) => [item.sellerReference, item.clientReference]));
  return statuses.map((status, index) => {
    const created = new Date(Date.now() - (index * 65 + 12) * 60_000);
    const pickup = new Date(pickupMinimum());
    pickup.setDate(pickup.getDate() + (status === "expired" ? -3 : 1));
    const dropoff = new Date(pickup);
    dropoff.setDate(dropoff.getDate() + 2);
    return {
      id: `${prefixes[user.brand]}-EXAMPLE-${crypto.randomUUID()}`,
      sellerReference: allocateReference(used),
      clientReference: allocateReference(used),
      ownerId: user.id,
      brand: user.brand,
      airport: { ...user.airport },
      client: {
        name:
          [
            "Andrea Ejemplo",
            "Daniel Prueba",
            "María Demo",
          ][index] ?? "Cliente Demo",
        email: `cliente${index}@example.com`,
        phone: `555000000${index}`,
      },
      group,
      coverage,
      pickupAt: pickup.toISOString(),
      returnAt: dropoff.toISOString(),
      currency: "MXN",
      total: 3250 + index * 200,
      status,
      createdAt: created.toISOString(),
    };
  });
}
function withExamples(user: User, stored: StoredOffer[]): StoredOffer[] {
  const hasExamples = stored.some((offer) => belongsToUser(offer, user) &&
    (offer.id.includes("-EXAMPLE-") || /^[A-Z]{3}-DEMO-10(?:44|45|46|47|48)$/.test(offer.id)));
  return hasExamples ? stored : [...stored, ...seed(user, stored)];
}
function writeStored(data: StoredOffer[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
  offers.value = data;
}
async function updateStored<T>(operation: () => T): Promise<T> {
  return globalThis.window?.navigator.locks
    ? window.navigator.locks.request(KEY, operation)
    : operation();
}
export async function loadOffers(user: User) {
  try {
    await updateStored(() => {
      const stored = readStored() ?? [];
      const data = withExamples(user, stored);
      if (data !== stored) writeStored(data);
      else offers.value = stored;
    });
  } catch {
    throw new Error(
      "No se pudieron leer los folios locales. Revisa el almacenamiento de este navegador.",
    );
  }
}
export function userOffers(user: User): Offer[] {
  return offers.value
    .filter((offer) => belongsToUser(offer, user))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(sellerOffer);
}
export function createOffer(draft: OfferDraft, user: User): Promise<Offer> {
  return updateStored(() => saveOffer(draft, user));
}

function saveOffer(draft: OfferDraft, user: User): Offer {
  if (
    Object.keys(validateClient(draft.client)).length ||
    Object.keys(validateOffer(draft)).length
  )
    throw new Error("Revisa los datos del cliente y de la oferta.");
  const { groups, coverages } = getCatalogs(user.brand);
  const group = groups.find((item) => item.id === draft.groupId);
  const coverage = coverages.find((item) => item.id === draft.coverageId);
  if (!group || !coverage)
    throw new Error("Selecciona un grupo y una cobertura de tu marca.");
  const all = withExamples(user, readStored() ?? []);
  const used = new Set(all.flatMap((item) => [item.sellerReference, item.clientReference]));
  let id: string;
  do {
    id = `${prefixes[user.brand]}-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  } while (all.some((offer) => offer.id === id));
  const offer: StoredOffer = {
    id,
    sellerReference: allocateReference(used),
    clientReference: allocateReference(used),
    ownerId: user.id,
    brand: user.brand,
    airport: { ...user.airport },
    client: {
      name: draft.client.name.trim(),
      email: draft.client.email.trim(),
      phone: draft.client.phone.trim(),
    },
    group,
    coverage,
    pickupAt: new Date(draft.pickupAt).toISOString(),
    returnAt: new Date(draft.returnAt).toISOString(),
    currency: "MXN",
    total: Number(draft.total),
    status: "active",
    createdAt: new Date().toISOString(),
  };
  try {
    writeStored([offer, ...all]);
  } catch {
    throw new Error(
      "No se pudo guardar la oferta localmente. Libera espacio o habilita el almacenamiento e intenta de nuevo.",
    );
  }
  return sellerOffer(offer);
}

function allocateReference(used: Set<string>): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const alphanumeric = letters + "23456789";
  const suffixSpace = alphanumeric.length ** 3;
  const space = letters.length ** 3 * suffixSpace;
  const encode = (number: number, alphabet: string) =>
    [2, 1, 0].map((place) => alphabet.charAt(
      Math.floor(number / alphabet.length ** place) % alphabet.length,
    )).join("");
  const format = (number: number) =>
    `${encode(Math.floor(number / suffixSpace), letters)}-${encode(number % suffixSpace, alphanumeric)}`;
  if (used.size >= space) throw new Error("No quedan folios disponibles.");
  let number = crypto.getRandomValues(new Uint32Array(1))[0]! % space;
  let reference = format(number);
  while (used.has(reference)) {
    number = (number + 1) % space;
    reference = format(number);
  }
  used.add(reference);
  return reference;
}

export function matchesSellerReference(offer: Offer, reference: unknown): boolean {
  if (offer.sellerReference === reference) return true;
  return typeof reference === "string" && !isOfferReference(reference) &&
    offers.value.some((item) => item.sellerReference === offer.sellerReference &&
      item.previousSellerReference === reference);
}

export function clientReferenceFor(user: User, sellerReference: string): string | undefined {
  return offers.value.find((item) =>
    item.status === "active" && item.sellerReference === sellerReference && item.ownerId === user.id &&
    item.brand === user.brand && item.airport.code === user.airport.code
  )?.clientReference;
}

function counterOffer(user: User, reference: string, records: StoredOffer[]) {
  return records.find((item) =>
    user.role === "counter" && item.clientReference === reference &&
    item.brand === user.brand && item.airport.code === user.airport.code
  );
}

export function lookupClientOffer(user: User, reference: string) {
  const item = counterOffer(user, reference, readStored() ?? []);
  return item && {
    name: item.client.name,
    pickupAt: item.pickupAt,
    status: item.status,
  };
}

export function redeemClientOffer(user: User, reference: string) {
  return updateStored(() => {
    const all = readStored() ?? [];
    const item = counterOffer(user, reference, all);
    if (!item || item.status !== "active") {
      throw new Error("La oferta ya no está disponible para canje.");
    }
    writeStored(all.map((record) => record === item ? { ...record, status: "converted" } : record));
  });
}
// Proyección explícita: las vistas del vendedor no reciben el identificador interno.
function sellerOffer(record: StoredOffer): Offer {
  return {
    sellerReference: record.sellerReference,
    ownerId: record.ownerId,
    brand: record.brand,
    airport: { ...record.airport },
    client: { ...record.client },
    group: { ...record.group },
    coverage: { ...record.coverage },
    pickupAt: record.pickupAt,
    returnAt: record.returnAt,
    currency: record.currency,
    total: record.total,
    status: record.status,
    createdAt: record.createdAt,
  };
}
