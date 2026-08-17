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
 * Inserts default Turkish KVKK text only when no row exists for locale `tr`.
 * Never updates existing rows — panel edits and other locales are preserved.
 */
export async function seedPrivacyPageTranslations(db: Database): Promise<void> {
  const [existing] = await db
    .select({ id: schema.privacyPageTranslations.id })
    .from(schema.privacyPageTranslations)
    .where(eq(schema.privacyPageTranslations.locale, "tr"))
    .limit(1);

  if (existing) {
    console.log(
      "Privacy page (tr): skipped — existing content preserved (panel edits not overwritten).",
    );
    return;
  }

  const trHtml = getDefaultKvkkHtmlTr();

  await db.insert(schema.privacyPageTranslations).values({
    locale: "tr",
    content: trHtml,
  });

  console.log("Privacy page (tr): inserted default KVKK content.");
}
