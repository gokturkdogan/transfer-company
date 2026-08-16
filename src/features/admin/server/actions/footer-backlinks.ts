"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { FOOTER_BACKLINK_SLOT_INDICES } from "@/config/footer-backlinks";
import {
  FooterBacklinksRepository,
} from "@/features/footer-backlinks/server/repository";
import { normalizeSocialMediaUrl } from "@/features/social-media/server/repository";
import { createAction } from "@/server/action";

const footerBacklinksRepository = new FooterBacklinksRepository(db);

const footerBacklinkItemSchema = z.object({
  slotIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
  ]),
  label: z.string().trim().max(120),
  url: z.string().trim().max(512),
  isActive: z.boolean(),
});

const updateFooterBacklinksSchema = z.object({
  links: z
    .array(footerBacklinkItemSchema)
    .length(FOOTER_BACKLINK_SLOT_INDICES.length),
});

export async function updateFooterBacklinksAction(rawInput: unknown) {
  return createAction(updateFooterBacklinksSchema, async (input) => {
    const links = await footerBacklinksRepository.upsertAll(
      input.links.map((link, sortOrder) => ({
        slotIndex: link.slotIndex,
        label: link.label,
        url: normalizeSocialMediaUrl(link.url),
        isActive: link.isActive,
        sortOrder,
      })),
    );

    revalidatePath("/admin/footer-backlinks");
    revalidateTag("footer-backlinks", "max");

    return links;
  }, rawInput);
}
