import "server-only";

import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import type { SmtpConfig } from "@/config/smtp";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let cachedTransport: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null =
  null;
let cachedConfigKey: string | null = null;

function getTransportKey(config: SmtpConfig): string {
  return `${config.host}:${config.port}:${config.user}`;
}

export function getSmtpTransport(
  config: SmtpConfig,
): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
  const key = getTransportKey(config);

  if (cachedTransport && cachedConfigKey === key) {
    return cachedTransport;
  }

  cachedTransport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
  cachedConfigKey = key;

  return cachedTransport;
}

export async function sendEmail(
  config: SmtpConfig,
  input: SendEmailInput,
): Promise<void> {
  const transport = getSmtpTransport(config);

  await transport.sendMail({
    from: {
      name: config.fromName,
      address: config.fromEmail,
    },
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
