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

export async function saveProfilePhoto(userId: string, source: string) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const crop = Math.min(image.naturalWidth, image.naturalHeight);
  if (!crop) throw new Error("Invalid profile photo");
  const size = Math.min(crop, 640);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas unavailable");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, size, size);
  context.drawImage(
    image, (image.naturalWidth - crop) / 2, (image.naturalHeight - crop) / 2,
    crop, crop, 0, 0, size, size,
  );
  const photo = canvas.toDataURL("image/jpeg", 0.85);
  const key = photoKey.value;
  if (!key || session.value?.id !== userId) return;
  localStorage.setItem(key, photo);
  currentPhoto.value = photo;
}
