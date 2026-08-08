import "server-only";

import { and, asc, eq, notInArray } from "drizzle-orm";

import type { Database } from "@/db/client";
import type { ContactChannelType } from "@/db/schema/enums";
import { contactChannels } from "@/db/schema";

export type ContactChannelRecord = {
  id: string;
  type: ContactChannelType;
  value: string;
  sortOrder: number;
  isActive: boolean;
};

export type UpsertContactChannelInput = {
  id?: string;
  type: ContactChannelType;
  value: string;
  sortOrder: number;
  isActive: boolean;
};

export class ContactChannelRepository {
  constructor(private readonly database: Database) {}

  async listAll(): Promise<ContactChannelRecord[]> {
    return this.database
      .select({
        id: contactChannels.id,
        type: contactChannels.type,
        value: contactChannels.value,
        sortOrder: contactChannels.sortOrder,
        isActive: contactChannels.isActive,
      })
      .from(contactChannels)
      .orderBy(asc(contactChannels.type), asc(contactChannels.sortOrder));
  }

  async listActive(): Promise<ContactChannelRecord[]> {
    return this.database
      .select({
        id: contactChannels.id,
        type: contactChannels.type,
        value: contactChannels.value,
        sortOrder: contactChannels.sortOrder,
        isActive: contactChannels.isActive,
      })
      .from(contactChannels)
      .where(eq(contactChannels.isActive, true))
      .orderBy(asc(contactChannels.type), asc(contactChannels.sortOrder));
  }

  async sync(channels: UpsertContactChannelInput[]): Promise<ContactChannelRecord[]> {
    const keptIds = channels
      .map((channel) => channel.id)
      .filter((id): id is string => Boolean(id));

    await this.database.transaction(async (tx) => {
      if (keptIds.length === 0) {
        await tx.delete(contactChannels);
      } else {
        await tx
          .delete(contactChannels)
          .where(notInArray(contactChannels.id, keptIds));
      }

      for (const channel of channels) {
        if (channel.id) {
          await tx
            .update(contactChannels)
            .set({
              type: channel.type,
              value: channel.value,
              sortOrder: channel.sortOrder,
              isActive: channel.isActive,
            })
            .where(eq(contactChannels.id, channel.id));
          continue;
        }

        await tx.insert(contactChannels).values({
          type: channel.type,
          value: channel.value,
          sortOrder: channel.sortOrder,
          isActive: channel.isActive,
        });
      }
    });

    return this.listAll();
  }
}
