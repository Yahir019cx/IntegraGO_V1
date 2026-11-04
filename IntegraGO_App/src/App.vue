<script setup lang="ts">
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { signOut } from "@/services/session";

const route = useRoute();
const router = useRouter();
const ionRouter = useIonRouter();

useBackButton(10, () => {
  if (route.name === "location") {
    signOut();
    void router.replace("/login");
  } else if (ionRouter.canGoBack()) {
    ionRouter.back();
  } else if (route.name === "capture" && (route.query.step === "2" || route.query.step === "3")) {
    void router.replace({ name: "capture", query: { step: Number(route.query.step) - 1 } });
  } else if (route.name === "detail") {
    void router.replace("/folios");
  } else if (route.name !== "login" && route.name !== "home" && route.name !== "splash") {
    void router.replace("/home");
  }
});
</script>

<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>
