import "server-only";

import { plainTextToPrivacyHtml } from "@/features/privacy/lib/plain-text-to-privacy-html";
import { loadDefaultKvkkText } from "@/features/privacy/lib/load-default-kvkk-text";

const htmlCache = new Map<string, string>();

export function getDefaultKvkkHtml(locale: string): string | null {
  const cached = htmlCache.get(locale);
  if (cached) {
    return cached;
  }

  const text = loadDefaultKvkkText(locale);
  if (!text) {
    return null;
  }

  const html = plainTextToPrivacyHtml(text);
  htmlCache.set(locale, html);
  return html;
}

/** @deprecated Use getDefaultKvkkHtml("tr") */
export function getDefaultKvkkHtmlTr(): string {
  return getDefaultKvkkHtml("tr") ?? "";
}
