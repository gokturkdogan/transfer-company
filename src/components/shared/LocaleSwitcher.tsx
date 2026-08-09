"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getLocaleEmoji } from "@/config/locales";
import type { SiteLocaleOption } from "@/features/locales/types";
import { useLocaleSwitch } from "@/i18n/use-locale-switch";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  enabledLocales: SiteLocaleOption[];
};

export function LocaleSwitcher({ enabledLocales }: LocaleSwitcherProps) {
  const t = useTranslations("home.nav");
  const currentLocale = useLocale();
  const switchLocale = useLocaleSwitch();

  const activeLocale =
    enabledLocales.find((locale) => locale.code === currentLocale) ??
    enabledLocales[0];

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-2.5 text-white/85 backdrop-blur-md transition-colors hover:border-gold/50 hover:text-white lg:hidden",
            )}
            aria-label={t("selectLanguage")}
          >
            <span className="text-sm leading-none" aria-hidden>
              {getLocaleEmoji(activeLocale.code)}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide">
              {activeLocale.shortLabel}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-white/60" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-52 border-white/15 bg-ink/95 p-1.5 text-white shadow-premium backdrop-blur-xl"
        >
          <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
            {t("selectLanguage")}
          </p>
          <ul className="space-y-0.5">
            {enabledLocales.map((localeOption) => {
              const isActive = currentLocale === localeOption.code;

              return (
                <li key={localeOption.code}>
                  <button
                    type="button"
                    onClick={() => switchLocale(localeOption.code)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-gold-gradient font-semibold text-ink"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {getLocaleEmoji(localeOption.code)}
                    </span>
                    <span className="flex-1 text-start">{localeOption.label}</span>
                    {isActive ? (
                      <Check className="h-4 w-4 shrink-0" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <div className="hidden items-center gap-0.5 rounded-full border border-white/15 bg-white/8 p-1 backdrop-blur-md lg:flex">
        {enabledLocales.map((localeOption) => (
          <button
            key={localeOption.code}
            type="button"
            title={localeOption.label}
            onClick={() => switchLocale(localeOption.code)}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition-all duration-300",
              currentLocale === localeOption.code
                ? "bg-gold-gradient text-ink"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            <span aria-hidden>{getLocaleEmoji(localeOption.code)}</span>
            {localeOption.shortLabel}
          </button>
        ))}
      </div>
    </>
  );
}
