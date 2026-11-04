import type { Client, OfferDraft } from "@/types";

export function validateClient(value: Client): Record<string, string> {
  const errors: Record<string, string> = {};
  if (value.name.trim().length < 3)
    errors.name = "Escribe el nombre completo (mínimo 3 caracteres).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()))
    errors.email = "Escribe un correo electrónico válido.";
  if (
    !/^[+\d\s().-]+$/.test(value.phone) ||
    value.phone.replace(/\D/g, "").length < 10 ||
    value.phone.replace(/\D/g, "").length > 15
  )
    errors.phone = "Escribe un teléfono de 10 a 15 dígitos.";
  return errors;
}
export function validateOffer(value: OfferDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!value.groupId) errors.groupId = "Selecciona un grupo de vehículo.";
  if (!value.coverageId) errors.coverageId = "Selecciona una cobertura.";
  const pickup = Date.parse(value.pickupAt);
  const end = Date.parse(value.returnAt);
  if (!Number.isFinite(pickup) || pickup <= Date.now())
    errors.pickupAt = "La entrega debe ser una fecha y hora futura.";
  if (!Number.isFinite(end) || end <= pickup)
    errors.returnAt = "La devolución debe ser posterior a la entrega.";
  if (
    !/^\d+(\.\d{1,2})?$/.test(value.total) ||
    Number(value.total) <= 0 ||
    Number(value.total) > 99999999.99
  )
    errors.total = "Escribe un total mayor a cero con hasta dos decimales.";
  return errors;
}
