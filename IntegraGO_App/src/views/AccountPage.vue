<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { IonModal, IonSpinner, onIonViewWillLeave } from "@ionic/vue";
import { Camera, CameraDirection } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import AppShell from "@/components/AppShell.vue";
import AppIcon from "@/components/AppIcon.vue";
import WorkLocationForm from "@/components/WorkLocationForm.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import { session, signOut } from "@/services/session";
import { profilePhoto, saveProfilePhoto } from "@/services/profilePhoto";
import { resetDraft } from "@/composables/useDraft";
import { roleLabels } from "@/services/catalogs";
import { initials } from "@/utils/format";

type AccountPanel = "profile" | "branch" | "support" | "about" | "logout";
const router = useRouter();
const panel = ref<AccountPanel | null>(null);
const accountModal = ref<InstanceType<typeof IonModal>>();
const photoError = ref("");
const savingPhoto = ref(false);
const photoInput = ref<HTMLInputElement>();
const photoPickerOpen = ref(false);
const photoTrigger = ref<HTMLButtonElement>();
watch(() => session.value?.id, () => {
  photoError.value = "";
});

async function choosePhoto(source: "camera" | "gallery") {
  const userId = session.value?.id;
  if (!userId || savingPhoto.value) return;
  photoPickerOpen.value = false;
  photoError.value = "";
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("Camera")) {
    const input = photoInput.value;
    if (source === "camera") input?.setAttribute("capture", "user");
    else input?.removeAttribute("capture");
    input?.click();
    return;
  }
  savingPhoto.value = true;
  try {
    const options = { quality: 90, targetWidth: 1280, targetHeight: 1280 };
    const photo = source === "camera"
      ? await Camera.takePhoto({ ...options, cameraDirection: CameraDirection.Front })
      : (await Camera.chooseFromGallery(options)).results[0];
    if (!photo) return;
    const path = photo.webPath ?? (photo.uri ? Capacitor.convertFileSrc(photo.uri) : "");
    if (!path) throw new Error("Missing photo path");
    await saveProfilePhoto(userId, path);
  } catch (cause) {
    const code = typeof cause === "object" && cause !== null && "code" in cause ? cause.code : undefined;
    if (code === "OS-PLUG-CAMR-0003" || code === "OS-PLUG-CAMR-0005") {
      photoError.value = "Revisa los permisos de cámara o fotos en los ajustes del teléfono.";
    } else if (code !== "OS-PLUG-CAMR-0006") {
      photoError.value = "No se pudo guardar la foto. Prueba con otra imagen.";
    }
  } finally {
    savingPhoto.value = false;
  }
}

