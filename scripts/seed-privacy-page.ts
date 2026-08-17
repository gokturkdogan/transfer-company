import { readFileSync } from "node:fs";
import { join } from "node:path";

import { eq } from "drizzle-orm";

import type { Database } from "../src/db/client";
import * as schema from "../src/db/schema";
import { plainTextToPrivacyHtml } from "../src/features/privacy/lib/plain-text-to-privacy-html";

function getDefaultKvkkHtmlTr(): string {
  const text = readFileSync(
    join(process.cwd(), "src/features/privacy/content/default-kvkk-tr.txt"),
    "utf8",
  );

  return plainTextToPrivacyHtml(text);
}

/**
 * Inserts default Turkish KVKK HTML when locale `tr` is missing.
 * Set PRIVACY_SEED_FORCE=1 to overwrite existing TR content (e.g. after template update).
 */
export async function seedPrivacyPageTranslations(db: Database): Promise<void> {
  const force = process.env.PRIVACY_SEED_FORCE === "1";
  const trHtml = getDefaultKvkkHtmlTr();

  const [existing] = await db
    .select({ id: schema.privacyPageTranslations.id })
    .from(schema.privacyPageTranslations)
    .where(eq(schema.privacyPageTranslations.locale, "tr"))
    .limit(1);

  if (existing && !force) {
    console.log(
      "Privacy page (tr): skipped — existing content preserved (panel edits not overwritten).",
    );
    return;
  }

  if (existing) {
    await db
      .update(schema.privacyPageTranslations)
      .set({ content: trHtml })
      .where(eq(schema.privacyPageTranslations.id, existing.id));
    console.log("Privacy page (tr): updated from default template (PRIVACY_SEED_FORCE=1).");
    return;
  }

  await db.insert(schema.privacyPageTranslations).values({
    locale: "tr",
    content: trHtml,
  });

  console.log("Privacy page (tr): inserted default KVKK content.");
}
