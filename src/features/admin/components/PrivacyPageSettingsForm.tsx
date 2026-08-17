"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_LOCALE } from "@/config/constants";
import { getLocaleEmoji } from "@/config/locales";
import { AdminRichTextEditor } from "@/features/admin/components/AdminRichTextEditor";
import { updatePrivacyPageAction } from "@/features/admin/server/actions";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import type { PrivacyLocaleContentInput } from "@/features/privacy/domain/schemas";
import type { PrivacyPageTranslationRecord } from "@/features/privacy/server/repository";
import type { EnabledLocaleRecord } from "@/features/locales/server/repository";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PrivacyPageSettingsFormProps = {
  enabledLocales: EnabledLocaleRecord[];
  translations: PrivacyPageTranslationRecord[];
  defaultHtmlByLocale: Record<string, string>;
};

function hasHtmlContent(html: string): boolean {
  return html.replace(/<[^>]+>/g, "").trim().length > 0;
}

function toFormState(
  locale: string,
  translations: PrivacyPageTranslationRecord[],
  defaultHtmlByLocale: Record<string, string>,
): PrivacyLocaleContentInput {
  const existing = translations.find((item) => item.locale === locale);
  if (existing?.content.trim()) {
    return {
      locale,
      content: existing.content,
    };
  }

  const defaultHtml = defaultHtmlByLocale[locale];
  if (defaultHtml?.trim()) {
    return {
      locale,
      content: defaultHtml,
    };
  }

  return {
    locale,
    content: "",
  };
}

export function PrivacyPageSettingsForm({
  enabledLocales,
  translations,
  defaultHtmlByLocale,
}: PrivacyPageSettingsFormProps) {
  const router = useRouter();
  const copy = adminCopy.privacyPage;
  const defaultLocale =
    enabledLocales.find((locale) => locale.code === DEFAULT_LOCALE)?.code ??
    enabledLocales[0]?.code ??
    DEFAULT_LOCALE;

  const [formState, setFormState] = useState<Record<string, PrivacyLocaleContentInput>>(
    () => {
      const initial: Record<string, PrivacyLocaleContentInput> = {};
      for (const locale of enabledLocales) {
        initial[locale.code] = toFormState(
          locale.code,
          translations,
          defaultHtmlByLocale,
        );
      }
      return initial;
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filledCount = useMemo(
    () =>
      enabledLocales.filter((locale) =>
        hasHtmlContent(formState[locale.code].content),
      ).length,
    [enabledLocales, formState],
  );

  return (
    <AdminContentCard flush>
      <form
        className="divide-y divide-slate-100"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            setError(null);
            setSuccess(null);

            const result = await updatePrivacyPageAction({
              translations: enabledLocales.map((locale) => formState[locale.code]),
            });

            if (!result.success) {
              setError(translateAdminError(result.error.message));
              return;
            }

            setSuccess(copy.saved);
            router.refresh();
          });
        }}
      >
        <AdminFormSection title={copy.formTitle} description={copy.hint}>
          <Tabs defaultValue={defaultLocale} className="space-y-4">
            <TabsList
              className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5"
            >
              {enabledLocales.map((locale) => {
                const filled = hasHtmlContent(formState[locale.code].content);
                const isDefault = locale.code === DEFAULT_LOCALE;

                return (
                  <TabsTrigger
                    key={locale.code}
                    value={locale.code}
                    className={cn(
                      "h-auto min-h-9 gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600",
                      "data-[active=true]:border data-[active=true]:border-slate-200",
                      "data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm",
                    )}
                  >
                    <span aria-hidden>{getLocaleEmoji(locale.code)}</span>
                    <span>{locale.label}</span>
                    {isDefault ? (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                        {adminCopy.translations.required}
                      </span>
                    ) : null}
                    {filled ? (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                    ) : null}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {enabledLocales.map((locale) => (
              <TabsContent key={locale.code} value={locale.code} className="mt-0">
                <p className="mb-3 text-xs text-slate-500">
                  {copy.localeHint(locale.label)}
                </p>
                <AdminRichTextEditor
                  value={formState[locale.code].content}
                  placeholder={copy.editorPlaceholder}
                  onChange={(content) => {
                    setFormState((current) => ({
                      ...current,
                      [locale.code]: {
                        locale: locale.code,
                        content,
                      },
                    }));
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </AdminFormSection>

        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">
            {copy.summary(filledCount, enabledLocales.length)} · {copy.saveHint}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {error ? <Alert variant="destructive">{error}</Alert> : null}
            {success ? <Alert>{success}</Alert> : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? copy.saving : copy.save}
            </Button>
          </div>
        </div>
      </form>
    </AdminContentCard>
  );
}
