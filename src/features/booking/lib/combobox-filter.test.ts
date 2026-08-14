import { describe, expect, it } from "vitest";

import {
  CUSTOM_HOTEL_OPTION_ID,
  createComboboxFilter,
} from "@/features/booking/lib/combobox-filter";

describe("createComboboxFilter", () => {
  const filter = createComboboxFilter([CUSTOM_HOTEL_OPTION_ID]);

  it("keeps pinned options visible when search does not match their label", () => {
    expect(
      filter(`Otel listede yok  ${CUSTOM_HOTEL_OPTION_ID}`, "Grand Hotel"),
    ).toBe(1);
  });

  it("filters regular options by case-insensitive substring", () => {
    const hotelValue = "Rixos Premium Belek hotel-1";

    expect(filter(hotelValue, "rixos")).toBe(1);
    expect(filter(hotelValue, "belek")).toBe(1);
    expect(filter(hotelValue, "hilton")).toBe(0);
  });

  it("shows all options when search is empty", () => {
    expect(filter("Some Hotel hotel-2", "")).toBe(1);
  });
});
