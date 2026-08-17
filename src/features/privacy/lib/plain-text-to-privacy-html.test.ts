import { describe, expect, it } from "vitest";

import { plainTextToPrivacyHtml } from "@/features/privacy/lib/plain-text-to-privacy-html";

describe("plainTextToPrivacyHtml", () => {
  it("wraps top-level sections and uses intro header", () => {
    const html = plainTextToPrivacyHtml(
      [
        "ROYAL RHEIN TRANSFERS",
        "Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni",
        "",
        "1. Amaç ve Kapsam",
        "Birinci paragraf.",
        "",
        "2. Veri Sorumlusu",
        "İkinci paragraf.",
        "",
        "Son Güncelleme: 17 Ağustos 2026",
      ].join("\n"),
    );

    expect(html).toContain("<header class=\"privacy-intro\">");
    expect(html).toContain("<h1>ROYAL RHEIN TRANSFERS</h1>");
    expect(html).toContain("privacy-doc-title");
    expect(html.match(/<section class="privacy-block">/g)?.length).toBe(2);
    expect(html).toContain("<h2>1. Amaç ve Kapsam</h2>");
    expect(html).toContain("<footer class=\"privacy-footer\">");
  });

  it("uses h3 for numbered subsections", () => {
    const html = plainTextToPrivacyHtml(
      [
        "ROYAL RHEIN",
        "Aydınlatma Metni",
        "",
        "3. İşlenen Kişisel Veriler",
        "Giriş paragrafı.",
        "",
        "3.1. Kimlik Bilgileri",
        "Alt paragraf.",
        "* madde bir",
      ].join("\n"),
    );

    expect(html).toContain("<h3>3.1. Kimlik Bilgileri</h3>");
    expect(html).toContain("<ul><li>madde bir</li></ul>");
  });
});
