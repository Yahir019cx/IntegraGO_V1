import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOffer, loadOffers, userOffers } from "@/services/offers";
import {
  DEMO_USER,
  restoreSession,
  session,
  signIn,
  signOut,
} from "@/services/session";
import { getCatalogs } from "@/services/catalogs";
import { draft, resetDraft } from "@/composables/useDraft";
import { validateClient, validateOffer } from "@/utils/validation";
import { filterOffers } from "@/utils/filterOffers";
import type { OfferDraft, User } from "@/types";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key);
    }),
  };
}
const local = memoryStorage();
const tab = memoryStorage();
function validDraft(): OfferDraft {
  return {
    client: {
      name: "Cliente Prueba",
      email: "cliente@example.com",
      phone: "+52 555 000 0011",
    },
    groupId: "budget-intermediate",
    coverageId: "budget-plus",
    pickupAt: "2030-11-04T10:00",
    returnAt: "2030-11-06T10:00",
    currency: "MXN",
    total: "3400.50",
  };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2030-11-03T12:00:00Z"));
  vi.stubGlobal("localStorage", local);
  vi.stubGlobal("sessionStorage", tab);
  local.removeItem("integrago.demo-offers.v1");
  tab.removeItem("integrago.demo-session.v1");
  signOut();
  resetDraft();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("demonstration session", () => {
  it("restores a fixed identity without storing credentials and clears it on logout", () => {
    signIn();
    expect(session.value?.brand).toBe("Budget");
    expect(tab.getItem("integrago.demo-session.v1")).toBe("demo");
    restoreSession();
    expect(session.value?.airport.code).toBe("MID");
    signOut();
    restoreSession();
    expect(session.value).toBeNull();
  });
  it("keeps a session in memory if session storage is unavailable", () => {
    vi.spyOn(tab, "setItem").mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    expect(signIn).not.toThrow();
    expect(session.value?.id).toBe(DEMO_USER.id);
  });
});
describe("offer generation and persistence", () => {
  it("exposes only an independent tracking reference to seller views", async () => {
    await loadOffers(DEMO_USER);
    const offer = await createOffer(validDraft(), DEMO_USER);
    expect(offer).not.toHaveProperty("id");
    expect(offer).not.toHaveProperty("qr");
    expect(offer.sellerReference).toMatch(/^SEG-DEMO-/);
    for (const item of userOffers(DEMO_USER))
      expect(item).not.toHaveProperty("id");
    expect(
      filterOffers(userOffers(DEMO_USER), "BUD-DEMO-1048", "all"),
    ).toHaveLength(0);
  });
  it("adds stable seller references to legacy data without losing offers", async () => {
    await loadOffers(DEMO_USER);
    const existing = JSON.parse(
      local.getItem("integrago.demo-offers.v1") ?? "[]",
    ) as Record<string, unknown>[];
    const ids = existing.map((item) => item.id);
    existing.forEach((item) => {
      delete item.sellerReference;
    });
    local.setItem("integrago.demo-offers.v1", JSON.stringify(existing));
    await loadOffers(DEMO_USER);
    const references = userOffers(DEMO_USER).map(
      (item) => item.sellerReference,
    );
    expect(new Set(references).size).toBe(5);
    expect(references.every((reference) => !ids.includes(reference))).toBe(
      true,
    );
    await loadOffers(DEMO_USER);
    expect(userOffers(DEMO_USER).map((item) => item.sellerReference)).toEqual(
      references,
    );
    const migrated = JSON.parse(
      local.getItem("integrago.demo-offers.v1") ?? "[]",
    ) as Record<string, unknown>[];
    expect(migrated.map((item) => item.id)).toEqual(ids);
  });
  it("seeds all five states once and preserves generated offers across reloads", async () => {
    await loadOffers(DEMO_USER);
    expect(new Set(userOffers(DEMO_USER).map((item) => item.status)).size).toBe(
      5,
    );
    const first = await createOffer(validDraft(), DEMO_USER);
    const second = await createOffer(validDraft(), DEMO_USER);
    expect(first.sellerReference).not.toBe(second.sellerReference);
    expect(first.sellerReference).toMatch(/^SEG-DEMO-/);
    await loadOffers(DEMO_USER);
    expect(userOffers(DEMO_USER)).toHaveLength(7);
    expect(
      userOffers(DEMO_USER).find(
        (item) => item.sellerReference === first.sellerReference,
      )?.total,
    ).toBe(3400.5);
  });
  it("prevents data from a different session brand, airport or owner appearing", async () => {
    await loadOffers(DEMO_USER);
    for (const change of [
      { brand: "AVIS" as const },
      { id: "someone-else" },
      { airport: { code: "CUN", name: "Prueba" } },
    ]) {
      const other: User = { ...DEMO_USER, ...change };
      expect(userOffers(other)).toHaveLength(0);
    }
  });
  it("rejects catalogs from another brand and invalid input without saving", async () => {
    await loadOffers(DEMO_USER);
    await expect(
      createOffer({ ...validDraft(), groupId: "avis-premium" }, DEMO_USER),
    ).rejects.toThrow("tu marca");
    await expect(
      createOffer({ ...validDraft(), total: "-1" }, DEMO_USER),
    ).rejects.toThrow("Revisa");
    expect(userOffers(DEMO_USER)).toHaveLength(5);
  });
  it("reports storage write failure without claiming the offer was saved", async () => {
    await loadOffers(DEMO_USER);
    vi.spyOn(local, "setItem").mockImplementationOnce(() => {
      throw new Error("quota");
    });
    await expect(createOffer(validDraft(), DEMO_USER)).rejects.toThrow(
      "No se pudo guardar",
    );
    expect(userOffers(DEMO_USER)).toHaveLength(5);
  });
  it("reports corrupt storage instead of silently deleting or replacing data", async () => {
    local.setItem("integrago.demo-offers.v1", "{broken");
    await expect(loadOffers(DEMO_USER)).rejects.toThrow("No se pudieron leer");
    expect(local.getItem("integrago.demo-offers.v1")).toBe("{broken");
  });
  it("provides different groups and coverages per brand", () => {
    const brands = ["AVIS", "Budget", "Payless"] as const;
    expect(
      new Set(
        brands.flatMap((brand) =>
          getCatalogs(brand).groups.map((group) => group.id),
        ),
      ).size,
    ).toBe(8);
    expect(
      new Set(
        brands.flatMap((brand) =>
          getCatalogs(brand).coverages.map((coverage) => coverage.id),
        ),
      ).size,
    ).toBe(6);
  });
  it("filters by every state and searches by folio, name and formatted phone", async () => {
    await loadOffers(DEMO_USER);
    const items = userOffers(DEMO_USER);
    expect(filterOffers(items, "", "all")).toHaveLength(5);
    expect(filterOffers(items, "", "active")).toHaveLength(2);
    for (const status of [
      "generated",
      "presented",
      "converted",
      "expired",
      "not-converted",
    ] as const)
      expect(filterOffers(items, "", status)).toHaveLength(1);
    expect(
      filterOffers(
        items,
        items[0]?.sellerReference.toLowerCase() ?? "missing",
        "all",
      ),
    ).toHaveLength(1);
    expect(filterOffers(items, "andrea", "all")).toHaveLength(1);
    expect(filterOffers(items, "(555) 000-0000", "all")).toHaveLength(1);
    expect(filterOffers(items, "andrea", "converted")).toHaveLength(0);
    expect(filterOffers(items, "inexistente1", "all")).toHaveLength(0);
  });
});
describe("wizard validation and draft lifecycle", () => {
  it("validates all three client fields", () => {
    expect(
      Object.keys(validateClient({ name: " ", email: "bad", phone: "123" })),
    ).toEqual(["name", "email", "phone"]);
    expect(validateClient(validDraft().client)).toEqual({});
    expect(
      validateClient({ ...validDraft().client, phone: "abcdefghij1234567890" }),
    ).toHaveProperty("phone");
  });
  it("requires future dates, a later return and a positive total with two decimals", () => {
    expect(validateOffer(validDraft())).toEqual({});
    expect(
      validateOffer({ ...validDraft(), pickupAt: "2020-01-01T10:00" }),
    ).toHaveProperty("pickupAt");
    expect(
      validateOffer({ ...validDraft(), returnAt: "2030-11-04T09:00" }),
    ).toHaveProperty("returnAt");
    for (const total of ["0", "-20", "3.001", "1e5", "100000000", "NaN"])
      expect(validateOffer({ ...validDraft(), total })).toHaveProperty("total");
  });
  it("clears the shared draft when the flow ends", () => {
    Object.assign(draft, validDraft());
    resetDraft();
    expect(draft.client.name).toBe("");
    expect(draft.groupId).toBe("");
    expect(draft.total).toBe("");
  });
});
