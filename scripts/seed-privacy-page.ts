import { join } from "node:path";

import { eq } from "drizzle-orm";

import { SUPPORTED_LOCALES } from "../src/config/locales";
import type { Database } from "../src/db/client";
import * as schema from "../src/db/schema";
import { loadDefaultKvkkText } from "../src/features/privacy/lib/load-default-kvkk-text";
import { plainTextToPrivacyHtml } from "../src/features/privacy/lib/plain-text-to-privacy-html";

function getDefaultKvkkHtml(locale: string): string | null {
  const text = loadDefaultKvkkText(locale);
  if (!text) {
    return null;
  }

  return plainTextToPrivacyHtml(text);
}

/**
 * Inserts default KVKK HTML per supported locale when missing.
 * Set PRIVACY_SEED_FORCE=1 to overwrite existing rows (e.g. after template update).
 */
export async function seedPrivacyPageTranslations(db: Database): Promise<void> {
  const force = process.env.PRIVACY_SEED_FORCE === "1";

  for (const { code: locale } of SUPPORTED_LOCALES) {
    const html = getDefaultKvkkHtml(locale);
    if (!html) {
      console.log(`Privacy page (${locale}): skipped — no default template file.`);
      continue;
    }

    const [existing] = await db
      .select({ id: schema.privacyPageTranslations.id })
      .from(schema.privacyPageTranslations)
      .where(eq(schema.privacyPageTranslations.locale, locale))
      .limit(1);

    if (existing && !force) {
      console.log(
        `Privacy page (${locale}): skipped — existing content preserved.`,
      );
      continue;
    }

    if (existing) {
      await db
        .update(schema.privacyPageTranslations)
        .set({ content: html })
        .where(eq(schema.privacyPageTranslations.id, existing.id));
      console.log(`Privacy page (${locale}): updated from default template.`);
      continue;
    }

    await db.insert(schema.privacyPageTranslations).values({
      locale,
      content: html,
    });

    console.log(`Privacy page (${locale}): inserted default KVKK content.`);
  }
}
