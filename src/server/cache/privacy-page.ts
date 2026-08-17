import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { PrivacyPageRepository } from "@/features/privacy/server/repository";
import { PRIVACY_PAGE_CACHE_TAG } from "@/server/cache/revalidate-tags";

const REVALIDATE_SECONDS = 120;

export function getCachedPrivacyPageContent(locale: string) {
  return unstable_cache(
    async () => {
      const repository = new PrivacyPageRepository(db);
      return repository.getByLocale(locale);
    },
    ["privacy-page", locale],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [PRIVACY_PAGE_CACHE_TAG, `${PRIVACY_PAGE_CACHE_TAG}:${locale}`],
    },
  )();
}
