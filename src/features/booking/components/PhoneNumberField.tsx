"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { FlagIcon } from "@/components/shared/FlagIcon";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  bookingFormCompositeClass,
  bookingFormFieldGroupClass,
  bookingFormLabelClass,
} from "@/features/booking/components/booking-form-styles";
import {
  getPhoneCountryDisplayName,
  sortPhoneCountries,
} from "@/lib/phone/countries";
import { sanitizeNationalPhoneNumber } from "@/lib/phone/format";
import { cn } from "@/lib/utils";

type PhoneNumberFieldProps = {
  id: string;
  label: string;
  countryCode: string;
  nationalNumber: string;
  onCountryCodeChange: (iso2: string) => void;
  onNationalNumberChange: (value: string) => void;
  placeholder?: string;
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
  className,
}: PhoneNumberFieldProps) {
  const t = useTranslations("booking.customer");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const sortedCountries = useMemo(() => sortPhoneCountries(locale), [locale]);

  const selectedCountry =
    sortedCountries.find((country) => country.iso2 === countryCode) ??
    sortedCountries[0]!;
  const selectedCountryName = getPhoneCountryDisplayName(
    selectedCountry.iso2,
    locale,
  );

  return (
    <div className={cn(bookingFormFieldGroupClass, className)}>
      <Label htmlFor={id} className={bookingFormLabelClass}>
        {label}
      </Label>
      <div className={bookingFormCompositeClass}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`${t("countryCode")}: ${selectedCountryName} +${selectedCountry.dialCode}`}
              aria-expanded={open}
              title={selectedCountryName}
              className={cn(
                "flex h-full w-[5.25rem] shrink-0 items-center gap-1.5 border-e border-border/45",
                "bg-muted/20 ps-2 pe-1.5 text-xs font-medium text-foreground",
                "transition-colors hover:bg-muted/35",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:ring-inset",
              )}
            >
              <FlagIcon iso2={selectedCountry.iso2} className="text-[0.95rem]" />
              <span className="tabular-nums">+{selectedCountry.dialCode}</span>
              <ChevronsUpDown
                className="ms-auto h-3 w-3 shrink-0 text-muted-foreground/70"
                aria-hidden
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="z-[85] w-[min(100vw-2rem,20rem)] p-0"
          >
            <Command>
              <CommandInput placeholder={t("searchCountry")} />
              <CommandList>
                <CommandEmpty>{t("noCountryFound")}</CommandEmpty>
                <CommandGroup>
                  {sortedCountries.map((country) => {
                    const countryName = getPhoneCountryDisplayName(
                      country.iso2,
                      locale,
                    );
                    const selected = country.iso2 === selectedCountry.iso2;

                    return (
                      <CommandItem
                        key={country.iso2}
                        value={`${countryName} ${country.iso2} +${country.dialCode}`}
                        onSelect={() => {
                          onCountryCodeChange(country.iso2);
                          setOpen(false);
                        }}
                        className="gap-2"
                      >
                        <FlagIcon
                          iso2={country.iso2}
                          className="text-[0.95rem]"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {countryName}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          +{country.dialCode}
                        </span>
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0 text-gold-deep",
                            selected ? "opacity-100" : "opacity-0",
                          )}
                          aria-hidden
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground/65"
        />
      </div>
    </div>
  );
}
