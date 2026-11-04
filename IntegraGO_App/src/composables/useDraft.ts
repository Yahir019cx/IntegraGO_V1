import { reactive } from "vue";
import type { Offer, OfferDraft } from "@/types";
import { localDateTime } from "@/utils/dateTimePicker";

function emptyDraft(): OfferDraft {
  return {
    client: { name: "", email: "", phone: "" },
    groupId: "",
    coverageId: "",
    pickupAt: "",
    returnAt: "",
    total: "",
  };
}
export const draft = reactive<OfferDraft>(emptyDraft());
export function resetDraft() {
  Object.assign(draft, emptyDraft());
}
export function reuseOfferDraft(offer: Offer) {
  const now = Date.now();
  const futureDateTime = (value: string) => {
    const date = new Date(value);
    return date.getTime() > now ? localDateTime(date) : "";
  };
  Object.assign(draft, {
    client: { ...offer.client, phone: offer.client.phone.replace(/\D/g, "") },
    groupId: offer.group.id,
    coverageId: offer.coverage.id,
    pickupAt: futureDateTime(offer.pickupAt),
    returnAt: futureDateTime(offer.returnAt),
    total: offer.currency === "MXN" ? String(offer.total) : "",
  } satisfies OfferDraft);
}
