"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/features/admin/server/auth";
import { uploadVehicleImageToCloudinary } from "@/lib/cloudinary/upload";
import { createAction } from "@/server/action";

const uploadVehicleImageSchema = z.object({
  imageDataUrl: z.string().min(1),
  code: z.string().trim().min(1).max(32),
  brand: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(100),
  assetName: z.enum(["cover", "gallery-1", "gallery-2", "gallery-3"]),
});

export async function uploadVehicleImageAction(rawInput: unknown) {
  await requireAdminSession();

  return createAction(uploadVehicleImageSchema, async (input) => {
    const result = await uploadVehicleImageToCloudinary({
      imageDataUrl: input.imageDataUrl,
      code: input.code,
      brand: input.brand,
      model: input.model,
      assetName: input.assetName,
    });

    revalidatePath("/admin/vehicles");

    return {
      imageUrl: result.secureUrl,
      publicId: result.publicId,
      folder: result.folder,
    };
  }, rawInput);
}
