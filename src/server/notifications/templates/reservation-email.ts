import { APP_NAME, isRtlLocale } from "@/config/constants";
import { BRAND_IMAGES } from "@/config/brand";
import { siteConfig } from "@/config/site";
import type { ReservationStatus } from "@/db/schema/enums";
import { formatPrice } from "@/features/booking/lib/format-price";
import {
  formatPassengerDisplayLine,
  resolvePassengerKindLabel,
} from "@/features/booking/lib/passenger-details";
import {
  escapeHtml,
  formatMultilineHtml,
  formatReservationDateTime,
  toAbsoluteAssetUrl,
} from "@/server/notifications/email/email-utils";
import {
  getReservationEmailMessages,
  getReservationStatusIntro,
  getReservationStatusLabel,
  interpolate,
  type ReservationEmailMessages,
} from "@/server/notifications/messages/reservation-email";
import type {
  ReservationEmailLineItem,
  ReservationNotificationPayload,
  ReservationPassengerNotification,
  ReservationStatusUpdateNotificationPayload,
} from "@/server/notifications/types";

const BRAND = {
  page: "#08080c",
  card: "#101019",
  header: "#0c0c14",
  panel: "#17171f",
  panelSoft: "#14141d",
  border: "#262633",
  borderSoft: "#1e1e29",
  gold: "#c8a45d",
  goldLight: "#e9d7a8",
  goldBright: "#f5e8c4",
  goldDeep: "#9c7c42",
  goldTint: "#231f14",
  white: "#ffffff",
  text: "#e6e6ec",
  muted: "#9a9aa8",
  mutedDark: "#6f6f80",
} as const;

const SERIF = "Georgia,'Times New Roman',Times,serif";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const CONTENT_WIDTH = 640;
const INNER_WIDTH = 576;
const LOGO_WIDTH = 240;

export type ReservationEmailContact = {
  phone?: string;
  email?: string;
  whatsapp?: string;
};

/** Gmail respects bgcolor + inline background-color with !important. */
function bg(color: string, extra = ""): string {
  return `bgcolor="${color}" style="background-color:${color} !important;${extra}"`;
}

function colorStyle(color: string, extra = ""): string {
  return `style="color:${color} !important;${extra}"`;
}

function renderEmailStyles(): string {
  return `<style type="text/css">
    body, table, td, div, p, span, a, h1 {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    .email-page { background-color: ${BRAND.page} !important; }
    .email-card { background-color: ${BRAND.card} !important; }
    .email-header { background-color: ${BRAND.header} !important; }
    .email-panel { background-color: ${BRAND.panel} !important; }
    .email-panel-soft { background-color: ${BRAND.panelSoft} !important; }
    .email-text { color: ${BRAND.text} !important; }
    .email-muted { color: ${BRAND.muted} !important; }
    .email-white { color: ${BRAND.white} !important; }
    .email-gold { color: ${BRAND.gold} !important; }
    .email-gold-light { color: ${BRAND.goldLight} !important; }
    .email-gold-bright { color: ${BRAND.goldBright} !important; }
    u + .body .email-page { background-color: ${BRAND.page} !important; }
    u + .body .email-card { background-color: ${BRAND.card} !important; }
    [data-ogsc] .email-card,
    [data-ogsb] .email-card { background-color: ${BRAND.card} !important; }
    [data-ogsc] .email-header,
    [data-ogsb] .email-header { background-color: ${BRAND.header} !important; }
    [data-ogsc] .email-panel,
    [data-ogsb] .email-panel { background-color: ${BRAND.panel} !important; }
    [data-ogsc] .email-panel-soft,
    [data-ogsb] .email-panel-soft { background-color: ${BRAND.panelSoft} !important; }
    [data-ogsc] .email-text,
    [data-ogsb] .email-text { color: ${BRAND.text} !important; }
    [data-ogsc] .email-white,
    [data-ogsb] .email-white { color: ${BRAND.white} !important; }
    @media (prefers-color-scheme: dark) {
      .email-page { background-color: ${BRAND.page} !important; }
      .email-card { background-color: ${BRAND.card} !important; }
      .email-header { background-color: ${BRAND.header} !important; }
      .email-text { color: ${BRAND.text} !important; }
    }
  </style>`;
}

function renderLogo(footer = false): string {
  const width = footer ? 160 : LOGO_WIDTH;

  return `<img
    src="${escapeHtml(BRAND_IMAGES.logo)}"
    alt="${escapeHtml(APP_NAME)}"
    width="${width}"
    style="display:block;margin:0 auto ${footer ? "12px" : "18px"};width:${width}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"
  />`;
}

