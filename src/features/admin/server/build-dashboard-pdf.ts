import "server-only";

import path from "node:path";

import { ACCOUNTING_CURRENCY } from "@/config/currencies";
import {
  ADMIN_LOCALE,
  adminCopy,
  formatReservationStatus,
} from "@/features/admin/copy";
import type { DashboardData } from "@/features/admin/server/dashboard-admin-repository";
import { formatMoney } from "@/lib/money";

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

function ensurePdfMakeConfigured(): void {
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

function formatMinor(amountMinor: number): string {
  return formatMoney(
    { amountMinor, currency: ACCOUNTING_CURRENCY },
    ADMIN_LOCALE,
  );
}

function formatReportDate(value: string): string {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatGeneratedAt(): string {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function breakdownSection(
  title: string,
  items: DashboardData["vehicleBreakdown"],
): Record<string, unknown>[] {
  if (items.length === 0) {
    return [
      { text: title, style: "sectionTitle", margin: [0, 14, 0, 4] },
      { text: adminCopy.dashboard.charts.empty, style: "muted" },
    ];
  }

  return [
    { text: title, style: "sectionTitle", margin: [0, 14, 0, 4] },
    {
      table: {
        widths: ["*", "auto"],
        body: [
          ["Ad", adminCopy.dashboard.charts.trendCount],
          ...items.map((item) => [item.name, String(item.count)]),
        ],
      },
      layout: "lightHorizontalLines",
    },
  ];
}

function trendSection(
  title: string,
  points: DashboardData["weeklyTrend"],
): Record<string, unknown>[] {
  if (points.length === 0) {
    return [
      { text: title, style: "sectionTitle", margin: [0, 14, 0, 4] },
      { text: adminCopy.dashboard.charts.empty, style: "muted" },
    ];
  }

  return [
    { text: title, style: "sectionTitle", margin: [0, 14, 0, 4] },
    {
      table: {
        widths: ["*", "auto", "auto"],
        body: [
          [
            "Dönem",
            adminCopy.dashboard.charts.trendCount,
            `Gelir (${ACCOUNTING_CURRENCY})`,
          ],
          ...points.map((point) => [
            point.label,
            String(point.count),
            formatMinor(point.revenueMinor),
          ]),
        ],
      },
      layout: "lightHorizontalLines",
    },
  ];
}

export function buildDashboardPdfFilename(): string {
  const dateStamp = new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return `${adminCopy.dashboard.exportFilename}-${dateStamp}.pdf`;
}

export async function buildDashboardPdfBuffer(
  data: DashboardData,
): Promise<Buffer> {
  ensurePdfMakeConfigured();

  const { summary, revenueStats } = data;

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 48, 40, 48],
    defaultStyle: {
      font: "DejaVu",
      fontSize: 10,
      lineHeight: 1.35,
    },
    styles: {
      title: { fontSize: 18, bold: true, margin: [0, 0, 0, 4] },
      subtitle: { fontSize: 10, color: "#64748b", margin: [0, 0, 0, 8] },
      meta: { fontSize: 9, color: "#64748b" },
      sectionTitle: { fontSize: 12, bold: true },
      muted: { fontSize: 9, color: "#64748b" },
    },
    content: [
      { text: adminCopy.dashboard.title, style: "title" },
      { text: adminCopy.dashboard.subtitle, style: "subtitle" },
      {
        text: `Oluşturulma: ${formatGeneratedAt()}`,
        style: "meta",
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [
              adminCopy.dashboard.kpi.totalReservations,
              String(summary.totalReservations),
            ],
            [
              adminCopy.dashboard.kpi.upcoming,
              String(summary.upcomingReservations),
            ],
            [
              adminCopy.dashboard.kpi.completed,
              String(summary.completedReservations),
            ],
            [
              adminCopy.dashboard.kpi.cancelled,
              String(summary.cancelledReservations),
            ],
            [
              adminCopy.dashboard.kpi.cancellationRate,
              `%${summary.cancellationRate}`,
            ],
            [
              adminCopy.dashboard.kpi.totalPassengers,
              String(summary.totalPassengers),
            ],
            [
              adminCopy.dashboard.kpi.oneWay,
              String(summary.oneWayCount),
            ],
            [
              adminCopy.dashboard.kpi.roundTrip,
              String(summary.roundTripCount),
            ],
          ],
        },
        layout: "lightHorizontalLines",
      },
      {
        text: adminCopy.dashboard.revenueSection.title,
        style: "sectionTitle",
        margin: [0, 14, 0, 4],
      },
      {
        table: {
          widths: ["*", "auto", "auto"],
          body: [
            ["Kalem", "Tutar", adminCopy.dashboard.charts.trendCount],
            [
              adminCopy.dashboard.revenueSection.upcoming,
              formatMinor(revenueStats.upcomingMinor),
              String(revenueStats.upcomingCount),
            ],
            [
              adminCopy.dashboard.revenueSection.completed,
              formatMinor(revenueStats.completedMinor),
              String(revenueStats.completedCount),
            ],
            [
              adminCopy.dashboard.revenueSection.cancelled,
              formatMinor(revenueStats.cancelledMinor),
              String(revenueStats.cancelledCount),
            ],
            [
              "Toplam",
              formatMinor(revenueStats.totalMinor),
              String(revenueStats.totalCount),
            ],
          ],
        },
        layout: "lightHorizontalLines",
      },
      ...trendSection(
        `${adminCopy.dashboard.charts.trendTitle} — ${adminCopy.dashboard.charts.trendWeekly}`,
        data.weeklyTrend,
      ),
      ...trendSection(
        `${adminCopy.dashboard.charts.trendTitle} — ${adminCopy.dashboard.charts.trendMonthly}`,
        data.monthlyTrend,
      ),
      ...breakdownSection(
        adminCopy.dashboard.charts.vehiclesTitle,
        data.vehicleBreakdown,
      ),
      ...breakdownSection(
        adminCopy.dashboard.charts.routesTitle,
        data.routeBreakdown,
      ),
      ...breakdownSection(
        adminCopy.dashboard.charts.statusTitle,
        data.statusBreakdown.map((item) => ({
          name: formatReservationStatus(item.name),
          count: item.count,
        })),
      ),
      ...breakdownSection(
        adminCopy.dashboard.charts.weekdayTitle,
        data.weekdayBreakdown,
      ),
      { text: adminCopy.dashboard.recent.title, style: "sectionTitle", margin: [0, 14, 0, 4] },
      data.recentReservations.length === 0
        ? { text: adminCopy.dashboard.charts.empty, style: "muted" }
        : {
            table: {
              widths: ["auto", "*", "*", "auto", "auto", "auto"],
              body: [
                [
                  adminCopy.dashboard.recent.reference,
                  adminCopy.dashboard.recent.customer,
                  adminCopy.dashboard.recent.route,
                  adminCopy.dashboard.recent.date,
                  adminCopy.dashboard.recent.status,
                  adminCopy.dashboard.recent.total,
                ],
                ...data.recentReservations.map((reservation) => [
                  reservation.reference,
                  reservation.customerName,
                  reservation.routeLabel,
                  formatReportDate(reservation.outboundAt),
                  formatReservationStatus(reservation.status),
                  formatMinor(reservation.totalMinor),
                ]),
              ],
            },
            layout: "lightHorizontalLines",
          },
    ],
  };

  const pdfDocument = pdfmake.createPdf(docDefinition);

  return pdfDocument.getBuffer();
}
