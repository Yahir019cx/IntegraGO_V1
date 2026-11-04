import { computed, ref } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { loadOffers, userOffers } from "@/services/offers";
import { session } from "@/services/session";

export function useOfferList() {
  const loading = ref(true);
  const error = ref("");
  const items = computed(() =>
    session.value ? userOffers(session.value) : [],
  );
  async function refresh() {
    if (!session.value) return;
    loading.value = true;
    error.value = "";
    try {
      await loadOffers(session.value);
    } catch (cause) {
      error.value =
        cause instanceof Error
          ? cause.message
          : "No fue posible cargar los folios.";
    } finally {
      loading.value = false;
    }
  }
  onIonViewWillEnter(refresh);
  return { items, loading, error, refresh };
}
