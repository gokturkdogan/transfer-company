import { APP_NAME, isRtlLocale } from "@/config/constants";
import { formatPrice } from "@/features/booking/lib/format-price";
import {
  escapeHtml,
  formatReservationDateTime,
} from "@/server/notifications/email/email-utils";
import {
  getReservationEmailMessages,
  interpolate,
} from "@/server/notifications/messages/reservation-email";
import type { ReservationNotificationPayload } from "@/server/notifications/types";

const BRAND = {
  ink: "#12121a",
  gold: "#c8a45d",
  goldLight: "#e9d7a8",
  surface: "#f7f6f3",
  border: "#e8e4dc",
  muted: "#6b6b76",
  white: "#ffffff",
} as const;

type EmailLayoutInput = {
  locale: string;
  title: string;
  preheader: string;
  bodyHtml: string;
  footerNote?: string;
};

function renderEmailLayout(input: EmailLayoutInput): string {
  const dir = isRtlLocale(input.locale) ? "rtl" : "ltr";
  const lang = input.locale;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.surface};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.ink};padding:28px 32px 24px;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.goldLight};margin-bottom:10px;">${escapeHtml(APP_NAME)}</div>
              <div style="height:3px;width:56px;background:linear-gradient(90deg,${BRAND.gold},${BRAND.goldLight});border-radius:999px;margin-bottom:18px;"></div>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:600;color:${BRAND.white};">${escapeHtml(input.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;color:${BRAND.muted};font-size:13px;line-height:1.6;">
              ${input.footerNote ? `<p style="margin:0 0 8px;">${escapeHtml(input.footerNote)}</p>` : ""}
              <p style="margin:0;">© ${new Date().getFullYear()} ${escapeHtml(APP_NAME)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderDetailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;width:38%;color:${BRAND.muted};font-size:14px;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;font-size:14px;font-weight:500;">${escapeHtml(value)}</td>
  </tr>`;
}

function renderSection(title: string, rows: string): string {
  return `<div style="margin-bottom:24px;">
    <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(title)}</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
  </div>`;
}

function renderReferenceBadge(reference: string, label: string): string {
  return `<div style="margin:0 0 24px;padding:18px 20px;border-radius:14px;background:${BRAND.surface};border:1px solid ${BRAND.border};">
    <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};margin-bottom:6px;">${escapeHtml(label)}</div>
    <div style="font-size:28px;line-height:1.1;font-weight:700;letter-spacing:0.06em;color:${BRAND.ink};">${escapeHtml(reference)}</div>
  </div>`;
}

function buildTripDetails(payload: ReservationNotificationPayload) {
  const messages = getReservationEmailMessages(payload.locale);
  const tripTypeLabel =
    payload.tripType === "ROUND_TRIP"
      ? messages.tripTypeRoundTrip
      : messages.tripTypeOneWay;

  const luggageParts = [
  payload.largeLuggageCount > 0
    ? `${payload.largeLuggageCount} large`
    : null,
  payload.cabinLuggageCount > 0
    ? `${payload.cabinLuggageCount} cabin`
    : null,
  ].filter(Boolean);

  const rows = [
    renderDetailRow(messages.tripTypeLabel, tripTypeLabel),
    renderDetailRow(messages.routeLabel, payload.snapshotRouteLabel),
    payload.snapshotDropoffLabel
      ? renderDetailRow(messages.dropoffLabel, payload.snapshotDropoffLabel)
      : "",
    renderDetailRow(
      messages.outboundLabel,
      formatReservationDateTime(payload.outboundAt, payload.locale),
    ),
    payload.returnAt
      ? renderDetailRow(
          messages.returnLabel,
          formatReservationDateTime(payload.returnAt, payload.locale),
        )
      : "",
    renderDetailRow(
      messages.passengersLabel,
      String(payload.passengerCount),
    ),
    payload.infantCount > 0
      ? renderDetailRow(messages.infantsLabel, String(payload.infantCount))
      : "",
    luggageParts.length > 0
      ? renderDetailRow(messages.luggageLabel, luggageParts.join(", "))
      : "",
    payload.outboundFlightNumber
      ? renderDetailRow(
          messages.outboundFlightLabel,
          payload.outboundFlightNumber,
        )
      : "",
    payload.returnFlightNumber
      ? renderDetailRow(
          messages.returnFlightLabel,
          payload.returnFlightNumber,
        )
      : "",
  ].join("");

  return { messages, rows };
}

function buildItemsTable(payload: ReservationNotificationPayload): string {
  const messages = getReservationEmailMessages(payload.locale);

  const itemRows = payload.items
    .map((item) => {
      const label = interpolate(messages.quantityLabel, {
        quantity: item.quantity,
      });
      const price = formatPrice(
        item.totalPriceMinor,
        payload.currency,
        payload.locale,
      );

      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;">${escapeHtml(label)} ${escapeHtml(item.name)}</td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;font-weight:500;white-space:nowrap;">${escapeHtml(price)}</td>
      </tr>`;
    })
    .join("");

  const subtotal = formatPrice(
    payload.subtotalMinor,
    payload.currency,
    payload.locale,
  );
  const total = formatPrice(
    payload.totalMinor,
    payload.currency,
    payload.locale,
  );

  return `<div style="margin-bottom:24px;">
    <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(messages.itemsLabel)}</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${itemRows}
      <tr>
        <td style="padding:14px 0 6px;font-size:14px;color:${BRAND.muted};">${escapeHtml(messages.subtotalLabel)}</td>
        <td align="right" style="padding:14px 0 6px;font-size:14px;">${escapeHtml(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0 0;font-size:16px;font-weight:700;border-top:2px solid ${BRAND.ink};">${escapeHtml(messages.totalLabel)}</td>
        <td align="right" style="padding:6px 0 0;font-size:18px;font-weight:700;border-top:2px solid ${BRAND.ink};color:${BRAND.ink};">${escapeHtml(total)}</td>
      </tr>
    </table>
  </div>`;
}

