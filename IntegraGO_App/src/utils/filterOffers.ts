import type { Offer, OfferStatus } from "@/types";
export type OfferFilter = OfferStatus | "all";

export function filterOffers(
  items: Offer[],
  search: string,
  filter: OfferFilter,
): Offer[] {
  const term = search.toLocaleLowerCase("es").trim();
  const digits = term.replace(/\D/g, "");
  const phoneSearch = /^[+\d\s().-]+$/.test(term) && digits.length > 0;
  return items.filter((offer) => {
    const matchesStatus = filter === "all" || offer.status === filter;
    const matchesSearch =
      !term ||
      `${offer.sellerReference} ${offer.client.name}`
        .toLocaleLowerCase("es")
        .includes(term) ||
      (phoneSearch && offer.client.phone.replace(/\D/g, "").includes(digits));
    return matchesStatus && matchesSearch;
  });
}
