import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { groupContactChannels } from "@/features/contact/domain/contact-links";
import { ContactChannelRepository } from "@/features/contact/server/repository";
import type { PublicContactChannels } from "@/features/contact/types/public-contact";
import { siteConfig } from "@/config/site";
import { CONTACT_CHANNELS_CACHE_TAG } from "@/server/cache/revalidate-tags";

const REVALIDATE_SECONDS = 120;

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

export function getCachedPublicContactChannels() {
  return unstable_cache(
    async (): Promise<PublicContactChannels> => {
      const repository = new ContactChannelRepository(db);
      const activeChannels = await repository.listActive();

      return withContactFallbacks(groupContactChannels(activeChannels));
    },
    ["contact-channels"],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [CONTACT_CHANNELS_CACHE_TAG],
    },
  )();
}
