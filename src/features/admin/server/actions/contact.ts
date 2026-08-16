"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import type { ContactChannelType } from "@/db/schema/enums";
import {
  ContactChannelRepository,
  type UpsertContactChannelInput,
} from "@/features/contact/server/repository";
import { createAction } from "@/server/action";
import { revalidateContactChannelsCache } from "@/server/cache/revalidate-tags";

const contactChannelRepository = new ContactChannelRepository(db);

const contactChannelItemSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["EMAIL", "PHONE", "WHATSAPP"]),
  value: z.string().trim().min(1).max(255),
  isActive: z.boolean(),
});

const syncContactChannelsSchema = z
  .object({
    channels: z.array(contactChannelItemSchema),
  })
  .superRefine((data, ctx) => {
    data.channels.forEach((channel, index) => {
      if (channel.type !== "EMAIL") {
        return;
      }

      const parsed = z.string().email().safeParse(channel.value);
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçerli bir e-posta adresi girin",
          path: ["channels", index, "value"],
        });
      }
    });
  });

function assignContactSortOrders(
  channels: z.infer<typeof contactChannelItemSchema>[],
): UpsertContactChannelInput[] {
  const orderByType = new Map<ContactChannelType, number>();

  return channels.map((channel) => {
    const sortOrder = orderByType.get(channel.type) ?? 0;
    orderByType.set(channel.type, sortOrder + 1);

    return {
      id: channel.id,
      type: channel.type,
      value: channel.value,
      isActive: channel.isActive,
      sortOrder,
    };
  });
}

export async function updateContactChannelsAction(rawInput: unknown) {
  return createAction(syncContactChannelsSchema, async (input) => {
    const channels = await contactChannelRepository.sync(
      assignContactSortOrders(input.channels),
    );
    revalidatePath("/admin/contact");
    revalidateContactChannelsCache();
    return channels;
  }, rawInput);
}
