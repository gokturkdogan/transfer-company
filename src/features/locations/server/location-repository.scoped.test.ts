import { describe, expect, it } from "vitest";

import { LocationService } from "@/features/locations/server/service";
import {
  antalyaHierarchySeed,
  createLocationRepositoryFake,
} from "@/test/fakes/location-repository";

describe("LocationRepository scoped queries", () => {
  const repository = createLocationRepositoryFake(antalyaHierarchySeed);
  const service = new LocationService(repository);

  it("returns districts scoped to the selected city", async () => {
    const districts = await service.getDistrictsForCity("city-antalya", "en");

    expect(districts.map((district) => district.id)).toEqual([
      "district-belek",
      "district-alanya",
    ]);
  });

  it("returns no districts for an unknown city", async () => {
    const districts = await service.getDistrictsForCity("missing-city", "en");

    expect(districts).toEqual([]);
  });

  it("returns hotels scoped to the selected district", async () => {
    const hotels = await service.getHotelsForDistrict("district-belek", "en");

    expect(hotels.map((hotel) => hotel.id)).toEqual([
      "hotel-maxx",
      "hotel-regnum",
    ]);
  });

  it("excludes inactive hotels from district queries", async () => {
    const hotels = await service.getHotelsForDistrict("district-belek", "en");

    expect(hotels.some((hotel) => hotel.id === "hotel-inactive")).toBe(false);
  });

  it("filters admin hotels by city through district parents", async () => {
    const hotels = await service.getAdminLocations({
      type: "HOTEL",
      cityId: "city-antalya",
      locale: "en",
    });

    expect(hotels.map((hotel) => hotel.id).sort()).toEqual([
      "hotel-alanya",
      "hotel-maxx",
      "hotel-regnum",
    ]);
  });

  it("filters admin hotels by search term", async () => {
    const hotels = await service.getAdminLocations({
      type: "HOTEL",
      cityId: "city-antalya",
      search: "maxx",
      locale: "en",
    });

    expect(hotels).toHaveLength(1);
    expect(hotels[0]?.id).toBe("hotel-maxx");
  });
});
