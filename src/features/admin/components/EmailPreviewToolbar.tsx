"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { LOCALES } from "@/config/constants";
import { adminCopy } from "@/features/admin/copy";
import { cn } from "@/lib/utils";

type EmailPreviewToolbarProps = {
  variant: "customer" | "admin";
  locale: string;
};

const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  ru: "Русский",
  ar: "العربية",
};

export function EmailPreviewToolbar({
  variant,
  locale,
}: EmailPreviewToolbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (next: { variant?: string; locale?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next.variant) {
      params.set("variant", next.variant);
    }

    if (next.locale) {
      params.set("locale", next.locale);
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="admin-content-card space-y-4 rounded-xl border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref({ variant: "customer" })}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              variant === "customer"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            {adminCopy.contact.emailPreview.customerTab}
          </Link>
          <Link
            href={buildHref({ variant: "admin" })}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              variant === "admin"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            {adminCopy.contact.emailPreview.adminTab}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600">
            {adminCopy.contact.emailPreview.localeLabel}
          </span>
          {LOCALES.map((code) => (
            <Link
              key={code}
              href={buildHref({ locale: code })}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                locale === code
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {LOCALE_LABELS[code]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
