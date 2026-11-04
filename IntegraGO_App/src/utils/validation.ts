import type { Client, OfferDraft } from "@/types";
import { isPickupSlot } from "@/utils/dateTimePicker";

export function validateClient(value: Client): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = value.name.trim();
  if (name.length < 3)
    errors.name = "Escribe el nombre completo (mínimo 3 caracteres).";
  else if (!/^[\p{L}\p{M} ]+$/u.test(name))
    errors.name = "El nombre solo puede contener letras y espacios.";
  if (value.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()))
    errors.email = "Escribe un correo electrónico válido.";
  if (!/^\d{10,15}$/.test(value.phone))
    errors.phone = "Escribe un teléfono de 10 a 15 dígitos, sin espacios.";
  return errors;
}
export function validateOffer(value: OfferDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!value.groupId) errors.groupId = "Selecciona un grupo de vehículo.";
  if (!value.coverageId) errors.coverageId = "Selecciona una cobertura.";
  const pickup = Date.parse(value.pickupAt);
  const end = Date.parse(value.returnAt);
  if (!isPickupSlot(value.pickupAt))
    errors.pickupAt = "Elige una entrega a la hora en punto o a la media hora, con al menos 30 minutos de anticipación.";
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
