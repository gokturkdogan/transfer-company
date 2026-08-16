"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/features/admin/server/auth";
import { uploadBlogCoverImageToCloudinary } from "@/lib/cloudinary/upload";
import { createAction } from "@/server/action";

const uploadBlogCoverImageSchema = z.object({
  imageDataUrl: z.string().min(1),
  slug: slugSchema(),
});

function slugSchema() {
  return z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
}

export async function uploadBlogCoverImageAction(rawInput: unknown) {
  await requireAdminSession();

  return createAction(uploadBlogCoverImageSchema, async (input) => {
    const result = await uploadBlogCoverImageToCloudinary({
      imageDataUrl: input.imageDataUrl,
      slug: input.slug,
    });

    revalidatePath("/admin/guides");

    return {
      imageUrl: result.secureUrl,
      publicId: result.publicId,
      folder: result.folder,
    };
  }, rawInput);
}