async function changePhoto(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  const userId = session.value?.id;
  if (!file || !userId || savingPhoto.value) return;
  photoError.value = "";
  savingPhoto.value = true;
  const source = URL.createObjectURL(file);
  try {
    await saveProfilePhoto(userId, source);
  } catch {
    photoError.value = "No se pudo guardar la foto. Prueba con otra imagen.";
  } finally {
    URL.revokeObjectURL(source);
    savingPhoto.value = false;
  }
}
const supportPhone = "524499118991";
const supportTopics = [
  "Ofertas y folios",
  "Envío del QR al cliente",
  "Datos de mi perfil",
];
const whatsappOpen = ref(false);
function supportGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
}
function openWhatsApp(topic?: string) {
  const intro = supportGreeting() + ", les escribo desde IntegraOne.";
  const message = topic ? intro + " Necesito ayuda con " + topic.toLocaleLowerCase("es-MX") + ".\n\nDetalles: " : intro + "\n\nMotivo: ";
  window.open("https://wa.me/" + supportPhone + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
}
const emailFormOpen = ref(false);
const reportViewportStyle = ref<Record<string, string>>({});
const viewport = window.visualViewport;
function updateReportViewport() {
  const hiddenHeight = viewport ? window.innerHeight - viewport.height : 0;
  reportViewportStyle.value = viewport && viewport.scale === 1 && hiddenHeight > 100
    ? {
        "--report-top": `${Math.max(0, viewport.offsetTop)}px`,
        "--report-bottom": `${Math.max(0, hiddenHeight - viewport.offsetTop)}px`,
        "--report-height": `${viewport.height}px`,
        "--report-padding": "12px",
      }
    : {};
}
onMounted(() => {
  viewport?.addEventListener("resize", updateReportViewport);
  viewport?.addEventListener("scroll", updateReportViewport);
});
onUnmounted(() => {
  viewport?.removeEventListener("resize", updateReportViewport);
  viewport?.removeEventListener("scroll", updateReportViewport);
});
const greeting = ref("");
const report = ref("");
const sendingReport = ref(false);
const reportError = ref("");
const reportSent = ref(false);
function openEmailForm() {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  greeting.value = `${salutation}, les contacto desde IntegraOne para solicitar apoyo.`;
  reportError.value = "";
  reportSent.value = false;
  emailFormOpen.value = true;
}
async function sendReport() {
  if (
    !session.value ||
    sendingReport.value ||
    reportSent.value ||
    !report.value.trim()
  )
    return;
  sendingReport.value = true;
  const submittedReport = report.value.trim();
  reportError.value = "";
  try {
    const response = await fetch(
      import.meta.env.VITE_INTEGRAGO_SUPPORT_URL || "/api/email/support",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:
            (import.meta.env.DEV &&
              import.meta.env.VITE_INTEGRAGO_SUPPORT_DEMO_EMAIL) ||
            session.value.email,
          topic: "Solicitud de soporte",
          details: `${greeting.value}\n\n${submittedReport}`,
        }),
      },
    );
    if (!response.ok) throw new Error("SMTP request failed");
    const result: { success?: boolean } = await response.json();
    if (result.success !== true)
      throw new Error("SMTP acceptance was not confirmed");
    report.value = "";
    reportSent.value = true;
  } catch {
    reportError.value =
      "No se pudo confirmar el envío. Revisa la conexión con el proxy.";
  } finally {
    sendingReport.value = false;
  }
}
const options: { id: AccountPanel; label: string; icon: string }[] = [
  { id: "profile", label: "Mi perfil", icon: "user" },
  { id: "branch", label: "Cambio de sucursal", icon: "pin" },
  { id: "support", label: "Ayuda y soporte", icon: "support" },
  { id: "about", label: "Acerca de IntegraOne", icon: "info" },
];
const panelTitle = computed(
  () => panel.value === "logout"
    ? "¿Cerrar sesión?"
    : options.find((option) => option.id === panel.value)?.label ?? "Cuenta",
);
function showPanel(value: AccountPanel) {
  if (panel.value !== null) return;
  panel.value = value;
}
function closePanel() {
  const modal = accountModal.value?.$el as HTMLIonModalElement | undefined;
  void modal?.dismiss();
}
async function dismissPanel() {
  const closedPanel = panel.value;
  panel.value = null;
  emailFormOpen.value = false;
  await nextTick();
  if (closedPanel && panel.value === null)
    document.getElementById(`account-${closedPanel}`)?.focus({ preventScroll: true });
}
onIonViewWillLeave(() => {
  photoPickerOpen.value = false;
  whatsappOpen.value = false;
  closePanel();
});
function logout() {
  resetDraft();
  signOut();
  closePanel();
  void router.replace("/login");
}
</script>
<template>
  <AppShell page-class="account-page">
    <template v-if="session">
      <section class="profile-hero" aria-labelledby="account-title">
        <h1 id="account-title">Cuenta</h1>
        <div class="profile-identity">
          <div class="profile-portrait" aria-hidden="true">
            <span class="avatar">
              <img v-if="profilePhoto" :src="profilePhoto" alt="" />
              <template v-else>{{ initials(session.name) }}</template>
            </span>
          </div>
          <div class="profile-name">
            <h2>{{ session.name }}</h2>
            <p>{{ roleLabels[session.role] }}</p>
            <BrandLogo :brand="session.brand" />
          </div>
        </div>
        <p class="profile-airport">
          <AppIcon name="pin" :size="18" aria-hidden="true" />
          <span>{{ [session.airport.name, session.airport.counter].filter(Boolean).join(" · ") }}</span>
          <span class="airport-code">{{ session.airport.code }}</span>
        </p>
      </section>
      <section class="account-actions" aria-label="Opciones de cuenta">
        <div class="account-links">
          <button
            v-for="option in options"
            :id="`account-${option.id}`"
            :key="option.id"
            type="button"
            aria-haspopup="dialog"
            aria-controls="account-sheet"
            :aria-expanded="panel === option.id"
            @click="showPanel(option.id)"
          >
            <span class="account-action-icon"><AppIcon :name="option.icon" :size="18" aria-hidden="true" /></span>
            <span>{{ option.label }}</span>
            <AppIcon name="arrow" :size="16" aria-hidden="true" />
          </button>
          <button id="account-logout" type="button" class="account-logout" aria-haspopup="dialog" @click="showPanel('logout')">
            <span class="account-action-icon"><AppIcon name="logout" :size="18" aria-hidden="true" /></span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </section>
      <IonModal
        v-if="panel !== null"
        ref="accountModal"
        id="account-sheet"
        :is-open="true"
        class="account-sheet-modal account-sheet-compact"
        :class="{ 'account-sheet-profile': panel === 'profile', 'account-sheet-report': emailFormOpen }"
        :style="emailFormOpen ? reportViewportStyle : undefined"
        aria-labelledby="account-sheet-title"
        @ionModalDidDismiss="dismissPanel"
      >
        <section class="account-sheet-content">
          <div class="account-sheet-handle" aria-hidden="true" />
          <header class="account-sheet-header">
            <div>
              <h2 id="account-sheet-title">{{ panelTitle }}</h2>
            </div>
            <button
              type="button"
              class="icon-button"
              aria-label="Cerrar panel de cuenta"
              @click="closePanel"
            >
              <AppIcon name="close" :size="20" />
            </button>
          </header>
          <div class="account-sheet-body">
            <template v-if="panel === 'profile'">
              <div class="sheet-profile-identity">
                <button ref="photoTrigger" type="button" class="profile-photo-button" aria-label="Cambiar foto de perfil" aria-haspopup="dialog" :disabled="savingPhoto" @click="photoPickerOpen = true">
                  <span class="avatar" aria-hidden="true">
                    <img v-if="profilePhoto" :src="profilePhoto" alt="" />
                    <template v-else>{{ initials(session.name) }}</template>
                  </span>
                  <span class="profile-photo-pencil" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m16 4 4 4M4 20l4-1L21 6l-4-4L4 15z" />
                    </svg>
                  </span>
                </button>
                <div>
                  <h3>{{ session.name }}</h3>
                  <p>{{ roleLabels[session.role] }}</p>
                  <input ref="photoInput" type="file" accept="image/*" hidden @change="changePhoto" />
                </div>
              </div>
              <p v-if="photoError" class="field-error" role="alert">{{ photoError }}</p>
              <p v-else-if="savingPhoto" class="sheet-description" role="status">Guardando foto…</p>
              <dl class="sheet-profile-data">
                <div>
                  <dt>Correo de demostración</dt>
                  <dd>{{ session.email }}</dd>
                </div>
                <div>
                  <dt>Marca</dt>
                  <dd>{{ session.brand }}</dd>
                </div>
                <div>
                  <dt>Sucursal</dt>
                  <dd>
                    {{ session.airport.name }} ({{ session.airport.code }})
                    <template v-if="session.airport.counter"> · {{ session.airport.counter }}</template>
                  </dd>
                </div>
              </dl>
            </template>
            <WorkLocationForm
              v-else-if="panel === 'branch'"
              staged
              submit-label="Guardar sucursal"
              @saved="closePanel"
            />
            <template v-else-if="panel === 'support'">
              <template v-if="emailFormOpen">
                <div class="support-report-status" role="status">
                  <template v-if="sendingReport">
                    <IonSpinner name="crescent" aria-hidden="true" />
                    <h3>Enviando reporte…</h3>
                    <p>Estamos enviando tu mensaje a Mesa de Ayuda.</p>
                  </template>
                  <template v-else-if="reportSent">
                    <span class="support-report-check" aria-hidden="true">
                      <AppIcon name="check" :size="28" />
                    </span>
                    <h3>Reporte enviado</h3>
                    <p>Tu mensaje se envió a Mesa de Ayuda (911@grupocge.com.mx).</p>
                  </template>
                </div>
                <form
                  v-if="!sendingReport && !reportSent"
                  id="support-report-form"
                  class="support-report"
                  @submit.prevent="sendReport"
                >
                  <p class="support-email-address">911@grupocge.com.mx</p>
                  <p>{{ greeting }}</p>
                  <label for="support-report">Motivo o reporte</label>
                  <textarea
                    id="support-report"
                    v-model="report"
                    rows="4"
                    maxlength="3800"
                    required
                    placeholder="Cuéntanos qué pasó…"
                  />
                  <p v-if="reportError" class="field-error" role="alert">
                    {{ reportError }}
                  </p>
                </form>
              </template>
              <template v-else>
                <button type="button" class="button button-primary button-block" @click="openEmailForm">
                  <AppIcon name="mail" :size="19" /> 911@grupocge.com.mx
                </button>
                <button type="button" class="button button-secondary button-block support-whatsapp" aria-haspopup="dialog" @click="whatsappOpen = true">
                  Contactar por WhatsApp
                </button>
              </template>
            </template>
            <template v-else-if="panel === 'about'">
              <h3>IntegraOne</h3>
              <p class="sheet-description">
                Captación comercial para AVIS, Budget y Payless.
              </p>
              <p class="sheet-pending-note">
                Versión de desarrollo con datos simulados. Sin conexión a
                sistemas corporativos.
              </p>
            </template>
            <p v-else-if="panel === 'logout'" class="sheet-description">
              Para volver a IntegraOne, tendrás que iniciar sesión de nuevo.
            </p>
          </div>
          <footer v-if="panel === 'logout'" class="account-sheet-footer logout-confirm-actions">
            <button type="button" class="button button-secondary" @click="closePanel">
              Cancelar
            </button>
            <button type="button" class="button logout-confirm-button" @click="logout">
              Cerrar sesión
            </button>
          </footer>
          <footer v-else-if="panel === 'support' && emailFormOpen && !sendingReport && !reportSent" class="account-sheet-footer">
            <button type="submit" form="support-report-form" class="button button-primary button-block" :disabled="!report.trim()">
              Enviar reporte
            </button>
          </footer>
          <footer v-else-if="panel === 'profile' || (emailFormOpen && reportSent)" class="account-sheet-footer">
            <button
              type="button"
              class="button button-primary button-block"
              @click="closePanel"
            >
              Cerrar
            </button>
          </footer>
        </section>
      </IonModal>
      <IonModal :is-open="photoPickerOpen" class="account-sheet-modal account-sheet-compact"
        aria-labelledby="profile-photo-title" @didDismiss="photoPickerOpen = false; photoTrigger?.focus()">
        <section class="account-sheet-content">
          <div class="account-sheet-handle" aria-hidden="true" />
          <header class="account-sheet-header">
            <h2 id="profile-photo-title">Cambiar foto de perfil</h2>
          </header>
          <div class="account-sheet-body profile-photo-actions">
            <button type="button" class="button button-primary button-block" @click="choosePhoto('gallery')">
              Elegir de la galería
            </button>
            <button type="button" class="button button-secondary button-block" @click="choosePhoto('camera')">
              Tomar foto
            </button>
            <button type="button" class="text-button" @click="photoPickerOpen = false">Cancelar</button>
          </div>
        </section>
      </IonModal>
      <IonModal :is-open="whatsappOpen" class="account-sheet-modal account-sheet-compact" aria-labelledby="whatsapp-sheet-title" @didDismiss="whatsappOpen = false">
        <section class="account-sheet-content">
          <div class="account-sheet-handle" aria-hidden="true" />
          <header class="account-sheet-header">
            <h2 id="whatsapp-sheet-title">Contactar por WhatsApp</h2>
            <button type="button" class="icon-button" aria-label="Volver a ayuda y soporte" @click="whatsappOpen = false"><AppIcon name="close" :size="20" /></button>
          </header>
          <div class="account-sheet-body">
            <p>Elige un tema y completa tu mensaje en WhatsApp.</p>
            <ul class="support-topics">
              <li v-for="topic in supportTopics" :key="topic"><button type="button" @click="openWhatsApp(topic)">{{ topic }}<AppIcon name="arrow" :size="16" /></button></li>
              <li><button type="button" @click="openWhatsApp()">Otro<AppIcon name="arrow" :size="16" /></button></li>
            </ul>
          </div>
        </section>
      </IonModal>
    </template>
  </AppShell>
