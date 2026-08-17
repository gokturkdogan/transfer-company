import { cn } from "@/lib/utils";

const bookingFormControlBase =
  "rounded-xl border border-border/45 bg-card/70 text-xs text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] backdrop-blur-sm transition-all duration-200";

export const bookingFormLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

export const bookingFormFieldGroupClass = "space-y-2";

export const bookingFormControlClass = cn(
  bookingFormControlBase,
  "flex h-10 w-full px-3 py-0",
  "placeholder:text-muted-foreground/65",
  "hover:border-gold/30 hover:bg-card",
  "focus-visible:border-gold/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/12 focus-visible:ring-offset-0",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export const bookingFormCompositeClass = cn(
  bookingFormControlBase,
  "flex h-10 w-full overflow-hidden p-0",
  "hover:border-gold/30 hover:bg-card",
  "focus-within:border-gold/45 focus-within:ring-2 focus-within:ring-gold/12 focus-within:ring-offset-0",
);

export const bookingExtrasGridClass =
  "grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10";

export const bookingExtraItemClass = "min-w-0";

export const bookingFormSectionIconClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-deep";

export const bookingFormSectionTitleClass =
  "text-sm font-semibold tracking-tight text-foreground";

export const bookingFormSectionSubtitleClass =
  "text-xs leading-relaxed text-muted-foreground/80";

export const bookingFormControlErrorClass =
  "border-red-400/70 ring-2 ring-red-400/15 focus-visible:border-red-400/70 focus-visible:ring-red-400/15";

export const bookingFormSectionHeaderClass =
  "flex items-center gap-2.5";

export const bookingFormSectionDividerClass =
  "h-px border-0 bg-gradient-to-r from-transparent via-gold/18 to-transparent";

export const bookingFormSectionsClass = "flex flex-col";

export const bookingFormTriggerClass = cn(
  bookingFormControlClass,
  "items-center gap-2 text-start font-normal",
  "disabled:cursor-not-allowed disabled:opacity-50",
);
