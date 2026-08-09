"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import {
  bookingFormCompositeClass,
  bookingFormFieldGroupClass,
  bookingFormLabelClass,
} from "@/features/booking/components/booking-form-styles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PHONE_COUNTRY_DEFINITIONS,
  PHONE_COUNTRY_PRIORITY,
} from "@/lib/phone/countries";
import { getFlagEmoji, sanitizeNationalPhoneNumber } from "@/lib/phone/format";
import { cn } from "@/lib/utils";

type PhoneNumberFieldProps = {
  id: string;
  label: string;
  countryCode: string;
  nationalNumber: string;
  onCountryCodeChange: (iso2: string) => void;
  onNationalNumberChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
};

export function PhoneNumberField({
  id,
  label,
  countryCode,
  nationalNumber,
  onCountryCodeChange,
  onNationalNumberChange,
  placeholder,
  compact = false,
  className,
}: PhoneNumberFieldProps) {
  const t = useTranslations("booking.customer");
  const locale = useLocale();

  const sortedCountries = useMemo(() => {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    const priorityIndex = new Map(
      PHONE_COUNTRY_PRIORITY.map((iso2, index) => [iso2, index]),
    );

    return [...PHONE_COUNTRY_DEFINITIONS].sort((left, right) => {
      const leftPriority = priorityIndex.get(
        left.iso2 as (typeof PHONE_COUNTRY_PRIORITY)[number],
      );
      const rightPriority = priorityIndex.get(
        right.iso2 as (typeof PHONE_COUNTRY_PRIORITY)[number],
      );

      if (leftPriority !== undefined || rightPriority !== undefined) {
        if (leftPriority === undefined) {
          return 1;
        }

        if (rightPriority === undefined) {
          return -1;
        }

        return leftPriority - rightPriority;
      }

      const leftName = displayNames.of(left.iso2) ?? left.iso2;
      const rightName = displayNames.of(right.iso2) ?? right.iso2;

      return leftName.localeCompare(rightName, locale);
    });
  }, [locale]);

  const selectedCountry =
    sortedCountries.find((country) => country.iso2 === countryCode) ??
    sortedCountries[0];

  return (
    <div className={cn(bookingFormFieldGroupClass, className)}>
      <Label htmlFor={id} className={bookingFormLabelClass}>
        {label}
      </Label>
      <div className={bookingFormCompositeClass}>
        <Select value={selectedCountry.iso2} onValueChange={onCountryCodeChange}>
          <SelectTrigger
            aria-label={t("countryCode")}
            className={cn(
              "h-10 shrink-0 rounded-none border-0 border-e border-border/45 bg-muted/25 px-2.5 shadow-none focus:ring-0 focus:ring-offset-0",
              compact ? "w-[6.5rem]" : "w-[7.25rem] sm:w-[8.5rem]",
            )}
          >
            <SelectValue>
              <span className="flex items-center gap-1.5 text-xs">
                <span aria-hidden>{getFlagEmoji(selectedCountry.iso2)}</span>
                <span className="font-medium">+{selectedCountry.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {sortedCountries.map((country) => {
              const countryName =
                new Intl.DisplayNames([locale], { type: "region" }).of(
                  country.iso2,
                ) ?? country.iso2;

              return (
                <SelectItem key={country.iso2} value={country.iso2}>
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{getFlagEmoji(country.iso2)}</span>
                    <span className="truncate">{countryName}</span>
                    <span className="text-muted-foreground">
                      +{country.dialCode}
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={nationalNumber}
          placeholder={placeholder}
          onChange={(event) =>
            onNationalNumberChange(
              sanitizeNationalPhoneNumber(event.target.value),
            )
          }
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground/65"
        />
      </div>
    </div>
  );
}
