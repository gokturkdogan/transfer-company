import "server-only";

import { cache } from "react";

import { getCachedPublicContactChannels } from "@/server/cache/contact-channels";
import type { PublicContactChannels } from "@/features/contact/types/public-contact";

export const getPublicContactChannels = cache(
  async (): Promise<PublicContactChannels> => getCachedPublicContactChannels(),
);
