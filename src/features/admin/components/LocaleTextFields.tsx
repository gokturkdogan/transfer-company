"use client";

import { Languages } from "lucide-react";

import type { EnabledLocaleRecord } from "@/features/locales/server/repository";
import { DEFAULT_LOCALE } from "@/config/constants";
import { adminCopy } from "@/features/admin/copy";
import { AdminField } from "@/features/admin/components/shell/AdminField";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LocaleTextFieldsProps = {
  title: string;
  hint?: string;
  fieldLabel: string;
  enabledLocales: EnabledLocaleRecord[];
  values: Record<string, string>;
  onChange: (locale: string, value: string) => void;
  requiredLocale?: string;
  embedded?: boolean;
  compact?: boolean;
};

export function LocaleTextFields({
  title,
  hint,
  fieldLabel,
  enabledLocales,
  values,
  onChange,
  requiredLocale = DEFAULT_LOCALE,
  embedded = false,
  compact = false,
}: LocaleTextFieldsProps) {
  const fields = (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {enabledLocales.map((locale) => (
        <AdminField
          key={locale.code}
          label={`${fieldLabel} (${locale.label})${
            locale.code === requiredLocale
              ? ` · ${adminCopy.translations.required}`
              : ""
          }`}
          htmlFor={`locale-${locale.code}`}
          required={locale.code === requiredLocale}
        >
          <Input
            id={`locale-${locale.code}`}
            value={values[locale.code] ?? ""}
            onChange={(event) => onChange(locale.code, event.target.value)}
            required={locale.code === requiredLocale}
            className="h-9"
          />
        </AdminField>
      ))}
    </div>
  );

  if (embedded) {
    return fields;
  }

  return (
    <AdminFormSection
      title={title}
      description={hint}
      icon={Languages}
      compact={compact}
      contentClassName="space-y-0"
    >
      {fields}
    </AdminFormSection>
  );
}
