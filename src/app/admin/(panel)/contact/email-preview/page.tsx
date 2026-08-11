import { Eye, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { clientEnv } from "@/config/env";
import { LOCALES } from "@/config/constants";
import { siteConfig } from "@/config/site";
import { EmailPreviewToolbar } from "@/features/admin/components/EmailPreviewToolbar";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { createMockReservationNotificationPayload } from "@/server/notifications/mock-reservation-notification-payload";
import {
  buildAdminReservationEmail,
  buildCustomerReservationEmail,
} from "@/server/notifications/templates/reservation-email";

const PREVIEW_RESERVATION_ID = "00000000-0000-4000-8000-000000000001";

type EmailPreviewPageProps = {
  searchParams: Promise<{
    variant?: string;
    locale?: string;
  }>;
};

function resolveLocale(locale?: string): string {
  if (locale && (LOCALES as readonly string[]).includes(locale)) {
    return locale;
  }

  return "tr";
}

export default async function EmailPreviewPage({
  searchParams,
}: EmailPreviewPageProps) {
  const params = await searchParams;
  const variant = params.variant === "admin" ? "admin" : "customer";
  const locale = resolveLocale(params.locale);

  const payload = createMockReservationNotificationPayload({
    customerEmail: "ornek@musteri.com",
    locale,
  });

  payload.reservationId = PREVIEW_RESERVATION_ID;

  const email =
    variant === "admin"
      ? buildAdminReservationEmail(payload, {
          adminUrl: `${clientEnv.NEXT_PUBLIC_APP_URL}/admin/reservations/${PREVIEW_RESERVATION_ID}`,
          contactEmail: siteConfig.email,
        })
      : buildCustomerReservationEmail(payload);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminCopy.contact.emailPreview.title}
        subtitle={adminCopy.contact.emailPreview.subtitle}
        icon={Mail}
        actions={
          <Link
            href="/admin/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Eye className="size-4" />
            {adminCopy.contact.emailPreview.backToContact}
          </Link>
        }
      />

      <Suspense fallback={null}>
        <EmailPreviewToolbar variant={variant} locale={locale} />
      </Suspense>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <p className="text-sm font-medium text-slate-900">{email.subject}</p>
          <p className="text-xs text-slate-500">
            {adminCopy.contact.emailPreview.subjectLabel}
          </p>
        </div>
        <iframe
          title={adminCopy.contact.emailPreview.iframeTitle}
          srcDoc={email.html}
          className="block min-h-[78vh] w-full bg-white"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
