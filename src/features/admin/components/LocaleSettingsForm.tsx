"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateEnabledLocalesAction } from "@/features/admin/server/actions";
import type { EnabledLocaleRecord } from "@/features/locales/server/repository";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import {
  type SupportedLocale,
} from "@/config/locales";
import { DEFAULT_LOCALE } from "@/config/constants";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LocaleSettingsFormProps = {
  supportedLocales: readonly SupportedLocale[];
  locales: EnabledLocaleRecord[];
};

function buildActiveCodes(locales: EnabledLocaleRecord[]): Set<string> {
  const active = new Set(
    locales.filter((locale) => locale.isActive).map((locale) => locale.code),
  );

  active.add(DEFAULT_LOCALE);
  return active;
}

export function LocaleSettingsForm({
  supportedLocales,
  locales,
}: LocaleSettingsFormProps) {
  const router = useRouter();
  const [activeCodes, setActiveCodes] = useState<Set<string>>(() =>
    buildActiveCodes(locales),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(
    () => supportedLocales.filter((locale) => activeCodes.has(locale.code)).length,
    [activeCodes, supportedLocales],
  );

  const toggleLocale = (code: string) => {
    if (code === DEFAULT_LOCALE) {
      return;
    }

    setActiveCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      next.add(DEFAULT_LOCALE);
      return next;
    });
  };

  return (
    <AdminContentCard flush>
      <form
        className="divide-y divide-slate-100"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            setError(null);
            setSuccess(null);

            const result = await updateEnabledLocalesAction({
              locales: supportedLocales.map((locale) => ({
                code: locale.code,
                label: locale.label,
                isActive: activeCodes.has(locale.code),
              })),
            });

            if (!result.success) {
              setError(translateAdminError(result.error.message));
              return;
            }

            setActiveCodes(buildActiveCodes(result.data));
            setSuccess(adminCopy.locales.saved);
            router.refresh();
          });
        }}
      >
        <div className="space-y-4 p-4 sm:p-5">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {success ? <Alert>{success}</Alert> : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {adminCopy.locales.formTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {adminCopy.locales.activeCount(activeCount, supportedLocales.length)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {supportedLocales.map((locale) => {
              const isActive = activeCodes.has(locale.code);
              const isDefault = locale.code === DEFAULT_LOCALE;

              return (
                <label
                  key={locale.code}
                  className={cn(
                    "flex cursor-pointer flex-col gap-3 rounded-xl border p-3 transition-all sm:p-4",
                    isActive
                      ? "border-blue-200 bg-blue-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80",
                    isDefault && "cursor-default",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl leading-none" aria-hidden>
                      {locale.emoji}
                    </span>
                    <input
                      type="checkbox"
                      checked={isActive}
                      disabled={isDefault}
                      onChange={() => toggleLocale(locale.code)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                      aria-label={`${locale.label} ${adminCopy.locales.fields.active}`}
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {locale.label}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {locale.shortLabel}
                    </p>
                    {isDefault ? (
                      <p className="text-[10px] font-medium text-blue-700">
                        {adminCopy.locales.defaultBadge}
                      </p>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {adminCopy.locales.hint}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">{adminCopy.locales.saveHint}</p>
          <Button type="submit" disabled={isPending || activeCount === 0}>
            {isPending ? adminCopy.locales.saving : adminCopy.locales.save}
          </Button>
        </div>
      </form>
    </AdminContentCard>
  );
}
