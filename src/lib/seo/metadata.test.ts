import { describe, expect, it } from "vitest";

import { APP_NAME } from "@/config/constants";
import { buildPageTitle } from "@/lib/seo/metadata";

describe("buildPageTitle", () => {
  it("appends canonical brand name", () => {
    expect(buildPageTitle("Hakkımızda")).toBe(`Hakkımızda | ${APP_NAME}`);
  });

  it("does not duplicate brand when already present", () => {
    const full = `Hakkımızda | ${APP_NAME}`;
    expect(buildPageTitle(full)).toBe(full);
  });
});
