import "server-only";

import { cache } from "react";

import { siteConfig } from "@/config/site";
import { db } from "@/db/client";
import { groupContactChannels } from "@/features/contact/domain/contact-links";
import { ContactChannelRepository } from "@/features/contact/server/repository";
import type { PublicContactChannels } from "@/features/contact/types/public-contact";

function withContactFallbacks(
  channels: PublicContactChannels,
): PublicContactChannels {
  return {
    phones: channels.phones.length > 0 ? channels.phones : [siteConfig.phone],
    emails: channels.emails.length > 0 ? channels.emails : [siteConfig.email],
    whatsapps:
      channels.whatsapps.length > 0 ? channels.whatsapps : [siteConfig.whatsapp],
  };
}

export const getPublicContactChannels = cache(
  async (): Promise<PublicContactChannels> => {
    const repository = new ContactChannelRepository(db);
    const activeChannels = await repository.listActive();

    return withContactFallbacks(groupContactChannels(activeChannels));
  },
);
