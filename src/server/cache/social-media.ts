import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { SocialMediaRepository } from "@/features/social-media/server/repository";

const REVALIDATE_SECONDS = 120;

export function getCachedSocialMediaLinks() {
  return unstable_cache(
    async () => new SocialMediaRepository(db).listActiveForDisplay(),
    ["social-media-links"],
    { revalidate: REVALIDATE_SECONDS, tags: ["social-media-links"] },
  )();
}
