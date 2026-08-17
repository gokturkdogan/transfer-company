import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { plainTextToPrivacyHtml } from "@/features/privacy/lib/plain-text-to-privacy-html";

let cachedHtml: string | null = null;
let cachedText: string | null = null;

function getDefaultKvkkTextTr(): string {
  if (!cachedText) {
    cachedText = readFileSync(
      join(process.cwd(), "src/features/privacy/content/default-kvkk-tr.txt"),
      "utf8",
    );
  }

  return cachedText;
}

export function getDefaultKvkkHtmlTr(): string {
  if (!cachedHtml) {
    cachedHtml = plainTextToPrivacyHtml(getDefaultKvkkTextTr());
  }

  return cachedHtml;
}
