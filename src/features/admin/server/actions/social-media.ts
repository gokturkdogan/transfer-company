"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { SOCIAL_MEDIA_PLATFORMS } from "@/db/schema/enums";
import {
  normalizeSocialMediaUrl,
  SocialMediaRepository,
} from "@/features/social-media/server/repository";
import { createAction } from "@/server/action";

const socialMediaRepository = new SocialMediaRepository(db);

const socialMediaLinkItemSchema = z.object({
  platform: z.enum(SOCIAL_MEDIA_PLATFORMS),
  url: z.string().trim().max(512),
  isActive: z.boolean(),
});

const updateSocialMediaLinksSchema = z.object({
  links: z.array(socialMediaLinkItemSchema),
});

export async function updateSocialMediaLinksAction(rawInput: unknown) {
  return createAction(updateSocialMediaLinksSchema, async (input) => {
    const links = await socialMediaRepository.upsertAll(
      input.links.map((link, sortOrder) => ({
        platform: link.platform,
        url: normalizeSocialMediaUrl(link.url),
        isActive: link.isActive,
        sortOrder,
      })),
    );

    revalidatePath("/admin/social-media");
    revalidateTag("social-media-links", "max");

    return links;
  }, rawInput);
}
