import type { ContactChannelType } from "@/db/schema/enums";
import type { ContactChannelRecord } from "@/features/contact/server/repository";
import type { PublicContactChannels } from "@/features/contact/types/public-contact";

export function groupContactChannels(
  channels: ContactChannelRecord[],
): PublicContactChannels {
  const byType = (type: ContactChannelType) =>
    channels
      .filter((channel) => channel.type === type)
      .map((channel) => channel.value.trim())
      .filter((value) => value.length > 0);

  return {
    phones: byType("PHONE"),
    emails: byType("EMAIL"),
    whatsapps: byType("WHATSAPP"),
  };
}

export function pickPrimaryChannel(
  values: readonly string[],
  fallback: string,
): string {
  return values[0] ?? fallback;
}

export function toTelHref(value: string): string {
  return `tel:${value.replace(/\s/g, "")}`;
}

export function toMailtoHref(value: string): string {
  return `mailto:${value.trim()}`;
}

export function toWhatsappHref(value: string): string {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function toWhatsappDigits(value: string): string {
  return value.replace(/\D/g, "");
}