function resolveContact(
  contact: ReservationEmailContact | undefined,
): Required<ReservationEmailContact> {
  return {
    phone: contact?.phone ?? siteConfig.phone,
    email: contact?.email ?? siteConfig.email,
    whatsapp: contact?.whatsapp ?? siteConfig.whatsapp,
  };
}

function renderSectionHeading(title: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 16px;")}>
    <tr>
      <td ${bg(BRAND.card)} ${colorStyle(BRAND.gold, `font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;white-space:nowrap;padding:0 12px 0 0;`)}>${escapeHtml(title)}</td>
      <td ${bg(BRAND.card)} style="width:100%;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td ${bg(BRAND.border, "height:1px;font-size:0;line-height:0;")}>&nbsp;</td></tr></table></td>
    </tr>
  </table>`;
}

function renderDetailRow(label: string, value: string): string {
  return `<tr>
    <td ${bg(BRAND.card, `padding:11px 0;border-bottom:1px solid ${BRAND.borderSoft};vertical-align:top;width:40%;`)} ${colorStyle(BRAND.mutedDark, `font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;`)}>${escapeHtml(label)}</td>
    <td ${bg(BRAND.card, `padding:11px 0;border-bottom:1px solid ${BRAND.borderSoft};vertical-align:top;`)} ${colorStyle(BRAND.text, `font-family:${SANS};font-size:14px;font-weight:500;`)}>${escapeHtml(value)}</td>
  </tr>`;
}

function renderChip(textValue: string): string {
  return `<span ${colorStyle(BRAND.goldLight, `display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border:1px solid ${BRAND.goldDeep};border-radius:999px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.06em;`)}>${escapeHtml(textValue)}</span>`;
}

function renderStatusBadge(
  status: ReservationStatus,
  messages: ReservationEmailMessages,
): string {
  const label = getReservationStatusLabel(status, messages);

  return `<span ${bg(BRAND.goldTint, `display:inline-block;padding:6px 14px;border-radius:999px;border:1px solid ${BRAND.goldDeep};`)} ${colorStyle(BRAND.goldLight, `font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.08em;`)}>${escapeHtml(label)}</span>`;
}

function renderReferencePanel(
  payload: ReservationNotificationPayload,
  messages: ReservationEmailMessages,
  status: ReservationStatus = "PENDING",
): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel" ${bg(BRAND.panel, `margin:0 0 32px;border:1px solid ${BRAND.border};border-radius:14px;`)}>
    <tr>
      <td ${bg(BRAND.gold, "width:3px;font-size:0;line-height:0;")}>&nbsp;</td>
      <td ${bg(BRAND.panel, "padding:22px 24px;")}>
        <div class="email-gold" ${colorStyle(BRAND.gold, `font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:8px;`)}>${escapeHtml(messages.referenceLabel)}</div>
        <div class="email-white" ${colorStyle(BRAND.white, `font-family:${SERIF};font-size:30px;line-height:1.1;font-weight:700;letter-spacing:0.1em;margin-bottom:14px;`)}>${escapeHtml(payload.reference)}</div>
        ${renderStatusBadge(status, messages)}
      </td>
    </tr>
  </table>`;
}

