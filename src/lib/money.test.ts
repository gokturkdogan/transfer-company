import { describe, expect, it } from "vitest";

import {
  addMoney,
  createMoney,
  formatMoney,
  majorToMinor,
  multiplyMoney,
  sumMoney,
} from "@/lib/money";

describe("money", () => {
  it("creates money with integer minor units", () => {
    expect(createMoney(4500, "EUR")).toEqual({
      amountMinor: 4500,
      currency: "EUR",
    });
  });

  it("rejects non-integer minor units", () => {
    expect(() => createMoney(45.5, "EUR")).toThrow();
  });

  it("adds and multiplies money safely", () => {
    const base = createMoney(4500, "EUR");
    const extra = createMoney(1500, "EUR");

    expect(addMoney(base, extra).amountMinor).toBe(6000);
    expect(multiplyMoney(base, 2).amountMinor).toBe(9000);
  });

  it("sums a list of money values", () => {
    const values = [createMoney(1000, "EUR"), createMoney(2500, "EUR")];
    expect(sumMoney(values).amountMinor).toBe(3500);
  });

  it("converts major to minor units without float drift", () => {
    expect(majorToMinor(45.5)).toBe(4550);
  });

  it("formats money for a locale", () => {
    const formatted = formatMoney(createMoney(4500, "EUR"), "en-US");
    expect(formatted).toContain("45");
  });

  it("falls back when locale is empty", () => {
    const formatted = formatMoney(createMoney(4500, "EUR"), "");
    expect(formatted).toContain("45");
  });
});
