import "server-only";

import { ADMIN_PDF_COLORS } from "@/features/admin/server/pdfmake-config";

export function pdfFactRow(
  label: string,
  value: string,
): Record<string, unknown> {
  return {
    columns: [
      { width: "48%", text: label, style: "factLabel" },
      { width: "52%", text: value, style: "factValue" },
    ],
    margin: [0, 0, 0, 2.5],
  };
}

export function pdfSectionTitle(text: string): Record<string, unknown> {
  return {
    text: text.toUpperCase(),
    style: "sectionEyebrow",
    margin: [0, 8, 0, 4],
  };
}

export function pdfMutedCard(
  stack: Record<string, unknown>[],
): Record<string, unknown> {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack,
            margin: [8, 7, 8, 7],
            fillColor: ADMIN_PDF_COLORS.background,
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  };
}

export function pdfGoldRule(width = 523): Record<string, unknown> {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        lineWidth: 1.5,
        lineColor: ADMIN_PDF_COLORS.gold,
      },
    ],
    margin: [0, 5, 0, 8],
  };
}

export const ADMIN_PDF_STYLES = {
  brandTitle: {
    fontSize: 14,
    bold: true,
    color: ADMIN_PDF_COLORS.goldBright,
  },
  brandSubtitle: {
    fontSize: 8,
    color: ADMIN_PDF_COLORS.goldLight,
    margin: [0, 2, 0, 0],
  },
  headerMeta: {
    fontSize: 8,
    color: ADMIN_PDF_COLORS.goldLight,
    margin: [0, 4, 0, 0],
  },
  headerHighlight: {
    fontSize: 12,
    bold: true,
    color: ADMIN_PDF_COLORS.goldBright,
    alignment: "right" as const,
  },
  headerHighlightLabel: {
    fontSize: 7.5,
    color: ADMIN_PDF_COLORS.goldLight,
    alignment: "right" as const,
  },
  sectionEyebrow: {
    fontSize: 7.5,
    bold: true,
    color: ADMIN_PDF_COLORS.goldDeep,
  },
  factLabel: {
    fontSize: 7.5,
    color: ADMIN_PDF_COLORS.textMuted,
  },
  factValue: {
    fontSize: 8.5,
    bold: true,
  },
  kpiLabel: {
    fontSize: 7,
    color: ADMIN_PDF_COLORS.goldLight,
    alignment: "center" as const,
  },
  kpiValue: {
    fontSize: 11,
    bold: true,
    color: ADMIN_PDF_COLORS.goldBright,
    alignment: "center" as const,
    margin: [0, 2, 0, 0],
  },
  tableHeader: {
    fontSize: 7.5,
    bold: true,
    color: ADMIN_PDF_COLORS.goldDeep,
  },
  tableCell: { fontSize: 8 },
  tableCellBold: { fontSize: 8, bold: true },
  muted: { fontSize: 8, color: ADMIN_PDF_COLORS.textMuted },
  footer: {
    fontSize: 7.5,
    color: ADMIN_PDF_COLORS.textMuted,
    alignment: "center" as const,
  },
};

export function pdfBrandHeader(options: {
  subtitle: string;
  metaLine: string;
  highlightLabel: string;
  highlightValue: string;
}): Record<string, unknown> {
  return {
    table: {
      widths: [48, "*", 108],
      body: [
        [
          {
            image: "brandLogo",
            width: 38,
            margin: [8, 8, 0, 8],
            fillColor: ADMIN_PDF_COLORS.ink,
          },
          {
            stack: [
              { text: "Royal Rhein", style: "brandTitle" },
              { text: options.subtitle, style: "brandSubtitle" },
              { text: options.metaLine, style: "headerMeta" },
            ],
            fillColor: ADMIN_PDF_COLORS.ink,
            margin: [4, 8, 6, 8],
          },
          {
            stack: [
              {
                text: options.highlightLabel,
                style: "headerHighlightLabel",
              },
              {
                text: options.highlightValue,
                style: "headerHighlight",
                margin: [0, 2, 0, 0],
              },
            ],
            fillColor: ADMIN_PDF_COLORS.inkSoft,
            margin: [6, 10, 8, 10],
          },
        ],
      ],
    },
    layout: "noBorders",
  };
}
