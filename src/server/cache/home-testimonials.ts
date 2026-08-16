import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/db/client";
import { HomeTestimonialRepository } from "@/features/testimonials/server/repository";

const REVALIDATE_SECONDS = 120;

export function getCachedHomeTestimonials(locale: string) {
  return unstable_cache(
    async () => new HomeTestimonialRepository(db).listActiveForLocale(locale),
    ["home-testimonials", locale],
    { revalidate: REVALIDATE_SECONDS, tags: ["home-testimonials"] },
  )();
}
