import { computed, readonly, shallowRef } from "vue";
import type { User } from "@/types";

// Identidad ficticia fija. Sustituir este módulo al integrar autenticación real.
export const DEMO_USER: User = {
  id: "demo-budget-seller",
  name: "Yahir Sánchez",
  email: "yahir.sanchez@example.com",
  brand: "Budget",
  airport: { code: "MID", name: "Aeropuerto de Mérida" },
  role: import.meta.env.VITE_INTEGRAGO_DEMO_ROLE === "counter" ? "counter" : "seller",
};
const KEY = "integrago.demo-session.v1";
export const demoRegion = "Mérida";
export const demoBranches = [
  { code: "MID-CEN", name: "Sucursal Centro", counters: [] },
  { code: "MID-HOT", name: "Sucursal Hotel", counters: [] },
  { ...DEMO_USER.airport, counters: [
    { id: "sala-1", name: "Sala 1" },
    { id: "sala-2", name: "Sala 2" },
    { id: "internacional", name: "Sala Internacional" },
  ] },
];
const currentUser = shallowRef<User | null>(null);
const locationSelected = shallowRef(false);
export const session = readonly(currentUser);
export const needsWorkLocation = computed(() => !!currentUser.value && !locationSelected.value);

function resolveWorkLocation(branchCode: string, counterId: string) {
  const branch = demoBranches.find(({ code }) => code === branchCode);
  if (!branch) return;
  const counter = branch.counters.find(({ id }) => id === counterId);
  if (branch.counters.length ? !counter : !!counterId) return;
  return { code: branch.code, name: branch.name, ...(counter ? { counter: counter.name } : {}) };
}

export function selectWorkLocation(branchCode: string, counterId: string): boolean {
  const airport = resolveWorkLocation(branchCode, counterId);
  if (!currentUser.value || !airport) return false;
  currentUser.value = { ...currentUser.value, airport };
  locationSelected.value = true;
  try {
    sessionStorage.setItem(KEY, `demo:${branchCode}:${counterId}`);
  } catch {
    /* La selección sigue en memoria. */
  }
  return true;
}

export function restoreSession() {
  currentUser.value = null;
  locationSelected.value = false;
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored === "demo") currentUser.value = DEMO_USER;
    else if (stored?.startsWith("demo:")) {
      const [, branchCode = "", counterId = ""] = stored.split(":");
      const airport = resolveWorkLocation(branchCode, counterId);
      currentUser.value = airport ? { ...DEMO_USER, airport } : DEMO_USER;
      locationSelected.value = !!airport;
    }
  } catch {
    currentUser.value = null;
  }
}
export function signIn() {
  // No se reciben ni persisten contraseñas. Esto no es un control de seguridad.
  currentUser.value = DEMO_USER;
  locationSelected.value = false;
  try {
    sessionStorage.setItem(KEY, "demo");
  } catch {
    /* La sesión sigue en memoria. */
  }
}
export function signOut() {
  currentUser.value = null;
  locationSelected.value = false;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* Sin persistencia disponible. */
  }
}