export function buildCustomerReservationEmail(
  payload: ReservationNotificationPayload,
): { subject: string; html: string; text: string } {
  const messages = getReservationEmailMessages(payload.locale);
  const subject = interpolate(messages.customerSubject, {
    reference: payload.reference,
  });
  const { rows } = buildTripDetails(payload);

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(interpolate(messages.greeting, { name: payload.customer.firstName }))}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${BRAND.muted};">${escapeHtml(messages.customerIntro)}</p>
    ${renderReferenceBadge(payload.reference, messages.referenceLabel)}
    ${renderSection(messages.routeLabel, rows)}
    ${buildItemsTable(payload)}
    ${
      payload.notes
        ? renderSection(
            messages.notesLabel,
            renderDetailRow(messages.notesLabel, payload.notes),
          )
        : ""
    }
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">${escapeHtml(messages.timezoneNote)}</p>
  `;

  const html = renderEmailLayout({
    locale: payload.locale,
    title: subject,
    preheader: messages.customerIntro,
    bodyHtml,
    footerNote: messages.footerHelp,
  });

  const text = [
    interpolate(messages.greeting, { name: payload.customer.firstName }),
    "",
    messages.customerIntro,
    "",
    `${messages.referenceLabel}: ${payload.reference}`,
    `${messages.routeLabel}: ${payload.snapshotRouteLabel}`,
    `${messages.outboundLabel}: ${formatReservationDateTime(payload.outboundAt, payload.locale)}`,
    `${messages.totalLabel}: ${formatPrice(payload.totalMinor, payload.currency, payload.locale)}`,
    "",
    messages.timezoneNote,
  ].join("\n");

  return { subject, html, text };
}

export function buildAdminReservationEmail(
  payload: ReservationNotificationPayload,
  options: { adminUrl: string; contactEmail: string },
): { subject: string; html: string; text: string } {
  const messages = getReservationEmailMessages(payload.locale);
  const customerName = `${payload.customer.firstName} ${payload.customer.lastName}`;
  const subject = interpolate(messages.adminSubject, {
    reference: payload.reference,
  });
  const { rows } = buildTripDetails(payload);

  const customerRows = [
    renderDetailRow(messages.customerNameLabel, customerName),
    renderDetailRow(messages.emailLabel, payload.customer.email),
    renderDetailRow(messages.phoneLabel, payload.customer.phone),
    payload.customer.whatsappPhone
      ? renderDetailRow(messages.whatsappLabel, payload.customer.whatsappPhone)
      : "",
  ].join("");

  const bodyHtml = `
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${BRAND.muted};">${escapeHtml(messages.adminIntro)}</p>
    ${renderReferenceBadge(payload.reference, messages.referenceLabel)}
    ${renderSection(messages.customerNameLabel, customerRows)}
    ${renderSection(messages.routeLabel, rows)}
    ${buildItemsTable(payload)}
    ${
      payload.notes
        ? renderSection(
            messages.notesLabel,
            renderDetailRow(messages.notesLabel, payload.notes),
          )
        : ""
    }
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${escapeHtml(options.adminUrl)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:${BRAND.ink};color:${BRAND.white};text-decoration:none;font-size:14px;font-weight:600;">${escapeHtml(messages.adminViewReservation)}</a>
    </p>
  `;

  const html = renderEmailLayout({
    locale: payload.locale,
    title: subject,
    preheader: messages.adminIntro,
    bodyHtml,
    footerNote: options.contactEmail,
  });

  const text = [
    messages.adminIntro,
    "",
    `${messages.referenceLabel}: ${payload.reference}`,
    `${messages.customerNameLabel}: ${customerName}`,
    `${messages.emailLabel}: ${payload.customer.email}`,
    `${messages.phoneLabel}: ${payload.customer.phone}`,
    `${messages.totalLabel}: ${formatPrice(payload.totalMinor, payload.currency, payload.locale)}`,
    "",
    `${messages.adminViewReservation}: ${options.adminUrl}`,
  ].join("\n");

  return { subject, html, text };
}