function renderStatusChangePanel(
  payload: ReservationStatusUpdateNotificationPayload,
  messages: ReservationEmailMessages,
): string {
  const previousLabel = getReservationStatusLabel(
    payload.previousStatus,
    messages,
  );
  const nextLabel = getReservationStatusLabel(payload.nextStatus, messages);

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel-soft" ${bg(BRAND.panelSoft, `margin:0 0 32px;border:1px solid ${BRAND.borderSoft};border-radius:14px;`)}>
    <tr>
      <td ${bg(BRAND.panelSoft, "padding:20px 24px;")}>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${renderDetailRow(messages.previousStatusLabel, previousLabel)}
          ${renderDetailRow(messages.statusLabel, nextLabel)}
        </table>
      </td>
    </tr>
  </table>`;
}

function renderRouteBlock(
  payload: ReservationNotificationPayload,
  messages: ReservationEmailMessages,
): string {
  const [origin, destination] = payload.snapshotRouteLabel
    .split("→")
    .map((part) => part.trim());

  if (!origin || !destination) {
    return `<div class="email-white" ${colorStyle(BRAND.white, `font-family:${SERIF};font-size:19px;`)}>${escapeHtml(payload.snapshotRouteLabel)}</div>`;
  }

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel-soft" ${bg(BRAND.panelSoft, `margin:0 0 22px;border:1px solid ${BRAND.borderSoft};border-radius:14px;`)}>
    <tr>
      <td ${bg(BRAND.panelSoft, "padding:20px 24px;")}>
        <div ${colorStyle(BRAND.mutedDark, `font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;`)}>${escapeHtml(messages.outboundLabel)}</div>
        <div class="email-white" ${colorStyle(BRAND.white, `font-family:${SERIF};font-size:18px;line-height:1.35;`)}>${escapeHtml(origin)}</div>
        <div class="email-gold" ${colorStyle(BRAND.gold, `font-family:${SANS};font-size:18px;line-height:1;padding:10px 0;`)}>&#8595;</div>
        <div class="email-white" ${colorStyle(BRAND.white, `font-family:${SERIF};font-size:18px;line-height:1.35;`)}>${escapeHtml(destination)}</div>
      </td>
    </tr>
  </table>`;
}