</template>
<style scoped>
:deep(.page-container) {
  padding-top: 0;
}
:deep(.page-container.with-tabs) {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 100px);
}
.profile-hero {
  padding-top: calc(env(safe-area-inset-top, 0px) + 24px);
  padding-bottom: 8px;
}
.profile-hero > h1 {
  margin: 0;
  color: var(--text);
  font-size: 26px;
  font-weight: 700;
  text-align: start;
}
.profile-identity {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  margin-top: 28px;
}
.profile-portrait {
  position: relative;
  display: grid;
}
.profile-portrait::before {
  position: absolute;
  inset: -5px;
  border: 2px solid transparent;
  border-top-color: var(--primary);
  border-radius: 50%;
  pointer-events: none;
  content: "";
}
.profile-portrait::after {
  position: absolute;
  inset-block-end: -10px;
  inset-inline: 0;
  width: 20px;
  height: 2px;
  margin-inline: auto;
  border-radius: 2px;
  background: var(--primary);
  pointer-events: none;
  content: "";
}
.profile-hero .avatar {
  width: clamp(64px, 20vw, 80px);
  height: clamp(64px, 20vw, 80px);
  margin: 0;
  font-size: 24px;
}
.profile-name {
  --profile-optical-inset: 4px;
  display: grid;
  justify-items: start;
  text-align: start;
}
.profile-name h2 {
  margin: 0;
  font-size: clamp(22px, 6vw, 28px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}
.profile-name p {
  margin: 4px 0 0;
  margin-inline-start: var(--profile-optical-inset);
  text-align: start;
  color: var(--muted);
  font-size: 14px;
}
.profile-name .brand-logo {
  display: block;
  width: 124px;
  max-width: 100%;
  height: 36px;
  object-fit: contain;
  object-position: left center;
  /* Los PNG dejan unos 12 px transparentes a la izquierda a esta altura. */
  margin-inline-start: calc(var(--profile-optical-inset) - 12px);
}
.profile-airport {
  margin: 36px 0 12px;
}
.account-actions {
  padding-top: 16px;
}
.account-links {
  --account-row-gap: 24px;
  display: grid;
  gap: var(--account-row-gap);
}
.account-links button {
  position: relative;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 62px;
  padding: 0;
  background: transparent;
  color: var(--text);
  text-align: left;
  font-size: 16px;
  font-weight: 600;
}
.account-links button + button::before {
  position: absolute;
  inset-block-start: calc(var(--account-row-gap) / -2);
  inset-inline: 54px 28px;
  height: 1px;
  transform: translateY(-50%);
  background: var(--border);
  pointer-events: none;
  content: "";
}
.account-links button > svg {
  color: var(--muted);
}
.account-action-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}
.account-links .account-logout {
  color: var(--danger);
}
.account-links .account-logout::before {
  inset-inline: 0;
}
.account-logout .account-action-icon {
  background: var(--danger-soft);
  color: var(--danger);
}
</style>
<style>
ion-modal.account-sheet-modal {
  --width: min(100%, 520px);
  --height: min(560px, 86dvh);
  --border-radius: 24px 24px 0 0;
  --box-shadow: 0 -8px 48px #12254414;
  --backdrop-opacity: 0.24;
  align-items: flex-end;
}
ion-modal.account-sheet-compact {
  --height: auto;
  --max-height: 86dvh;
}
.account-sheet-compact .account-sheet-content {
  height: auto;
  max-height: 86dvh;
  padding-bottom: calc(16px + max(24px, env(safe-area-inset-bottom, 0px)));
}
ion-modal.account-sheet-report {
  inset-block: var(--report-top, 0px) var(--report-bottom, 0px);
  height: auto;
  --max-height: min(86dvh, var(--report-height, 86dvh));
}
.account-sheet-report .account-sheet-content {
  max-height: min(86dvh, var(--report-height, 86dvh));
  padding-bottom: var(--report-padding, calc(16px + max(24px, env(safe-area-inset-bottom, 0px))));
}
.account-sheet-compact .account-sheet-header {
  margin-bottom: 16px;
}
.account-sheet-subtitle {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}
.account-sheet-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 24px calc(20px + env(safe-area-inset-bottom, 0px));
  background: var(--white);
  color: var(--text);
}
.account-sheet-handle {
  width: 36px;
  height: 4px;
  background: #dce2eb;
  border-radius: 8px;
  margin: 0 auto 20px;
  flex-shrink: 0;
}
.account-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-shrink: 0;
}
.account-sheet-header h2 {
  font-size: 20px;
  margin: 0;
}
.account-sheet-header .icon-button {
  background: var(--surface);
}
.account-sheet-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.account-sheet-body h3 {
  font-size: 17px;
  line-height: 1.4;
  font-weight: 600;
  margin: 0 0 10px;
  letter-spacing: -0.3px;
}
.sheet-profile-identity {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 20px;
}
.sheet-profile-identity .avatar {
  width: 52px;
  height: 52px;
  font-size: 18px;
  flex-shrink: 0;
}
.profile-hero .avatar,
.sheet-profile-identity .avatar {
  overflow: hidden;
}
.profile-hero .avatar img,
.sheet-profile-identity .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-photo-button {
  position: relative;
  display: grid;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
}
.profile-photo-actions {
  display: grid;
  gap: 12px;
}
.profile-photo-pencil {
  position: absolute;
  right: -3px;
  bottom: -3px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 2px solid var(--white);
  border-radius: 50%;
  background: var(--primary);
  color: var(--white);
}
.sheet-profile-identity h3 {
  margin-bottom: 3px;
}
.sheet-profile-identity p {
  color: var(--muted);
  font-size: 13px;
  margin: 0;
}
.sheet-profile-data {
  margin: 0;
}
.sheet-profile-data > div {
  padding: 14px 0;
  border-top: 1px solid var(--border);
}
.sheet-profile-data dt {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}
.sheet-profile-data dd {
  font-size: 14px;
  margin: 0;
  overflow-wrap: anywhere;
}
.sheet-pending-note,
.sheet-description {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
  margin: 16px 0 0;
}
.support-whatsapp { margin-top: 10px; }
.support-topics { list-style: none; padding: 0; margin: 16px 0 0; }
.support-topics button { display: flex; align-items: center; justify-content: space-between; min-height: 48px; width: 100%; padding: 8px 0; border: 0; border-bottom: 1px solid var(--border); background: transparent; color: var(--primary); text-align: left; }
.support-email-address {
  color: var(--primary);
  margin-bottom: 16px;
  overflow-wrap: anywhere;
}
.support-report {
  display: grid;
  gap: 12px;
}
.support-report-status:not(:empty) {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 24px 0;
  text-align: center;
}
.support-report-status h3,
.support-report-status p {
  margin: 0;
}
.support-report-status ion-spinner {
  width: 32px;
  height: 32px;
  color: var(--ion-color-primary);
}
.support-report-check {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  color: var(--success);
  background: var(--success-soft);
}
.support-report label {
  font-weight: 600;
}
.support-report textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--white);
  color: var(--text);
  font: inherit;
  font-size: 16px;
  resize: vertical;
}
.account-sheet-footer {
  flex-shrink: 0;
  padding-top: 20px;
}
.logout-confirm-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.logout-confirm-button {
  background: var(--danger);
  color: var(--white);
}
.account-sheet-profile .account-sheet-footer {
  padding-top: 4px;
}
@media (min-width: 768px) {
  ion-modal.account-sheet-modal {
    align-items: center;
    --border-radius: 24px;
  }
}
</style>
