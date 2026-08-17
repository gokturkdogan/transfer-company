import "server-only";

import path from "node:path";

// pdfmake ships as CJS; default export is a configured singleton.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmake = require("pdfmake/js/index.js") as {
  setFonts: (fonts: Record<string, Record<string, string>>) => void;
  setLocalAccessPolicy: (callback: () => boolean) => void;
  createPdf: (docDefinition: Record<string, unknown>) => {
    getBuffer: () => Promise<Buffer>;
  };
};

let pdfMakeConfigured = false;

export const ADMIN_PDF_COLORS = {
  ink: "#0b0b10",
  inkSoft: "#14141c",
  inkElevated: "#1d1d27",
  gold: "#c8a45d",
  goldLight: "#e9d7a8",
  goldBright: "#f5e8c4",
  goldDeep: "#9c7c42",
  background: "#fbfaf7",
  muted: "#f4f2ec",
  border: "#e9e5db",
  textMuted: "#6b6b76",
  white: "#ffffff",
  success: "#047857",
} as const;

export function getBrandLogoPath(): string {
  return path.join(process.cwd(), "public/images/brand/logo-emblem.png");
}

export function ensurePdfMakeConfigured(): void {
  if (pdfMakeConfigured) {
    return;
  }

  const fontDir = path.join(
    process.cwd(),
    "node_modules/dejavu-fonts-ttf/ttf",
  );

  pdfmake.setFonts({
    DejaVu: {
      normal: path.join(fontDir, "DejaVuSans.ttf"),
      bold: path.join(fontDir, "DejaVuSans-Bold.ttf"),
      italics: path.join(fontDir, "DejaVuSans-Oblique.ttf"),
      bolditalics: path.join(fontDir, "DejaVuSans-BoldOblique.ttf"),
    },
  });
  pdfmake.setLocalAccessPolicy(() => true);
  pdfMakeConfigured = true;
}

export function createAdminPdfDocument(
  docDefinition: Record<string, unknown>,
) {
  ensurePdfMakeConfigured();

  return pdfmake.createPdf(docDefinition);
}
