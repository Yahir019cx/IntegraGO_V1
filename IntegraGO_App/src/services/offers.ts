import { shallowRef } from "vue";
import type { Brand, Offer, OfferDraft, OfferStatus, User } from "@/types";
import { getCatalogs } from "./catalogs";
import { validateClient, validateOffer } from "@/utils/validation";

type StoredOffer = Offer & { id: string };
type LegacyOffer = Omit<StoredOffer, "sellerReference"> & {
  sellerReference?: string;
};
const KEY = "integrago.demo-offers.v1";
const offers = shallowRef<StoredOffer[]>([]);
export const statusLabels: Record<OfferStatus, string> = {
  generated: "Generado",
  presented: "Presentado",
  converted: "Convertido",
  expired: "Vencido",
  "not-converted": "No convertido",
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
    Object.hasOwn(statusLabels, value.status) &&
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
  const used = new Set(
    parsed
      .map((item) => item.sellerReference)
      .filter((value): value is string => typeof value === "string"),
  );
  let migrated = false;
  const records = parsed.map((item) => {
    if (
      typeof item.sellerReference === "string" &&
      item.sellerReference !== item.id &&
      item.sellerReference.startsWith("SEG-DEMO-")
    )
      return item as StoredOffer;
    migrated = true;
    const sellerReference = newSellerReference(used);
    used.add(sellerReference);
    return { ...item, sellerReference };
  });
  if (migrated) localStorage.setItem(KEY, JSON.stringify(records));
  return records;
}
function seed(user: User): StoredOffer[] {
  const { groups, coverages } = getCatalogs(user.brand);
  const group = groups[0];
  const coverage = coverages[0];
  if (!group || !coverage) return [];
  const statuses: OfferStatus[] = [
    "generated",
    "presented",
    "converted",
    "expired",
    "not-converted",
  ];
  return statuses.map((status, index) => {
    const created = new Date(Date.now() - (index * 65 + 12) * 60_000);
    return {
      id: `${prefixes[user.brand]}-DEMO-${String(1048 - index)}`,
      sellerReference: newSellerReference(),
      ownerId: user.id,
      brand: user.brand,
      airport: { ...user.airport },
      client: {
        name:
          [
            "Andrea Ejemplo",
            "Daniel Prueba",
            "María Demo",
            "Carlos Ejemplo",
            "Sofía Prueba",
          ][index] ?? "Cliente Demo",
        email: `cliente${index}@example.com`,
        phone: `555000000${index}`,
      },
      group,
      coverage,
      pickupAt: new Date(Date.now() + 86_400_000).toISOString(),
      returnAt: new Date(Date.now() + 259_200_000).toISOString(),
      currency: "MXN",
      total: 3250 + index * 200,
      status,
      createdAt: created.toISOString(),
    };
  });
}
function writeStored(data: StoredOffer[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
  offers.value = data;
}
export async function loadOffers(user: User) {
  try {
    const stored = readStored();
    if (stored === null) writeStored(seed(user));
    else offers.value = stored;
  } catch {
    throw new Error(
      "No se pudieron leer los folios locales. Revisa el almacenamiento de este navegador.",
    );
  }
}
export function userOffers(user: User): Offer[] {
  return offers.value
    .filter(
      (offer) =>
        offer.ownerId === user.id &&
        offer.brand === user.brand &&
        offer.airport.code === user.airport.code,
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(sellerOffer);
}
export async function createOffer(
  draft: OfferDraft,
  user: User,
): Promise<Offer> {
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
  const all = readStored() ?? seed(user);
  let id: string;
  do {
    id = `${prefixes[user.brand]}-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  } while (all.some((offer) => offer.id === id));
  const offer: StoredOffer = {
    id,
    sellerReference: newSellerReference(
      new Set(all.map((item) => item.sellerReference)),
    ),
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
    currency: draft.currency,
    total: Number(draft.total),
    status: "generated",
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

function newSellerReference(used = new Set<string>()): string {
  let reference: string;
  do {
    reference = `SEG-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  } while (used.has(reference));
  return reference;
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
