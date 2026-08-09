import { describe, expect, it } from "vitest";

import {
  resolveVehicleCoverImage,
  resolveVehicleGalleryImages,
} from "@/features/vehicles/lib/resolve-vehicle-cover-image";

describe("resolveVehicleCoverImage", () => {
  it("prefers the database image key", () => {
    expect(
      resolveVehicleCoverImage(
        "https://res.cloudinary.com/demo/image/upload/vito.jpg",
        "VITO",
      ),
    ).toBe("https://res.cloudinary.com/demo/image/upload/vito.jpg");
  });

  it("falls back to static fleet image by code", () => {
    expect(resolveVehicleCoverImage(null, "SPRINTER")).toBe(
      "/images/homepage/fleet-sprinter.jpg",
    );
  });
});

describe("resolveVehicleGalleryImages", () => {
  it("combines cover and gallery images without duplicates", () => {
    expect(
      resolveVehicleGalleryImages(
        "https://cdn.example/cover.jpg",
        [
          "https://cdn.example/cover.jpg",
          "https://cdn.example/gallery-1.jpg",
        ],
        "VITO",
      ),
    ).toEqual([
      "https://cdn.example/cover.jpg",
      "https://cdn.example/gallery-1.jpg",
    ]);
  });
});
