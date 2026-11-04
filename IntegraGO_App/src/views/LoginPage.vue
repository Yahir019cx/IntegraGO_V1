<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { onIonViewWillEnter } from "@ionic/vue";
import AppShell from "@/components/AppShell.vue";
import AppField from "@/components/AppField.vue";
import AppIcon from "@/components/AppIcon.vue";
import BrandWaves from "@/components/BrandWaves.vue";
import logo from "@/assets/IntegraLogo.png";
import { signIn } from "@/services/session";

const router = useRouter();
const email = ref("");
const password = ref("");
const visible = ref(false);
const recovery = ref(false);
onIonViewWillEnter(() => {
  password.value = "";
  visible.value = false;
  recovery.value = false;
});
function login() {
  email.value = "";
  password.value = "";
  signIn();
  void router.replace("/home");
}
</script>
<template>
  <AppShell :tabs="false" page-class="auth-page">
    <div class="auth-content">
      <img :src="logo" alt="IntegraGo" class="integra-logo" />
      <h1>Iniciar sesión</h1>
      <p class="auth-description">Accede con tu cuenta corporativa</p>
      <form novalidate @submit.prevent="login">
        <AppField id="login-email" label="Correo corporativo">
          <AppIcon name="mail" />
          <input
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="username"
            inputmode="email"
            placeholder="nombre@empresa.com"
          />
        </AppField>
        <AppField id="login-password" label="Contraseña">
          <AppIcon name="lock" />
          <input
            id="login-password"
            v-model="password"
            :type="visible ? 'text' : 'password'"
            autocomplete="off"
            placeholder="Contraseña"
          />
          <button
            class="icon-button"
            type="button"
            :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="visible"
            @click="visible = !visible"
          >
            <AppIcon :name="visible ? 'eyeOff' : 'eye'" :size="20" />
          </button>
        </AppField>
        <button type="submit" class="button button-primary button-block">
          Iniciar sesión
        </button>
      </form>
      <button class="text-button auth-recovery" @click="recovery = !recovery">
        ¿Olvidaste tu contraseña?
      </button>
      <p v-if="recovery" class="notice" role="status">
        La recuperación de contraseña estará disponible cuando se integre la
        autenticación corporativa.
      </p>
      <p class="auth-demo">
        Modo demostración · pulsa Iniciar sesión sin llenar los campos. No uses
        credenciales reales. La sesión será de Alex Demo, Budget · MID.
      </p>
    </div>
    <BrandWaves />
  </AppShell>
</template>
