import "server-only";

import { resolveSmtpConfig } from "@/config/smtp";
import { LoggingNotificationService } from "@/server/notifications/logging-notification-service";
import { SmtpNotificationService } from "@/server/notifications/smtp-notification-service";
import type { NotificationService } from "@/server/notifications/types";

export function createNotificationService(): NotificationService {
  const smtpConfig = resolveSmtpConfig();

  if (smtpConfig) {
    return new SmtpNotificationService(smtpConfig);
  }

  return new LoggingNotificationService();
}

export const notificationService = createNotificationService();
