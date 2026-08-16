"use client";

import { DEFAULT_LOCALE } from "@/config/constants";
import { getLocaleEmoji } from "@/config/locales";
import type { BlogLocaleContentInput } from "@/features/blog/domain/schemas";
import { GuideLocaleEditor } from "@/features/admin/components/GuideLocaleEditor";
import { adminCopy } from "@/features/admin/copy";
import type { EnabledLocaleRecord } from "@/features/locales/server/repository";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type GuideLocaleTabsProps = {
  enabledLocales: EnabledLocaleRecord[];
  translations: Record<string, BlogLocaleContentInput>;
  onTranslationChange: (locale: string, value: BlogLocaleContentInput) => void;
};

function hasLocaleContent(value: BlogLocaleContentInput): boolean {
  return Boolean(
    value.title.trim() || value.excerpt.trim() || value.intro.trim(),
  );
}

export function GuideLocaleTabs({
  enabledLocales,
  translations,
  onTranslationChange,
}: GuideLocaleTabsProps) {
  const defaultLocale =
    enabledLocales.find((locale) => locale.code === DEFAULT_LOCALE)?.code ??
    enabledLocales[0]?.code ??
    DEFAULT_LOCALE;

  return (
    <Tabs defaultValue={defaultLocale} className="space-y-4">
      <div className="space-y-2">
        <TabsList
          className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5"
        >
          {enabledLocales.map((locale) => {
            const filled = hasLocaleContent(translations[locale.code]);
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
        <p className="text-xs leading-relaxed text-slate-500">
          {adminCopy.guides.form.contentHint}
        </p>
      </div>

      {enabledLocales.map((locale) => (
        <TabsContent key={locale.code} value={locale.code} className="mt-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <GuideLocaleEditor
              embedded
              locale={locale}
              required={locale.code === DEFAULT_LOCALE}
              value={translations[locale.code]}
              onChange={(value) => onTranslationChange(locale.code, value)}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
