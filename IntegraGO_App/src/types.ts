export type Brand = "AVIS" | "Budget" | "Payless";
export type Role = "seller" | "counter";
export interface Airport {
  code: string;
  name: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  brand: Brand;
  airport: Airport;
  role: Role;
}
export interface Client {
  name: string;
  email: string;
  phone: string;
}
export interface VehicleGroup {
  id: string;
  name: string;
}
export interface Coverage {
  id: string;
  name: string;
}
export type OfferStatus =
  "generated" | "presented" | "converted" | "expired" | "not-converted";
export type Currency = "MXN" | "USD";
export interface OfferDraft {
  client: Client;
  groupId: string;
  coverageId: string;
  pickupAt: string;
  returnAt: string;
  currency: Currency;
  total: string;
}
export interface Offer {
  sellerReference: string;
  ownerId: string;
  brand: Brand;
  airport: Airport;
  client: Client;
  group: VehicleGroup;
  coverage: Coverage;
  pickupAt: string;
  returnAt: string;
  currency: Currency;
  total: number;
  status: OfferStatus;
  createdAt: string;
}
