"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/features/admin/server/auth";
import { uploadDestinationImageToCloudinary } from "@/lib/cloudinary/upload";
import { createAction } from "@/server/action";
import { revalidatePublicCatalogCache } from "@/server/cache/revalidate-tags";

const uploadDestinationImageSchema = z.object({
  imageDataUrl: z.string().min(1),
  code: z.string().trim().min(1).max(64),
});

export async function uploadDestinationImageAction(rawInput: unknown) {
  await requireAdminSession();

  return createAction(uploadDestinationImageSchema, async (input) => {
    const result = await uploadDestinationImageToCloudinary({
      imageDataUrl: input.imageDataUrl,
      code: input.code,
    });

    revalidatePath("/admin/locations");
    revalidatePublicCatalogCache();

    return {
      imageUrl: result.secureUrl,
      publicId: result.publicId,
      folder: result.folder,
    };
  }, rawInput);
}
