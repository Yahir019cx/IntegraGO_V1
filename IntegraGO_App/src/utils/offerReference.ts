const referencePattern = /^[A-Z]{3}-[A-Z0-9]{3}$/;

export function isOfferReference(value: unknown): value is string {
  return typeof value === "string" && referencePattern.test(value);
}

export function normalizeOfferReference(value: string): string {
  const compact = value.toUpperCase().replace(/[\s-]/g, "");
  return compact.length === 6 ? `${compact.slice(0, 3)}-${compact.slice(3)}` : value.toUpperCase();
}
