import type { Brand, Coverage, VehicleGroup } from "@/types";

const catalogs: Record<
  Brand,
  { groups: VehicleGroup[]; coverages: Coverage[] }
> = {
  AVIS: {
    groups: [
      { id: "avis-economy", name: "Económico" },
      { id: "avis-premium", name: "Premium" },
      { id: "avis-suv", name: "SUV" },
    ],
    coverages: [
      { id: "avis-basic", name: "Protección básica" },
      { id: "avis-full", name: "Protección completa" },
    ],
  },
  Budget: {
    groups: [
      { id: "budget-compact", name: "Compacto" },
      { id: "budget-intermediate", name: "Intermedio" },
      { id: "budget-suv", name: "SUV estándar" },
    ],
    coverages: [
      { id: "budget-basic", name: "Cobertura básica" },
      { id: "budget-plus", name: "Cobertura Plus" },
    ],
  },
  Payless: {
    groups: [
      { id: "payless-economy", name: "Económico" },
      { id: "payless-compact", name: "Compacto" },
    ],
    coverages: [
      { id: "payless-basic", name: "Protección básica" },
      { id: "payless-extra", name: "Protección ampliada" },
    ],
  },
};

export function getCatalogs(brand: Brand) {
  return catalogs[brand];
}
export const roleLabels = { seller: "Vendedor", counter: "Mostrador" } as const;
