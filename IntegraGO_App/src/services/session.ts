import { readonly, shallowRef } from "vue";
import type { User } from "@/types";

// Identidad ficticia fija. Sustituir este módulo al integrar autenticación real.
export const DEMO_USER: User = {
  id: "demo-budget-seller",
  name: "Yahir Sánchez",
  email: "yahir.sanchez@example.com",
  brand: "Budget",
  airport: { code: "MID", name: "Aeropuerto de Mérida" },
  role: "seller",
};
const KEY = "integrago.demo-session.v1";
const currentUser = shallowRef<User | null>(null);
export const session = readonly(currentUser);

export function restoreSession() {
  try {
    currentUser.value =
      sessionStorage.getItem(KEY) === "demo" ? DEMO_USER : null;
  } catch {
    currentUser.value = null;
  }
}
export function signIn() {
  // No se reciben ni persisten contraseñas. Esto no es un control de seguridad.
  currentUser.value = DEMO_USER;
  try {
    sessionStorage.setItem(KEY, "demo");
  } catch {
    /* La sesión sigue en memoria. */
  }
}
export function signOut() {
  currentUser.value = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* Sin persistencia disponible. */
  }
}