function renderVehicleSection(
  payload: ReservationNotificationPayload,
  messages: ReservationEmailMessages,
): string {
  const vehicles = payload.items.filter(
    (item) => item.type === "TRANSFER_VEHICLE",
  );

  if (vehicles.length === 0) {
    return "";
  }

  const cards = vehicles
    .map((vehicle) => {
      const chips = [
        vehicle.passengerCapacity
          ? interpolate(messages.capacityPassengers, {
              count: vehicle.passengerCapacity,
            })
          : null,
        vehicle.largeLuggageCapacity
          ? interpolate(messages.capacityLargeLuggage, {
              count: vehicle.largeLuggageCapacity,
            })
          : null,
        vehicle.cabinLuggageCapacity
          ? interpolate(messages.capacityCabinLuggage, {
              count: vehicle.cabinLuggageCapacity,
            })
          : null,
      ]
        .filter((chip): chip is string => Boolean(chip))
        .map(renderChip)
        .join("");

      const image = vehicle.imageUrl
        ? `<tr>
            <td ${bg(BRAND.panelSoft, "padding:0;font-size:0;line-height:0;")}>
              <img src="${escapeHtml(toAbsoluteAssetUrl(vehicle.imageUrl))}" alt="${escapeHtml(vehicle.name)}" width="${INNER_WIDTH}" style="display:block;width:100%;max-width:${INNER_WIDTH}px;height:auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>`
        : "";

      const quantityBadge =
        vehicle.quantity > 1
          ? `<span ${bg(BRAND.gold, `display:inline-block;margin-left:8px;padding:3px 9px;border-radius:6px;`)} ${colorStyle(BRAND.page, `font-family:${SANS};font-size:11px;font-weight:700;`)}>${escapeHtml(
              interpolate(messages.quantityLabel, {
                quantity: vehicle.quantity,
              }),
            )}</span>`
          : "";

      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel-soft" ${bg(BRAND.panelSoft, `margin:0 0 16px;border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;`)}>
        ${image}
        <tr>
          <td ${bg(BRAND.panelSoft, "padding:20px 22px;")}>
            <div class="email-white" ${colorStyle(BRAND.white, `font-family:${SERIF};font-size:20px;line-height:1.3;margin-bottom:12px;`)}>${escapeHtml(vehicle.name)}${quantityBadge}</div>
            <div>${chips}</div>
          </td>
        </tr>
      </table>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 32px;")}>
    <tr><td ${bg(BRAND.card)}>${renderSectionHeading(messages.vehicleSectionLabel)}${cards}</td></tr>
  </table>`;
}

function renderJourneySection(
  payload: ReservationNotificationPayload,
  messages: ReservationEmailMessages,
): string {
  const tripTypeLabel =
    payload.tripType === "ROUND_TRIP"
      ? messages.tripTypeRoundTrip
      : messages.tripTypeOneWay;

  const luggageParts = [
    payload.largeLuggageCount > 0
      ? interpolate(messages.largeLuggageValue, {
          count: payload.largeLuggageCount,
        })
      : null,
    payload.cabinLuggageCount > 0
      ? interpolate(messages.cabinLuggageValue, {
          count: payload.cabinLuggageCount,
        })
      : null,
  ].filter((part): part is string => Boolean(part));

  const rows = [
    renderDetailRow(messages.tripTypeLabel, tripTypeLabel),
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
    payload.outboundFlightNumber
      ? renderDetailRow(
          messages.outboundFlightLabel,
          payload.outboundFlightNumber,
        )
      : "",
    payload.returnFlightNumber
      ? renderDetailRow(messages.returnFlightLabel, payload.returnFlightNumber)
      : "",
    renderDetailRow(messages.passengersLabel, String(payload.passengerCount)),
    payload.infantCount > 0
      ? renderDetailRow(messages.infantsLabel, String(payload.infantCount))
      : "",
    luggageParts.length > 0
      ? renderDetailRow(messages.luggageLabel, luggageParts.join(" · "))
      : "",
  ].join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 32px;")}>
    <tr>
      <td ${bg(BRAND.card)}>
        ${renderSectionHeading(messages.journeySectionLabel)}
        ${renderRouteBlock(payload, messages)}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
      </td>
    </tr>
  </table>`;
}

function renderExtrasSection(
  payload: ReservationNotificationPayload,
  messages: ReservationEmailMessages,
): string {
  const extras = payload.items.filter(
    (item) => item.type === "EXTRA_SERVICE",
  );

  if (extras.length === 0) {
    return "";
  }

  const rows = extras
    .map((extra) => {
      const priceLabel =
        extra.totalPriceMinor === 0
          ? messages.includedLabel
          : formatPrice(
              extra.totalPriceMinor,
              payload.currency,
              payload.locale,
            );

      const priceColor =
        extra.totalPriceMinor === 0 ? BRAND.goldLight : BRAND.text;

      const quantityLabel =
        extra.quantity > 1
          ? `<span ${colorStyle(BRAND.mutedDark, "")}> ${escapeHtml(
              interpolate(messages.quantityLabel, { quantity: extra.quantity }),
            )}</span>`
          : "";

      return `<tr>
        <td ${bg(BRAND.card, `padding:12px 0;border-bottom:1px solid ${BRAND.borderSoft};`)} ${colorStyle(BRAND.text, `font-family:${SANS};font-size:14px;`)}>
          <span class="email-gold" ${colorStyle(BRAND.gold, "font-size:10px;vertical-align:middle;")}>&#9670;</span>&nbsp;&nbsp;${escapeHtml(extra.name)}${quantityLabel}
        </td>
        <td align="right" ${bg(BRAND.card, `padding:12px 0;border-bottom:1px solid ${BRAND.borderSoft};`)} ${colorStyle(priceColor, `font-family:${SANS};font-size:13px;font-weight:600;white-space:nowrap;`)}>${escapeHtml(priceLabel)}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 32px;")}>
    <tr>
      <td ${bg(BRAND.card)}>
        ${renderSectionHeading(messages.extrasSectionLabel)}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
      </td>
    </tr>
  </table>`;
}

function renderSummarySection(
  payload: ReservationNotificationPayload,
  messages: ReservationEmailMessages,
): string {
  const lineRows = payload.items
    .map((item) => {
      const price =
        item.totalPriceMinor === 0
          ? messages.includedLabel
          : formatPrice(item.totalPriceMinor, payload.currency, payload.locale);

      const quantityPrefix =
        item.quantity > 1
          ? `${interpolate(messages.quantityLabel, { quantity: item.quantity })} `
          : "";

      return `<tr>
        <td ${bg(BRAND.panel, "padding:8px 0;")} ${colorStyle(BRAND.muted, `font-family:${SANS};font-size:13px;`)}>${escapeHtml(quantityPrefix)}${escapeHtml(item.name)}</td>
        <td align="right" ${bg(BRAND.panel, "padding:8px 0;")} ${colorStyle(BRAND.muted, `font-family:${SANS};font-size:13px;white-space:nowrap;`)}>${escapeHtml(price)}</td>
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

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 32px;")}>
    <tr>
      <td ${bg(BRAND.card)}>
        ${renderSectionHeading(messages.summarySectionLabel)}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel" ${bg(BRAND.panel, `border:1px solid ${BRAND.border};border-radius:14px;`)}>
          <tr>
            <td ${bg(BRAND.panel, "padding:20px 22px;")}>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${lineRows}
                <tr>
                  <td colspan="2" ${bg(BRAND.panel, "padding:10px 0 0;")}><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td ${bg(BRAND.border, "height:1px;font-size:0;line-height:0;")}>&nbsp;</td></tr></table></td>
                </tr>
                <tr>
                  <td ${bg(BRAND.panel, "padding:12px 0 0;")} ${colorStyle(BRAND.muted, `font-family:${SANS};font-size:13px;`)}>${escapeHtml(messages.subtotalLabel)}</td>
                  <td align="right" ${bg(BRAND.panel, "padding:12px 0 0;")} ${colorStyle(BRAND.text, `font-family:${SANS};font-size:13px;white-space:nowrap;`)}>${escapeHtml(subtotal)}</td>
                </tr>
                <tr>
                  <td ${bg(BRAND.panel, "padding:14px 0 0;")} class="email-gold" ${colorStyle(BRAND.gold, `font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;vertical-align:bottom;`)}>${escapeHtml(messages.totalLabel)}</td>
                  <td align="right" ${bg(BRAND.panel, "padding:14px 0 0;")} class="email-gold-bright" ${colorStyle(BRAND.goldBright, `font-family:${SERIF};font-size:26px;font-weight:700;white-space:nowrap;`)}>${escapeHtml(total)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderNotesSection(
  notes: string,
  messages: ReservationEmailMessages,
): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 32px;")}>
    <tr>
      <td ${bg(BRAND.card)}>
        ${renderSectionHeading(messages.notesLabel)}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel-soft" ${bg(BRAND.panelSoft, `border:1px solid ${BRAND.borderSoft};border-radius:14px;`)}>
          <tr>
            <td ${bg(BRAND.goldDeep, "width:3px;font-size:0;line-height:0;")}>&nbsp;</td>
            <td ${bg(BRAND.panelSoft, "padding:16px 20px;")} class="email-text" ${colorStyle(BRAND.text, `font-family:${SANS};font-size:14px;line-height:1.7;`)}>${formatMultilineHtml(notes)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function resolvePassengerKindMessage(
  passenger: ReservationPassengerNotification,
  messages: ReservationEmailMessages,
): string {
  return resolvePassengerKindLabel(passenger, {
    adult: (index) =>
      interpolate(messages.passengerAdultLabel, { index: String(index) }),
    child: (index) =>
      interpolate(messages.passengerChildLabel, { index: String(index) }),
    infant: (index) =>
      interpolate(messages.passengerInfantLabel, { index: String(index) }),
  });
}

function formatPassengerLines(
  passengers: ReservationPassengerNotification[],
  messages: ReservationEmailMessages,
): string[] {
  return passengers.map((passenger) =>
    formatPassengerDisplayLine(
      passenger,
      resolvePassengerKindMessage(passenger, messages),
    ),
  );
}

function renderPassengerDetailsSection(
  passengers: ReservationPassengerNotification[],
  messages: ReservationEmailMessages,
): string {
  if (passengers.length === 0) {
    return "";
  }

  const rows = formatPassengerLines(passengers, messages)
    .map(
      (line) =>
        `<tr>
          <td ${bg(BRAND.panelSoft, "padding:10px 20px;")} class="email-text" ${colorStyle(BRAND.text, `font-family:${SANS};font-size:14px;line-height:1.6;`)}>${escapeHtml(line)}</td>
        </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 32px;")}>
    <tr>
      <td ${bg(BRAND.card)}>
        ${renderSectionHeading(messages.passengerDetailsLabel)}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel-soft" ${bg(BRAND.panelSoft, `border:1px solid ${BRAND.borderSoft};border-radius:14px;`)}>
          <tr>
            <td ${bg(BRAND.goldDeep, "width:3px;font-size:0;line-height:0;")}>&nbsp;</td>
            <td ${bg(BRAND.panelSoft, "padding:6px 0;")}>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderGoldButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
    <tr>
      <td align="center" ${bg(BRAND.gold, "border-radius:999px;")}>
        <a href="${escapeHtml(href)}" ${colorStyle(BRAND.page, `display:inline-block;padding:15px 34px;font-family:${SANS};font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:999px;`)}>${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function renderSupportSection(
  messages: ReservationEmailMessages,
  contact: Required<ReservationEmailContact>,
): string {
  const items = [
    `<a href="tel:${escapeHtml(contact.phone.replace(/\s/g, ""))}" ${colorStyle(BRAND.goldLight, "text-decoration:none;font-weight:600;")}>${escapeHtml(contact.phone)}</a>`,
    `<a href="mailto:${escapeHtml(contact.email)}" ${colorStyle(BRAND.goldLight, "text-decoration:none;font-weight:600;")}>${escapeHtml(contact.email)}</a>`,
  ].join(
    `<span ${colorStyle(BRAND.border, "padding:0 10px;")}>|</span>`,
  );

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-panel-soft" ${bg(BRAND.panelSoft, `border:1px solid ${BRAND.borderSoft};border-radius:14px;`)}>
    <tr>
      <td align="center" ${bg(BRAND.panelSoft, "padding:22px;")}>
        <div class="email-white" ${colorStyle(BRAND.white, `font-family:${SERIF};font-size:17px;margin-bottom:6px;`)}>${escapeHtml(messages.supportTitle)}</div>
        <div class="email-muted" ${colorStyle(BRAND.muted, `font-family:${SANS};font-size:13px;line-height:1.7;margin-bottom:12px;`)}>${escapeHtml(messages.footerHelp)}</div>
        <div ${colorStyle(BRAND.goldLight, `font-family:${SANS};font-size:14px;`)}>${items}</div>
      </td>
    </tr>
  </table>`;
}

type EmailLayoutInput = {
  locale: string;
  title: string;
  preheader: string;
  bodyHtml: string;
  timezoneNote: string;
  tagline: string;
};

function renderEmailLayout(input: EmailLayoutInput): string {
  const dir = isRtlLocale(input.locale) ? "rtl" : "ltr";

  return `<!DOCTYPE html>
<html lang="${escapeHtml(input.locale)}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(input.title)}</title>
  ${renderEmailStyles()}
</head>
<body class="body email-page" ${bg(BRAND.page, `margin:0 !important;padding:0 !important;width:100% !important;font-family:${SANS};`)} ${colorStyle(BRAND.text)}>
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-page" ${bg(BRAND.page, "padding:40px 16px;")}>
    <tr>
      <td align="center" ${bg(BRAND.page)}>
        <table role="presentation" width="${CONTENT_WIDTH}" cellspacing="0" cellpadding="0" class="email-card" ${bg(BRAND.card, `width:100%;max-width:${CONTENT_WIDTH}px;border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;`)}>
          <tr>
            <td ${bg(BRAND.gold, "height:4px;font-size:0;line-height:0;")}>&nbsp;</td>
          </tr>
          <tr>
            <td align="center" class="email-header" ${bg(BRAND.header, `padding:30px 32px 26px;border-bottom:1px solid ${BRAND.border};`)}>
              ${renderLogo()}
              <div class="email-gold-bright" ${colorStyle(BRAND.goldBright, `font-family:${SERIF};font-size:18px;font-weight:700;letter-spacing:0.08em;margin-bottom:10px;`)}>${escapeHtml(APP_NAME)}</div>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 12px;"><tr><td ${bg(BRAND.goldDeep, "width:64px;height:1px;font-size:0;line-height:0;")}>&nbsp;</td></tr></table>
              <div ${colorStyle(BRAND.mutedDark, `font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:0.24em;text-transform:uppercase;`)}>${escapeHtml(input.tagline)}</div>
            </td>
          </tr>
          <tr>
            <td class="email-card email-text" ${bg(BRAND.card, "padding:36px 32px 8px;")} ${colorStyle(BRAND.text)}>
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" class="email-header" ${bg(BRAND.header, `padding:26px 32px 30px;border-top:1px solid ${BRAND.border};`)}>
              ${renderLogo(true)}
              <div class="email-gold" ${colorStyle(BRAND.gold, `font-family:${SERIF};font-size:13px;letter-spacing:0.1em;margin-bottom:10px;`)}>${escapeHtml(APP_NAME)}</div>
              <div ${colorStyle(BRAND.mutedDark, `font-family:${SANS};font-size:11px;line-height:1.8;`)}>${escapeHtml(input.timezoneNote)}</div>
              <div ${colorStyle(BRAND.mutedDark, `font-family:${SANS};font-size:11px;line-height:1.8;`)}>&copy; ${new Date().getFullYear()} ${escapeHtml(APP_NAME)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPlainTextLines(
  payload: ReservationNotificationPayload,
  messages: ReservationEmailMessages,
  items: ReservationEmailLineItem[],
): string[] {
  const lines = [
    `${messages.referenceLabel}: ${payload.reference}`,
    `${messages.routeLabel}: ${payload.snapshotRouteLabel}`,
    `${messages.outboundLabel}: ${formatReservationDateTime(payload.outboundAt, payload.locale)}`,
  ];

  if (payload.returnAt) {
    lines.push(
      `${messages.returnLabel}: ${formatReservationDateTime(payload.returnAt, payload.locale)}`,
    );
  }

  lines.push(`${messages.passengersLabel}: ${payload.passengerCount}`, "");
  lines.push(`${messages.itemsLabel}:`);

  for (const item of items) {
    const price =
      item.totalPriceMinor === 0
        ? messages.includedLabel
        : formatPrice(item.totalPriceMinor, payload.currency, payload.locale);

    lines.push(`- ${item.quantity}x ${item.name} — ${price}`);
  }

  lines.push(
    "",
    `${messages.totalLabel}: ${formatPrice(payload.totalMinor, payload.currency, payload.locale)}`,
  );

  if (payload.passengers && payload.passengers.length > 0) {
    lines.push("", `${messages.passengerDetailsLabel}:`);
    for (const line of formatPassengerLines(payload.passengers, messages)) {
      lines.push(`- ${line}`);
    }
  }

  if (payload.notes?.trim()) {
    lines.push("", `${messages.notesLabel}:`, payload.notes.trim());
  }

  return lines;
}

export function buildCustomerReservationEmail(
  payload: ReservationNotificationPayload,
  options?: { contact?: ReservationEmailContact },
): { subject: string; html: string; text: string } {
  const messages = getReservationEmailMessages(payload.locale);
  const contact = resolveContact(options?.contact);
  const subject = interpolate(messages.customerSubject, {
    reference: payload.reference,
  });

  const bodyHtml = `
    <h1 class="email-white" ${colorStyle(BRAND.white, `margin:0 0 14px;font-family:${SERIF};font-size:26px;line-height:1.35;font-weight:400;`)}>${escapeHtml(interpolate(messages.greeting, { name: payload.customer.firstName }))}</h1>
    <p class="email-muted" ${colorStyle(BRAND.muted, `margin:0 0 30px;font-family:${SANS};font-size:15px;line-height:1.75;`)}>${escapeHtml(messages.customerIntro)}</p>
    ${renderReferencePanel(payload, messages)}
    ${renderVehicleSection(payload, messages)}
    ${renderJourneySection(payload, messages)}
    ${renderExtrasSection(payload, messages)}
    ${renderSummarySection(payload, messages)}
    ${payload.passengers?.length ? renderPassengerDetailsSection(payload.passengers, messages) : ""}
    ${payload.notes ? renderNotesSection(payload.notes, messages) : ""}
    ${renderSupportSection(messages, contact)}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td ${bg(BRAND.card, "height:28px;font-size:0;line-height:0;")}>&nbsp;</td></tr></table>
  `;

  const html = renderEmailLayout({
    locale: payload.locale,
    title: subject,
    preheader: `${messages.referenceLabel}: ${payload.reference} — ${messages.customerIntro}`,
    bodyHtml,
    timezoneNote: messages.timezoneNote,
    tagline: messages.brandTagline,
  });

  const text = [
    interpolate(messages.greeting, { name: payload.customer.firstName }),
    "",
    messages.customerIntro,
    "",
    ...buildPlainTextLines(payload, messages, payload.items),
    "",
    `${messages.footerContact}: ${contact.phone} · ${contact.email}`,
    messages.timezoneNote,
  ].join("\n");

  return { subject, html, text };
}

export function buildAdminReservationEmail(
  payload: ReservationNotificationPayload,
  options: {
    adminUrl: string;
    contactEmail: string;
    contact?: ReservationEmailContact;
  },
): { subject: string; html: string; text: string } {
  const messages = getReservationEmailMessages(payload.locale);
  const contact = resolveContact({
    ...options.contact,
    email: options.contact?.email ?? options.contactEmail,
  });
  const customerName = `${payload.customer.firstName} ${payload.customer.lastName}`;
  const subject = interpolate(messages.adminSubject, {
    reference: payload.reference,
  });

  const customerRows = [
    renderDetailRow(messages.customerNameLabel, customerName),
    renderDetailRow(messages.emailLabel, payload.customer.email),
    renderDetailRow(messages.phoneLabel, payload.customer.phone),
    payload.customer.whatsappPhone
      ? renderDetailRow(messages.whatsappLabel, payload.customer.whatsappPhone)
      : "",
  ].join("");

  const bodyHtml = `
    <h1 class="email-white" ${colorStyle(BRAND.white, `margin:0 0 14px;font-family:${SERIF};font-size:26px;line-height:1.35;font-weight:400;`)}>${escapeHtml(messages.adminIntro)}</h1>
    ${renderReferencePanel(payload, messages)}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" ${bg(BRAND.card, "margin:0 0 32px;")}>
      <tr>
        <td ${bg(BRAND.card)}>
          ${renderSectionHeading(messages.customerNameLabel)}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${customerRows}</table>
        </td>
      </tr>
    </table>
    ${renderVehicleSection(payload, messages)}
    ${renderJourneySection(payload, messages)}
    ${renderExtrasSection(payload, messages)}
    ${renderSummarySection(payload, messages)}
    ${payload.passengers?.length ? renderPassengerDetailsSection(payload.passengers, messages) : ""}
    ${payload.notes ? renderNotesSection(payload.notes, messages) : ""}
    ${renderGoldButton(options.adminUrl, messages.adminViewReservation)}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td ${bg(BRAND.card, "height:28px;font-size:0;line-height:0;")}>&nbsp;</td></tr></table>
  `;

  const html = renderEmailLayout({
    locale: payload.locale,
    title: subject,
    preheader: `${messages.referenceLabel}: ${payload.reference} — ${customerName}`,
    bodyHtml,
    timezoneNote: messages.timezoneNote,
    tagline: messages.brandTagline,
  });

  const text = [
    messages.adminIntro,
    "",
    `${messages.customerNameLabel}: ${customerName}`,
    `${messages.emailLabel}: ${payload.customer.email}`,
    `${messages.phoneLabel}: ${payload.customer.phone}`,
    "",
    ...buildPlainTextLines(payload, messages, payload.items),
    "",
    `${messages.adminViewReservation}: ${options.adminUrl}`,
    `${messages.footerContact}: ${contact.email}`,
  ].join("\n");

  return { subject, html, text };
}

export function buildCustomerReservationStatusEmail(
  payload: ReservationStatusUpdateNotificationPayload,
  options?: { contact?: ReservationEmailContact },
): { subject: string; html: string; text: string } {
  const messages = getReservationEmailMessages(payload.locale);
  const contact = resolveContact(options?.contact);
  const intro = getReservationStatusIntro(payload.nextStatus, messages);
  const statusLabel = getReservationStatusLabel(payload.nextStatus, messages);
  const subject = interpolate(messages.statusUpdateSubject, {
    reference: payload.reference,
  });

  const bodyHtml = `
    <h1 class="email-white" ${colorStyle(BRAND.white, `margin:0 0 14px;font-family:${SERIF};font-size:26px;line-height:1.35;font-weight:400;`)}>${escapeHtml(interpolate(messages.greeting, { name: payload.customer.firstName }))}</h1>
    <p class="email-muted" ${colorStyle(BRAND.muted, `margin:0 0 30px;font-family:${SANS};font-size:15px;line-height:1.75;`)}>${escapeHtml(intro)}</p>
    ${renderReferencePanel(payload, messages, payload.nextStatus)}
    ${renderStatusChangePanel(payload, messages)}
    ${renderVehicleSection(payload, messages)}
    ${renderJourneySection(payload, messages)}
    ${renderExtrasSection(payload, messages)}
    ${renderSummarySection(payload, messages)}
    ${payload.passengers?.length ? renderPassengerDetailsSection(payload.passengers, messages) : ""}
    ${payload.notes ? renderNotesSection(payload.notes, messages) : ""}
    ${renderSupportSection(messages, contact)}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td ${bg(BRAND.card, "height:28px;font-size:0;line-height:0;")}>&nbsp;</td></tr></table>
  `;

  const html = renderEmailLayout({
    locale: payload.locale,
    title: subject,
    preheader: `${messages.statusLabel}: ${statusLabel} — ${payload.reference}`,
    bodyHtml,
    timezoneNote: messages.timezoneNote,
    tagline: messages.brandTagline,
  });

  const text = [
    interpolate(messages.greeting, { name: payload.customer.firstName }),
    "",
    intro,
    "",
    `${messages.referenceLabel}: ${payload.reference}`,
    `${messages.previousStatusLabel}: ${getReservationStatusLabel(payload.previousStatus, messages)}`,
    `${messages.statusLabel}: ${statusLabel}`,
    "",
    ...buildPlainTextLines(payload, messages, payload.items),
    "",
    `${messages.footerContact}: ${contact.phone} · ${contact.email}`,
    messages.timezoneNote,
  ].join("\n");

  return { subject, html, text };
}
