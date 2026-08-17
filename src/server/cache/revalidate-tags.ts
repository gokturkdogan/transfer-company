import "server-only";

import { revalidateTag } from "next/cache";

export const PUBLIC_CATALOG_CACHE_TAG = "public-catalog";
export const CONTACT_CHANNELS_CACHE_TAG = "contact-channels";
export const PRIVACY_PAGE_CACHE_TAG = "privacy-page";

export function revalidatePublicCatalogCache(): void {
  revalidateTag(PUBLIC_CATALOG_CACHE_TAG, "max");
}

export function revalidateContactChannelsCache(): void {
  revalidateTag(CONTACT_CHANNELS_CACHE_TAG, "max");
}

export function revalidatePrivacyPageCache(): void {
  revalidateTag(PRIVACY_PAGE_CACHE_TAG, "max");
}
