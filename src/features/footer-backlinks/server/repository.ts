import "server-only";

import { asc, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { footerBacklinks } from "@/db/schema";
import {
  FOOTER_BACKLINK_SLOT_COUNT,
  FOOTER_BACKLINK_SLOT_INDICES,
  type FooterBacklinkSlotIndex,
} from "@/config/footer-backlinks";
import { normalizeSocialMediaUrl } from "@/features/social-media/server/repository";

export type FooterBacklinkRecord = {
  id: string;
  slotIndex: FooterBacklinkSlotIndex;
  label: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

export type UpsertFooterBacklinkInput = {
  slotIndex: FooterBacklinkSlotIndex;
  label: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

function isDisplayableLink(link: FooterBacklinkRecord): boolean {
  return (
    link.isActive &&
    link.label.trim().length > 0 &&
    normalizeSocialMediaUrl(link.url).length > 0
  );
}

export class FooterBacklinksRepository {
  constructor(private readonly database: Database) {}

  async listAll(): Promise<FooterBacklinkRecord[]> {
    const rows = await this.database
      .select({
        id: footerBacklinks.id,
        slotIndex: footerBacklinks.slotIndex,
        label: footerBacklinks.label,
        url: footerBacklinks.url,
        sortOrder: footerBacklinks.sortOrder,
        isActive: footerBacklinks.isActive,
      })
      .from(footerBacklinks)
      .orderBy(asc(footerBacklinks.sortOrder));

    const bySlot = new Map(
      rows.map((row) => [row.slotIndex, row as FooterBacklinkRecord]),
    );

    return FOOTER_BACKLINK_SLOT_INDICES.map((slotIndex, index) => {
      const existing = bySlot.get(slotIndex);

      if (existing) {
        return existing;
      }

      return {
        id: "",
        slotIndex,
        label: "",
        url: "",
        sortOrder: index,
        isActive: false,
      };
    });
  }

  async listActiveForDisplay(): Promise<FooterBacklinkRecord[]> {
    const links = await this.listAll();
    return links.filter(isDisplayableLink);
  }

  async upsertAll(
    links: UpsertFooterBacklinkInput[],
  ): Promise<FooterBacklinkRecord[]> {
    await this.database.transaction(async (tx) => {
      for (const link of links) {
        const label = link.label.trim();
        const url = normalizeSocialMediaUrl(link.url);
        const isActive = link.isActive && url.length > 0 && label.length > 0;

        const [existing] = await tx
          .select({ id: footerBacklinks.id })
          .from(footerBacklinks)
          .where(eq(footerBacklinks.slotIndex, link.slotIndex))
          .limit(1);

        if (existing) {
          await tx
            .update(footerBacklinks)
            .set({
              label,
              url,
              sortOrder: link.sortOrder,
              isActive,
              deletedAt: null,
            })
            .where(eq(footerBacklinks.id, existing.id));
          continue;
        }

        await tx.insert(footerBacklinks).values({
          slotIndex: link.slotIndex,
          label,
          url,
          sortOrder: link.sortOrder,
          isActive,
        });
      }
    });

    return this.listAll();
  }
}

export const FOOTER_BACKLINK_MAX_SLOTS = FOOTER_BACKLINK_SLOT_COUNT;
