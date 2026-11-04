import { createRouter, createWebHistory } from "@ionic/vue-router";
import { needsWorkLocation, session, restoreSession } from "@/services/session";
import type { RouteLocationNormalized } from "vue-router";

restoreSession();
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "splash",
      component: () => import("@/views/SplashPage.vue"),
      meta: { public: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginPage.vue"),
      meta: { public: true },
    },
    {
      path: "/location",
      name: "location",
      component: () => import("@/views/WorkLocationPage.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/HomePage.vue"),
    },
    {
      path: "/capture",
      name: "capture",
      component: () => import("@/views/CapturePage.vue"),
    },
    {
      path: "/offers/:reference/success",
      name: "success",
      component: () => import("@/views/OfferSuccessPage.vue"),
    },
    {
      path: "/folios",
      name: "folios",
      component: () => import("@/views/FoliosPage.vue"),
    },
    {
      path: "/folios/:reference",
      name: "detail",
      component: () => import("@/views/FolioDetailPage.vue"),
    },
    {
      path: "/account",
      name: "account",
      component: () => import("@/views/AccountPage.vue"),
    },
    {
      path: "/scan",
      name: "scan",
      component: () => import("@/views/ScanPage.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("@/views/NotFoundPage.vue"),
      meta: { public: true },
    },
  ],
});

router.beforeEach((to: RouteLocationNormalized) => {
  if (!to.meta.public && !session.value) return { name: "login" };
  if (needsWorkLocation.value && to.name !== "location") return { name: "location" };
  if (to.name === "location" && !needsWorkLocation.value) return { name: "home" };
  if (to.name === "login" && session.value) return { name: "home" };
  if (to.name === "capture" && session.value?.role === "counter")
    return { name: "scan" };
  if (to.name === "scan" && session.value?.role !== "counter")
    return { name: "home" };
  return true;
});
export default router;
