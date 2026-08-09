import { describe, expect, it } from "vitest";

import {
  buildVehicleImageFolderPath,
  buildVehicleImageFolderSlug,
  buildVehicleImagePublicId,
} from "@/lib/cloudinary/vehicle-folder";

describe("vehicle image folder helpers", () => {
  it("joins code, brand and model with dashes", () => {
    expect(buildVehicleImageFolderSlug("VITO", "Mercedes-Benz", "Vito Tourer")).toBe(
      "vito-mercedes-benz-vito-tourer",
    );
  });

  it("normalizes Turkish characters", () => {
    expect(buildVehicleImageFolderSlug("TR", "Renault", "Megane Şasi")).toBe(
      "tr-renault-megane-sasi",
    );
  });

  it("builds the Cloudinary folder path under Home/Cars", () => {
    expect(buildVehicleImageFolderPath("VITO", "Mercedes", "Vito")).toBe(
      "Home/Cars/vito-mercedes-vito",
    );
  });

  it("builds a stable public id for each asset", () => {
    expect(
      buildVehicleImagePublicId("VITO", "Mercedes", "Vito", "cover"),
    ).toBe("Home/Cars/vito-mercedes-vito/cover");
  });
});
