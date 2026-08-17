import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isSupportedLocaleCode } from "@/config/locales";

const CONTENT_DIR = join(process.cwd(), "src/features/privacy/content");

export function loadDefaultKvkkText(locale: string): string | null {
  if (!isSupportedLocaleCode(locale)) {
    return null;
  }

  const filePath = join(CONTENT_DIR, `default-kvkk-${locale}.txt`);

  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}
