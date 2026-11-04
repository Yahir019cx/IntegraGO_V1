import { reactive } from "vue";
import type { OfferDraft } from "@/types";

function emptyDraft(): OfferDraft {
  return {
    client: { name: "", email: "", phone: "" },
    groupId: "",
    coverageId: "",
    pickupAt: "",
    returnAt: "",
    currency: "MXN",
    total: "",
  };
}
export const draft = reactive<OfferDraft>(emptyDraft());
export function resetDraft() {
  Object.assign(draft, emptyDraft());
}
