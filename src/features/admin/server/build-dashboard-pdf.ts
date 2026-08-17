import "server-only";

import { ACCOUNTING_CURRENCY } from "@/config/currencies";
import {
  ADMIN_LOCALE,
  adminCopy,
  formatReservationStatus,
} from "@/features/admin/copy";
import {
  ADMIN_PDF_STYLES,
  pdfBrandHeader,
  pdfFactRow,
  pdfGoldRule,
  pdfMutedCard,
  pdfSectionTitle,
} from "@/features/admin/server/admin-pdf-layout";
import type { DashboardData } from "@/features/admin/server/dashboard-admin-repository";
import {
  ADMIN_PDF_COLORS,
  createAdminPdfDocument,
  getBrandLogoPath,
} from "@/features/admin/server/pdfmake-config";
import { formatMoney } from "@/lib/money";

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

function breakdownStack(
  items: Array<{ name: string; count: number }>,
  limit = 5,
): Record<string, unknown>[] {
  if (items.length === 0) {
    return [{ text: adminCopy.dashboard.charts.empty, style: "muted" }];
  }

  return items.slice(0, limit).map((item) =>
    pdfFactRow(item.name, String(item.count)),
  );
}

function kpiStrip(summary: DashboardData["summary"]): Record<string, unknown> {
  const cells = [
    {
      label: adminCopy.dashboard.kpi.totalReservations,
      value: String(summary.totalReservations),
    },
    {
      label: adminCopy.dashboard.kpi.upcoming,
      value: String(summary.upcomingReservations),
    },
    {
      label: adminCopy.dashboard.kpi.completed,
      value: String(summary.completedReservations),
    },
    {
      label: adminCopy.dashboard.kpi.cancelled,
      value: String(summary.cancelledReservations),
    },
  ];

  return {
    table: {
      widths: ["*", "*", "*", "*"],
      body: [
        cells.map((cell) => ({
          stack: [
            { text: cell.label, style: "kpiLabel" },
            { text: cell.value, style: "kpiValue" },
          ],
          fillColor: ADMIN_PDF_COLORS.inkElevated,
          margin: [6, 8, 6, 8],
        })),
      ],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 6],
  };
}

