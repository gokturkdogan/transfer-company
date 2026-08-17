import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { FooterSettingsRepository } from "@/features/footer-settings/server/repository";

const REVALIDATE_SECONDS = 120;

export function getCachedFooterSettings() {
  return unstable_cache(
    async () => new FooterSettingsRepository(db).get(),
    ["footer-settings"],
    { revalidate: REVALIDATE_SECONDS, tags: ["footer-settings"] },
  )();
}
