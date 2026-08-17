import "server-only";

import { PROJECT_TIME_ZONE } from "@/config/constants";
import {
  ADMIN_LOCALE,
  adminCopy,
  formatReservationStatus,
  formatTripType,
} from "@/features/admin/copy";
import { formatReservationOutboundDate } from "@/features/admin/lib/format-admin-datetime";
import {
  partitionReservationLineItems,
  resolveReservationLuggageCount,
} from "@/features/admin/lib/partition-reservation-items";
import {
  ADMIN_PDF_COLORS,
  createAdminPdfDocument,
  getBrandLogoPath,
} from "@/features/admin/server/pdfmake-config";
import type { AdminReservationDetail } from "@/features/admin/server/reservation-admin-repository";
import {
  formatPassengerDisplayLine,
  resolvePassengerKindLabel,
} from "@/features/booking/lib/passenger-details";
import { formatMoney } from "@/lib/money";

function formatPrice(amountMinor: number, currency: string): string {
  return formatMoney({ amountMinor, currency }, ADMIN_LOCALE);
}

function formatCreatedAt(date: Date): string {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    timeZone: PROJECT_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function factRow(label: string, value: string): Record<string, unknown> {
  return {
    columns: [
      { width: "42%", text: label, style: "factLabel" },
      { width: "58%", text: value, style: "factValue" },
    ],
    margin: [0, 0, 0, 3],
  };
}

function sectionTitle(text: string): Record<string, unknown> {
  return {
    text: text.toUpperCase(),
    style: "sectionEyebrow",
    margin: [0, 10, 0, 5],
  };
}

function mutedCard(stack: Record<string, unknown>[]): Record<string, unknown> {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack,
            margin: [10, 8, 10, 8],
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

function goldRule(): Record<string, unknown> {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 523,
        y2: 0,
        lineWidth: 1.5,
        lineColor: ADMIN_PDF_COLORS.gold,
      },
    ],
    margin: [0, 6, 0, 10],
  };
}

export function buildReservationPdfFilename(reference: string): string {
  const safeReference = reference.replace(/[^\w-]+/g, "-");

  return `${adminCopy.reservations.detail.exportFilename}-${safeReference}.pdf`;
}

