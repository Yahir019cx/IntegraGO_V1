import { computed, readonly, shallowRef, watch } from "vue";
import { session } from "@/services/session";

const photoKey = computed(() => {
  const user = session.value;
  return user ? `integrago.profile-photo.${user.id}` : null;
});
const currentPhoto = shallowRef("");
export const profilePhoto = readonly(currentPhoto);

watch(photoKey, (key) => {
  try {
    currentPhoto.value = key ? localStorage.getItem(key) ?? "" : "";
  } catch {
    currentPhoto.value = "";
  }
}, { immediate: true, flush: "sync" });

export function saveProfilePhoto(userId: string, photo: string) {
  const key = photoKey.value;
  if (!key || session.value?.id !== userId) return;
  localStorage.setItem(key, photo);
  currentPhoto.value = photo;
}
