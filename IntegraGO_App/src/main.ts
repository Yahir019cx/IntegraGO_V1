import { createApp } from "vue";
import { IonicVue } from "@ionic/vue";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import App from "@/App.vue";
import router from "@/router";

import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";
import "@/styles.css";

const app = createApp(App).use(IonicVue).use(router);

if (Capacitor.getPlatform() === "android" && Capacitor.isPluginAvailable("App")) {
  // Capacitor envía el evento de documento que escucha Ionic cuando hay un suscriptor nativo.
  void CapacitorApp.addListener("backButton", () => {});
}

void router.isReady().then(() => {
  app.mount("#app");
});
