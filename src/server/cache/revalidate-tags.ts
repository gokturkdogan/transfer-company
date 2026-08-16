import "server-only";

import { revalidateTag } from "next/cache";

export const PUBLIC_CATALOG_CACHE_TAG = "public-catalog";
export const CONTACT_CHANNELS_CACHE_TAG = "contact-channels";

export function revalidatePublicCatalogCache(): void {
  revalidateTag(PUBLIC_CATALOG_CACHE_TAG, "max");
}

export function revalidateContactChannelsCache(): void {
  revalidateTag(CONTACT_CHANNELS_CACHE_TAG, "max");
}