function trendTable(
  points: DashboardData["weeklyTrend"],
  limit = 6,
): Record<string, unknown>[] {
  const slice = points.slice(-limit);

  if (slice.length === 0) {
    return [{ text: adminCopy.dashboard.charts.empty, style: "muted" }];
  }

  return [
    {
      table: {
        widths: ["*", "auto", "auto"],
        body: [
          [
            {
              text: "Dönem",
              style: "tableHeader",
              fillColor: ADMIN_PDF_COLORS.muted,
              margin: [6, 5, 4, 5],
            },
            {
              text: adminCopy.dashboard.charts.trendCount,
              style: "tableHeader",
              fillColor: ADMIN_PDF_COLORS.muted,
              alignment: "right",
              margin: [4, 5, 4, 5],
            },
            {
              text: `Gelir (${ACCOUNTING_CURRENCY})`,
              style: "tableHeader",
              fillColor: ADMIN_PDF_COLORS.muted,
              alignment: "right",
              margin: [4, 5, 6, 5],
            },
          ],
          ...slice.map((point) => [
            {
              text: point.label,
              style: "tableCell",
              margin: [6, 4, 4, 4],
            },
            {
              text: String(point.count),
              style: "tableCellBold",
              alignment: "right",
              margin: [4, 4, 4, 4],
            },
            {
              text: formatMinor(point.revenueMinor),
              style: "tableCell",
              alignment: "right",
              margin: [4, 4, 6, 4],
            },
          ]),
        ],
      },
      layout: {
        hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
          i === 0 || i === node.table.body.length ? 0 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => ADMIN_PDF_COLORS.border,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
    },
  ];
}

function recentReservationsTable(
  reservations: DashboardData["recentReservations"],
): Record<string, unknown> {
  if (reservations.length === 0) {
    return { text: adminCopy.dashboard.charts.empty, style: "muted" };
  }

  return {
    table: {
      widths: [62, "*", "*", 52, 52, 48],
      body: [
        [
          {
            text: adminCopy.dashboard.recent.reference,
            style: "tableHeader",
            fillColor: ADMIN_PDF_COLORS.muted,
            margin: [5, 4, 3, 4],
          },
          {
            text: adminCopy.dashboard.recent.customer,
            style: "tableHeader",
            fillColor: ADMIN_PDF_COLORS.muted,
            margin: [3, 4, 3, 4],
          },
          {
            text: adminCopy.dashboard.recent.route,
            style: "tableHeader",
            fillColor: ADMIN_PDF_COLORS.muted,
            margin: [3, 4, 3, 4],
          },
          {
            text: adminCopy.dashboard.recent.date,
            style: "tableHeader",
            fillColor: ADMIN_PDF_COLORS.muted,
            margin: [3, 4, 3, 4],
          },
          {
            text: adminCopy.dashboard.recent.status,
            style: "tableHeader",
            fillColor: ADMIN_PDF_COLORS.muted,
            margin: [3, 4, 3, 4],
          },
          {
            text: adminCopy.dashboard.recent.total,
            style: "tableHeader",
            fillColor: ADMIN_PDF_COLORS.muted,
            alignment: "right",
            margin: [3, 4, 5, 4],
          },
        ],
        ...reservations.slice(0, 6).map((reservation) => [
          {
            text: reservation.reference,
            style: "tableCellBold",
            margin: [5, 3, 3, 3],
          },
          {
            text: reservation.customerName,
            style: "tableCell",
            margin: [3, 3, 3, 3],
          },
          {
            text: reservation.routeLabel,
            style: "tableCell",
            margin: [3, 3, 3, 3],
          },
          {
            text: formatReportDate(reservation.outboundAt),
            style: "tableCell",
            margin: [3, 3, 3, 3],
          },
          {
            text: formatReservationStatus(reservation.status),
            style: "tableCell",
            margin: [3, 3, 3, 3],
          },
          {
            text: formatMinor(reservation.totalMinor),
            style: "tableCellBold",
            alignment: "right",
            margin: [3, 3, 5, 3],
          },
        ]),
      ],
    },
    layout: {
      hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
        i === 0 || i === node.table.body.length ? 0 : 0.5,
      vLineWidth: () => 0,
      hLineColor: () => ADMIN_PDF_COLORS.border,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  };
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
  const { summary, revenueStats } = data;

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [32, 32, 32, 36],
    defaultStyle: {
      font: "DejaVu",
      fontSize: 8.5,
      lineHeight: 1.28,
      color: ADMIN_PDF_COLORS.ink,
    },
    images: {
      brandLogo: getBrandLogoPath(),
    },
    styles: ADMIN_PDF_STYLES,
    content: [
      pdfBrandHeader({
        subtitle: adminCopy.dashboard.exportPdfSubtitle,
        metaLine: adminCopy.dashboard.exportPdfGeneratedAt(formatGeneratedAt()),
        highlightLabel: adminCopy.dashboard.kpi.totalReservations,
        highlightValue: String(summary.totalReservations),
      }),
      pdfGoldRule(),
      kpiStrip(summary),
      {
        columns: [
          {
            width: "52%",
            stack: [
              pdfSectionTitle(adminCopy.dashboard.revenueSection.title),
              pdfMutedCard([
                pdfFactRow(
                  adminCopy.dashboard.revenueSection.upcoming,
                  `${formatMinor(revenueStats.upcomingMinor)} · ${revenueStats.upcomingCount}`,
                ),
                pdfFactRow(
                  adminCopy.dashboard.revenueSection.completed,
                  `${formatMinor(revenueStats.completedMinor)} · ${revenueStats.completedCount}`,
                ),
                pdfFactRow(
                  adminCopy.dashboard.revenueSection.cancelled,
                  `${formatMinor(revenueStats.cancelledMinor)} · ${revenueStats.cancelledCount}`,
                ),
                {
                  table: {
                    widths: ["*", "auto"],
                    body: [
                      [
                        {
                          text: adminCopy.dashboard.revenueSection.title,
                          bold: true,
                          fillColor: ADMIN_PDF_COLORS.gold,
                          color: ADMIN_PDF_COLORS.ink,
                          margin: [6, 6, 4, 6],
                        },
                        {
                          text: formatMinor(revenueStats.totalMinor),
                          bold: true,
                          alignment: "right",
                          fillColor: ADMIN_PDF_COLORS.gold,
                          color: ADMIN_PDF_COLORS.ink,
                          margin: [4, 6, 6, 6],
                        },
                      ],
                    ],
                  },
                  layout: "noBorders",
                  margin: [0, 6, 0, 0],
                },
                pdfFactRow(
                  adminCopy.dashboard.kpi.cancellationRate,
                  `%${summary.cancellationRate}`,
                ),
                pdfFactRow(
                  adminCopy.dashboard.kpi.totalPassengers,
                  String(summary.totalPassengers),
                ),
                pdfFactRow(
                  adminCopy.dashboard.kpi.oneWay,
                  String(summary.oneWayCount),
                ),
                pdfFactRow(
                  adminCopy.dashboard.kpi.roundTrip,
                  String(summary.roundTripCount),
                ),
              ]),
              pdfSectionTitle(
                `${adminCopy.dashboard.charts.trendTitle} · ${adminCopy.dashboard.charts.trendWeekly}`,
              ),
              pdfMutedCard(trendTable(data.weeklyTrend)),
              pdfSectionTitle(adminCopy.dashboard.charts.weekdayTitle),
              pdfMutedCard(
                breakdownStack(data.weekdayBreakdown, 7),
              ),
            ],
          },
          {
            width: "48%",
            stack: [
              pdfSectionTitle(adminCopy.dashboard.charts.vehiclesTitle),
              pdfMutedCard(breakdownStack(data.vehicleBreakdown)),
              pdfSectionTitle(adminCopy.dashboard.charts.routesTitle),
              pdfMutedCard(breakdownStack(data.routeBreakdown)),
              pdfSectionTitle(adminCopy.dashboard.charts.statusTitle),
              pdfMutedCard(
                breakdownStack(
                  data.statusBreakdown.map((item) => ({
                    name: formatReservationStatus(item.name),
                    count: item.count,
                  })),
                ),
              ),
            ],
          },
        ],
        columnGap: 10,
      },
      pdfSectionTitle(adminCopy.dashboard.recent.title),
      pdfMutedCard([recentReservationsTable(data.recentReservations)]),
      {
        text: adminCopy.dashboard.exportPdfFooter(formatGeneratedAt()),
        style: "footer",
        margin: [0, 10, 0, 0],
      },
    ],
  };

  const pdfDocument = createAdminPdfDocument(docDefinition);

  return pdfDocument.getBuffer();
}
