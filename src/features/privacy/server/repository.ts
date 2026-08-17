import "server-only";

import { asc, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { privacyPageTranslations } from "@/db/schema";
import type {
  PrivacyLocaleContentInput,
  PrivacyPageContent,
} from "@/features/privacy/domain/schemas";

export type PrivacyPageTranslationRecord = PrivacyLocaleContentInput & {
  id: string;
};

function toRecord(
  row: typeof privacyPageTranslations.$inferSelect,
): PrivacyPageTranslationRecord {
  return {
    id: row.id,
    locale: row.locale,
    content: row.content,
  };
}

export class PrivacyPageRepository {
  constructor(private readonly database: Database) {}

  async listAll(): Promise<PrivacyPageTranslationRecord[]> {
    const rows = await this.database
      .select()
      .from(privacyPageTranslations)
      .orderBy(asc(privacyPageTranslations.locale));

    return rows.map(toRecord);
  }

  async getByLocale(locale: string): Promise<PrivacyPageContent | null> {
    const [row] = await this.database
      .select()
      .from(privacyPageTranslations)
      .where(eq(privacyPageTranslations.locale, locale))
      .limit(1);

    if (!row || !row.content.trim()) {
      return null;
    }

    return { content: row.content };
  }

  async upsertAll(
    translations: PrivacyLocaleContentInput[],
  ): Promise<PrivacyPageTranslationRecord[]> {
    await this.database.transaction(async (tx) => {
      for (const translation of translations) {
        const [existing] = await tx
          .select({ id: privacyPageTranslations.id })
          .from(privacyPageTranslations)
          .where(eq(privacyPageTranslations.locale, translation.locale))
          .limit(1);

        if (existing) {
          await tx
            .update(privacyPageTranslations)
            .set({ content: translation.content })
            .where(eq(privacyPageTranslations.id, existing.id));
          continue;
        }

        await tx.insert(privacyPageTranslations).values({
          locale: translation.locale,
          content: translation.content,
        });
      }
    });

    return this.listAll();
  }
}
