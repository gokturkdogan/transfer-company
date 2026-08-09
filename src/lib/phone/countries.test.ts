import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getFlagAssetCode } from "@/components/shared/FlagIcon";
import {
  getDefaultPhoneCountryForLocale,
  PHONE_COUNTRY_DEFINITIONS,
  sortPhoneCountries,
} from "@/lib/phone/countries";

describe("phone countries", () => {
  it("includes a comprehensive country list", () => {
    expect(PHONE_COUNTRY_DEFINITIONS.length).toBeGreaterThan(200);
    expect(PHONE_COUNTRY_DEFINITIONS.some((c) => c.iso2 === "TR")).toBe(true);
    expect(PHONE_COUNTRY_DEFINITIONS.some((c) => c.iso2 === "DE")).toBe(true);
  });

  it("prioritizes transfer markets at the top", () => {
    const sorted = sortPhoneCountries("en");
    expect(sorted[0]?.iso2).toBe("TR");
    expect(sorted.slice(0, 5).map((c) => c.iso2)).toContain("DE");
    expect(sorted.slice(0, 5).map((c) => c.iso2)).toContain("GB");
  });

  it("maps locale defaults", () => {
    expect(getDefaultPhoneCountryForLocale("tr")).toBe("TR");
    expect(getDefaultPhoneCountryForLocale("de")).toBe("DE");
    expect(getDefaultPhoneCountryForLocale("ru")).toBe("RU");
  });
});

describe("flag assets", () => {
  it("maps iso codes to flag-icons asset names", () => {
    expect(getFlagAssetCode("TR")).toBe("tr");
    expect(getFlagAssetCode("ac")).toBe("sh-ac");
    expect(getFlagAssetCode("T")).toBe("xx");
  });

  it("ships an svg for every dial-code country", () => {
    const flagDirectory = path.join(
      process.cwd(),
      "node_modules/flag-icons/flags/4x3",
    );
    const available = new Set(readdirSync(flagDirectory));
    const missing = PHONE_COUNTRY_DEFINITIONS.filter(
      (country) => !available.has(`${getFlagAssetCode(country.iso2)}.svg`),
    ).map((country) => country.iso2);

    expect(missing).toEqual([]);
  });
});
