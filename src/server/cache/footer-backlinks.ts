import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { FooterBacklinksRepository } from "@/features/footer-backlinks/server/repository";

const REVALIDATE_SECONDS = 120;

export function getCachedFooterBacklinks() {
  return unstable_cache(
    async () => new FooterBacklinksRepository(db).listActiveForDisplay(),
    ["footer-backlinks"],
    { revalidate: REVALIDATE_SECONDS, tags: ["footer-backlinks"] },
  )();
}
