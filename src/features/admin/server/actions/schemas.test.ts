import { describe, expect, it } from "vitest";

import { DomainRuleError } from "@/server/errors";
import {
  assertDistrictFeaturedInput,
  assertVehicleBookingPreviewInput,
  locationSchema,
  mapFeaturedStartingPricesToMinor,
  resolveParentId,
} from "@/features/admin/server/actions/shared";

describe("admin action schemas", () => {
  it("accepts a valid location payload", () => {
    const parsed = locationSchema.safeParse({
      type: "DISTRICT",
      code: "lara",
      translations: { tr: "Lara", en: "Lara" },
      parentId: "11111111-1111-4111-8111-111111111111",
      sortOrder: 1,
      isActive: true,
      isFeaturedOnHomepage: false,
    });

    expect(parsed.success).toBe(true);
  });
});

describe("admin action helpers", () => {
  it("forces city parent to null", () => {
    expect(
      resolveParentId({
        type: "CITY",
        code: "ANT",
        translations: { tr: "Antalya" },
        parentId: "00000000-0000-0000-0000-000000000001",
        sortOrder: 0,
        isActive: true,
        isFeaturedOnHomepage: false,
      }),
    ).toBeNull();
  });

  it("keeps district parent id", () => {
    const parentId = "00000000-0000-0000-0000-000000000002";
    expect(
      resolveParentId({
        type: "DISTRICT",
        code: "KEMER",
        translations: { tr: "Kemer" },
        parentId,
        sortOrder: 0,
        isActive: true,
        isFeaturedOnHomepage: false,
      }),
    ).toBe(parentId);
  });

  it("maps featured starting prices to minor units", () => {
    expect(mapFeaturedStartingPricesToMinor({ EUR: 12.5 })).toEqual({
      EUR: 1250,
    });
  });

  it("requires image for featured districts", async () => {
    await expect(
      assertDistrictFeaturedInput({
        type: "DISTRICT",
        isFeaturedOnHomepage: true,
        imageKey: "",
        featuredStartingPrices: { EUR: 10 },
      }),
    ).rejects.toThrow("FEATURED_IMAGE_REQUIRED");
  });

  it("rejects too many booking preview images", () => {
    expect(() =>
      assertVehicleBookingPreviewInput({
        galleryImages: [
          { imageKey: "a.jpg", showInBookingPreview: true },
          { imageKey: "b.jpg", showInBookingPreview: true },
          { imageKey: "c.jpg", showInBookingPreview: true },
          { imageKey: "d.jpg", showInBookingPreview: true },
        ],
      }),
    ).toThrow(DomainRuleError);
  });
});
