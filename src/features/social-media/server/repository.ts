import "server-only";

import { asc, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import {
  SOCIAL_MEDIA_PLATFORMS,
  type SocialMediaPlatform,
} from "@/db/schema/enums";
import { socialMediaLinks } from "@/db/schema";

export type SocialMediaLinkRecord = {
  id: string;
  platform: SocialMediaPlatform;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

export type UpsertSocialMediaLinkInput = {
  platform: SocialMediaPlatform;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

/** Trim; prepend https:// when no scheme; block unsafe pseudo-protocols. */
export function normalizeSocialMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function isDisplayableLink(link: SocialMediaLinkRecord): boolean {
  return link.isActive && normalizeSocialMediaUrl(link.url).length > 0;
}

export class SocialMediaRepository {
  constructor(private readonly database: Database) {}

  async listAll(): Promise<SocialMediaLinkRecord[]> {
    const rows = await this.database
      .select({
        id: socialMediaLinks.id,
        platform: socialMediaLinks.platform,
        url: socialMediaLinks.url,
        sortOrder: socialMediaLinks.sortOrder,
        isActive: socialMediaLinks.isActive,
      })
      .from(socialMediaLinks)
      .orderBy(asc(socialMediaLinks.sortOrder));

    const byPlatform = new Map(
      rows.map((row) => [row.platform, row as SocialMediaLinkRecord]),
    );

    return SOCIAL_MEDIA_PLATFORMS.map((platform, index) => {
      const existing = byPlatform.get(platform);

      if (existing) {
        return existing;
      }

      return {
        id: "",
        platform,
        url: "",
        sortOrder: index,
        isActive: false,
      };
    });
  }

  async listActiveForDisplay(): Promise<SocialMediaLinkRecord[]> {
    const links = await this.listAll();
    return links.filter(isDisplayableLink);
  }

  async upsertAll(
    links: UpsertSocialMediaLinkInput[],
  ): Promise<SocialMediaLinkRecord[]> {
    await this.database.transaction(async (tx) => {
      for (const link of links) {
        const url = normalizeSocialMediaUrl(link.url);
        const isActive = link.isActive && url.length > 0;

        const [existing] = await tx
          .select({ id: socialMediaLinks.id })
          .from(socialMediaLinks)
          .where(eq(socialMediaLinks.platform, link.platform))
          .limit(1);

        if (existing) {
          await tx
            .update(socialMediaLinks)
            .set({
              url,
              sortOrder: link.sortOrder,
              isActive,
              deletedAt: null,
            })
            .where(eq(socialMediaLinks.id, existing.id));
          continue;
        }

        await tx.insert(socialMediaLinks).values({
          platform: link.platform,
          url,
          sortOrder: link.sortOrder,
          isActive,
        });
      }
    });

    return this.listAll();
  }
}