export async function buildReservationPdfBuffer(
  reservation: AdminReservationDetail,
): Promise<Buffer> {
  const { transferVehicles, extraLines } = partitionReservationLineItems(
    reservation.items,
  );
  const luggageCount = resolveReservationLuggageCount(
    reservation.largeLuggageCount,
    reservation.cabinLuggageCount,
  );

  const transferFacts: Array<{ label: string; value: string }> = [
    {
      label: adminCopy.reservations.fields.tripType,
      value: formatTripType(reservation.tripType),
    },
    {
      label: adminCopy.reservations.fields.outbound,
      value: formatReservationOutboundDate(reservation.outboundAt),
    },
    {
      label: adminCopy.reservations.fields.passengers,
      value: String(reservation.passengerCount),
    },
    {
      label: adminCopy.reservations.detail.luggage,
      value: String(luggageCount),
    },
    {
      label: adminCopy.reservations.detail.createdAt,
      value: formatCreatedAt(reservation.createdAt),
    },
  ];

  if (reservation.returnAt) {
    transferFacts.splice(2, 0, {
      label: adminCopy.reservations.fields.return,
      value: formatReservationOutboundDate(reservation.returnAt),
    });
  }

  if (reservation.outboundFlightNumber) {
    transferFacts.push({
      label: adminCopy.reservations.fields.outboundFlight,
      value: reservation.outboundFlightNumber,
    });
  }

  if (reservation.returnFlightNumber) {
    transferFacts.push({
      label: adminCopy.reservations.fields.returnFlight,
      value: reservation.returnFlightNumber,
    });
  }

  const routeFacts: Array<{ label: string; value: string }> = [
    {
      label: adminCopy.reservations.table.origin,
      value: reservation.originName,
    },
    {
      label: adminCopy.reservations.table.pricingDestination,
      value: reservation.pricingDestinationName,
    },
    {
      label: adminCopy.reservations.table.actualDropoff,
      value: reservation.actualDropoffLabel,
    },
  ];

  if (reservation.hotelName) {
    routeFacts.push({
      label: adminCopy.reservations.fields.hotel,
      value: reservation.hotelName,
    });
  }

  if (reservation.customDestinationName) {
    routeFacts.push({
      label: adminCopy.reservations.fields.customDestination,
      value: reservation.customDestinationName,
    });
  }

  if (reservation.customDestinationAddress) {
    routeFacts.push({
      label: adminCopy.reservations.fields.customAddress,
      value: reservation.customDestinationAddress,
    });
  }

  const passengerLines =
    reservation.passengerDetails?.slice(0, 6).map((passenger) => {
      const kindLabel = resolvePassengerKindLabel(passenger, {
        adult: adminCopy.reservations.detail.passengerAdult,
        child: adminCopy.reservations.detail.passengerChild,
        infant: adminCopy.reservations.detail.passengerInfant,
      });

      return formatPassengerDisplayLine(passenger, kindLabel);
    }) ?? [];

  if (
    reservation.passengerDetails &&
    reservation.passengerDetails.length > 6
  ) {
    passengerLines.push(
      adminCopy.reservations.detail.exportPassengersMore(
        reservation.passengerDetails.length - 6,
      ),
    );
  }

  const vehicleRows = transferVehicles.map((vehicle) => ({
    columns: [
      {
        width: "*",
        stack: [
          { text: vehicle.snapshotName, style: "lineItemTitle" },
          {
            text: `${adminCopy.reservations.table.qty}: ${vehicle.quantity}`,
            style: "lineItemMeta",
          },
        ],
      },
      {
        width: "auto",
        text:
          vehicle.totalPriceMinor === 0
            ? adminCopy.reservations.detail.included
            : formatPrice(vehicle.totalPriceMinor, reservation.currency),
        style: "lineItemPrice",
        alignment: "right",
      },
    ],
    margin: [0, 0, 0, 6],
  }));

  const extraRows = extraLines.map((extra) => ({
    columns: [
      {
        width: "*",
        stack: [
          {
            text: extra.isLuggageOverflowVehicle
              ? adminCopy.reservations.detail.luggageVehicle
              : extra.snapshotName,
            style: "lineItemTitle",
          },
          {
            text: `${adminCopy.reservations.table.qty}: ${extra.quantity}`,
            style: "lineItemMeta",
          },
        ],
      },
      {
        width: "auto",
        text:
          extra.totalPriceMinor === 0
            ? adminCopy.reservations.detail.included
            : formatPrice(extra.totalPriceMinor, reservation.currency),
        style: "lineItemPrice",
        alignment: "right",
      },
    ],
    margin: [0, 0, 0, 6],
  }));

  const notesText = reservation.notes?.trim() ?? "";
  const truncatedNotes =
    notesText.length > 220 ? `${notesText.slice(0, 217)}…` : notesText;

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 42],
    defaultStyle: {
      font: "DejaVu",
      fontSize: 9,
      lineHeight: 1.3,
      color: ADMIN_PDF_COLORS.ink,
    },
    images: {
      brandLogo: getBrandLogoPath(),
    },
    styles: {
      brandTitle: {
        fontSize: 15,
        bold: true,
        color: ADMIN_PDF_COLORS.goldBright,
      },
      brandSubtitle: {
        fontSize: 8,
        color: ADMIN_PDF_COLORS.goldLight,
        margin: [0, 2, 0, 0],
      },
      reference: {
        fontSize: 11,
        bold: true,
        color: ADMIN_PDF_COLORS.white,
        margin: [0, 6, 0, 0],
      },
      statusPill: {
        fontSize: 8,
        bold: true,
        color: ADMIN_PDF_COLORS.goldBright,
      },
      totalHero: {
        fontSize: 14,
        bold: true,
        color: ADMIN_PDF_COLORS.goldBright,
        alignment: "right",
      },
      routeHero: {
        fontSize: 11,
        bold: true,
        color: ADMIN_PDF_COLORS.goldBright,
        alignment: "center",
      },
      sectionEyebrow: {
        fontSize: 8,
        bold: true,
        color: ADMIN_PDF_COLORS.goldDeep,
      },
      factLabel: {
        fontSize: 8,
        color: ADMIN_PDF_COLORS.textMuted,
      },
      factValue: {
        fontSize: 9,
        bold: true,
      },
      lineItemTitle: { fontSize: 9, bold: true },
      lineItemMeta: {
        fontSize: 8,
        color: ADMIN_PDF_COLORS.textMuted,
        margin: [0, 1, 0, 0],
      },
      lineItemPrice: { fontSize: 9, bold: true },
      passengerLine: { fontSize: 8.5, margin: [0, 0, 0, 2] },
      footer: {
        fontSize: 7.5,
        color: ADMIN_PDF_COLORS.textMuted,
        alignment: "center",
      },
      muted: { fontSize: 8, color: ADMIN_PDF_COLORS.textMuted },
    },
    content: [
      {
        table: {
          widths: [50, "*", 120],
          body: [
            [
              {
                image: "brandLogo",
                width: 42,
                margin: [10, 10, 0, 10],
                fillColor: ADMIN_PDF_COLORS.ink,
              },
              {
                stack: [
                  { text: adminCopy.brand.title, style: "brandTitle" },
                  {
                    text: adminCopy.reservations.detail.exportPdfSubtitle,
                    style: "brandSubtitle",
                  },
                  { text: reservation.reference, style: "reference" },
                ],
                fillColor: ADMIN_PDF_COLORS.ink,
                margin: [4, 10, 8, 10],
              },
              {
                stack: [
                  {
                    text: formatReservationStatus(reservation.status),
                    style: "statusPill",
                    alignment: "right",
                  },
                  {
                    text: formatPrice(
                      reservation.totalMinor,
                      reservation.currency,
                    ),
                    style: "totalHero",
                    margin: [0, 4, 0, 0],
                  },
                ],
                fillColor: ADMIN_PDF_COLORS.inkSoft,
                margin: [8, 12, 10, 10],
              },
            ],
          ],
        },
        layout: "noBorders",
      },
      goldRule(),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: reservation.snapshotRouteLabel,
                style: "routeHero",
                fillColor: ADMIN_PDF_COLORS.inkElevated,
                margin: [12, 10, 12, 10],
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 4],
      },
      {
        columns: [
          {
            width: "58%",
            stack: [
              sectionTitle(adminCopy.reservations.detail.transferSummary),
              mutedCard(transferFacts.map((fact) => factRow(fact.label, fact.value))),
              sectionTitle(adminCopy.reservations.detail.route),
              mutedCard(routeFacts.map((fact) => factRow(fact.label, fact.value))),
              sectionTitle(adminCopy.reservations.detail.customer),
              mutedCard([
                factRow(
                  adminCopy.reservations.fields.name,
                  reservation.customerName,
                ),
                factRow(
                  adminCopy.reservations.fields.email,
                  reservation.customerEmail,
                ),
                factRow(
                  adminCopy.reservations.fields.phone,
                  reservation.customerPhone,
                ),
                ...(reservation.customerWhatsappPhone
                  ? [
                      factRow(
                        adminCopy.reservations.detail.whatsapp,
                        reservation.customerWhatsappPhone,
                      ),
                    ]
                  : []),
              ]),
              sectionTitle(adminCopy.reservations.detail.passengerDetails),
              mutedCard(
                passengerLines.length > 0
                  ? passengerLines.map((line) => ({
                      text: line,
                      style: "passengerLine",
                    }))
                  : [
                      {
                        text: adminCopy.reservations.detail.passengerDetailsEmpty,
                        style: "muted",
                      },
                    ],
              ),
              ...(truncatedNotes
                ? [
                    sectionTitle(adminCopy.reservations.detail.notes),
                    mutedCard([
                      { text: truncatedNotes, style: "factValue" },
                    ]),
                  ]
                : []),
            ],
          },
          {
            width: "42%",
            stack: [
              sectionTitle(adminCopy.reservations.detail.pricingSummary),
              mutedCard([
                {
                  text: adminCopy.reservations.detail.pricingVehicles,
                  style: "sectionEyebrow",
                  margin: [0, 0, 0, 6],
                },
                ...(vehicleRows.length > 0
                  ? vehicleRows
                  : [
                      {
                        text: adminCopy.reservations.detail.noVehicles,
                        style: "muted",
                      },
                    ]),
                ...(extraLines.length > 0
                  ? [
                      {
                        text: adminCopy.reservations.detail.pricingExtras,
                        style: "sectionEyebrow",
                        margin: [0, 10, 0, 6],
                      },
                      ...extraRows,
                    ]
                  : []),
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: 0,
                      x2: 180,
                      y2: 0,
                      lineWidth: 0.75,
                      lineColor: ADMIN_PDF_COLORS.border,
                    },
                  ],
                  margin: [0, 8, 0, 8],
                },
                factRow(
                  adminCopy.reservations.fields.subtotal,
                  formatPrice(reservation.subtotalMinor, reservation.currency),
                ),
                {
                  table: {
                    widths: ["*", "auto"],
                    body: [
                      [
                        {
                          text: adminCopy.reservations.fields.total,
                          bold: true,
                          fillColor: ADMIN_PDF_COLORS.gold,
                          color: ADMIN_PDF_COLORS.ink,
                          margin: [8, 8, 4, 8],
                        },
                        {
                          text: formatPrice(
                            reservation.totalMinor,
                            reservation.currency,
                          ),
                          bold: true,
                          alignment: "right",
                          fillColor: ADMIN_PDF_COLORS.gold,
                          color: ADMIN_PDF_COLORS.ink,
                          margin: [4, 8, 8, 8],
                        },
                      ],
                    ],
                  },
                  layout: "noBorders",
                  margin: [0, 4, 0, 0],
                },
              ]),
            ],
          },
        ],
        columnGap: 14,
      },
      {
        text: adminCopy.reservations.detail.exportPdfFooter(
          formatCreatedAt(new Date()),
        ),
        style: "footer",
        margin: [0, 14, 0, 0],
      },
    ],
  };

  const pdfDocument = createAdminPdfDocument(docDefinition);

  return pdfDocument.getBuffer();
}
