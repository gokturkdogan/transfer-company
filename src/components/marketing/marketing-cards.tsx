import { ArrowRight, Luggage, Quote, Users } from "lucide-react";
import Image from "next/image";
import { type ReactNode } from "react";

import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type DestinationCardProps = {
  name: string;
  imageSrc: string;
  priceLabel: string;
  bookLabel: string;
  href: ComponentProps<typeof Link>["href"];
  className?: string;
  compact?: boolean;
  priority?: boolean;
};

export function DestinationCard({
  name,
  imageSrc,
  priceLabel,
  bookLabel,
  href,
  className,
  compact = false,
  priority = false,
}: DestinationCardProps) {
  return (
    <Link
      href={href}
      aria-label={`${name}, ${bookLabel}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-ink shadow-float",
        "transition-all duration-500 hover:-translate-y-1.5 hover:shadow-premium",
        className,
      )}
    >
      <div
        className={cn(
          "relative",
          compact ? "aspect-square" : "aspect-[4/5] sm:aspect-[4/4.4]",
        )}
      >
        <Image
          src={imageSrc}
          alt={name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gold/22 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span
          aria-hidden
          className="absolute inset-0 rounded-3xl border border-white/12 transition-colors duration-500 group-hover:border-gold/45"
        />

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 space-y-2 p-4 lg:space-y-3 lg:p-6",
          )}
        >
          <h3
            className={cn(
              "font-bold tracking-tight text-white",
              compact ? "text-xl lg:text-2xl" : "text-2xl",
            )}
          >
            {name}
          </h3>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <p className="text-sm font-semibold text-gold-light">{priceLabel}</p>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/12 px-3 py-2 text-[11px] font-bold text-white backdrop-blur-md transition-all duration-500 group-hover:bg-gold-gradient group-hover:text-ink sm:text-xs lg:px-4 lg:py-2.5 lg:text-sm">
              {bookLabel}
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 rtl:rotate-180"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

type VehicleCardProps = {
  name: string;
  imageSrc: string;
  passengersLabel: string;
  luggageLabel: string;
  priceLabel: string;
  bookLabel: string;
  href: string;
  compact?: boolean;
  priority?: boolean;
};

export function VehicleCard({
  name,
  imageSrc,
  passengersLabel,
  luggageLabel,
  priceLabel,
  bookLabel,
  href,
  compact = false,
  priority = false,
}: VehicleCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-float transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-premium">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          compact ? "gap-3 p-4 lg:gap-5 lg:p-6" : "gap-5 p-6",
        )}
      >
        <h3
          className={cn(
            "font-bold tracking-tight",
            compact ? "text-lg lg:text-xl" : "text-xl",
          )}
        >
          {name}
        </h3>

        <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-muted-foreground lg:gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
            {passengersLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
            <Luggage className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
            {luggageLabel}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-5">
          <p className="text-base font-bold tracking-tight">{priceLabel}</p>
          <Link
            href={href}
            className="group/btn flex h-10 items-center gap-1.5 rounded-full bg-gold-gradient px-4 text-xs font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110"
          >
            {bookLabel}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 rtl:rotate-180"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  dark?: boolean;
};

export function FeatureCard({
  icon,
  title,
  description,
  dark = false,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5",
        dark
          ? "border border-white/10 bg-white/[0.045] backdrop-blur-md hover:border-gold/40 hover:bg-white/[0.07]"
          : "border border-border bg-card shadow-float hover:border-gold/45 hover:shadow-premium",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -end-16 h-40 w-40 rounded-full bg-gold/18 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative">
        <div
          className={cn(
            "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500",
            dark
              ? "bg-gold/12 text-gold group-hover:bg-gold-gradient group-hover:text-ink"
              : "bg-gold/12 text-gold-deep group-hover:bg-gold-gradient group-hover:text-ink",
          )}
        >
          {icon}
        </div>
        <h3
          className={cn(
            "mb-2.5 text-lg font-bold tracking-tight",
            dark ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-sm leading-relaxed",
            dark ? "text-white/60" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

type ReviewCardProps = {
  quote: string;
  authorInitials: string;
  authorName: string;
  rating: number;
};

export function ReviewCard({
  quote,
  authorInitials,
  authorName,
  rating,
}: ReviewCardProps) {
  return (
    <blockquote className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-float transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-premium">
      <Quote
        className="absolute -top-2 end-4 h-20 w-20 text-gold/8 transition-colors duration-500 group-hover:text-gold/14"
        aria-hidden
      />
      <div className="relative mb-5 flex gap-0.5 text-gold" aria-hidden>
        {Array.from({ length: rating }).map((_, index) => (
          <span key={index} className="text-base">
            ★
          </span>
        ))}
      </div>
      <p className="relative flex-1 text-base leading-relaxed text-foreground/90">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="relative mt-6 flex items-center gap-3 border-t border-border pt-5">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12 text-sm font-bold text-gold-deep"
        >
          {authorInitials}
        </span>
        <span className="sr-only">{authorName}</span>
      </footer>
    </blockquote>
  );
}

type StepCardProps = {
  step: number;
  icon: ReactNode;
  title: string;
  description: string;
};

export function StepCard({ step, icon, title, description }: StepCardProps) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      <div className="relative mb-6">
        <span
          aria-hidden
          className="absolute inset-0 animate-glow-pulse rounded-2xl bg-gold/30 blur-xl"
        />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient text-ink shadow-gold transition-transform duration-500 group-hover:-translate-y-1">
          {icon}
        </span>
        <span
          aria-hidden
          className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-ink text-[11px] font-bold text-gold-light"
        >
          {step}
        </span>
      </div>
      <h3 className="mb-2.5 text-lg font-bold tracking-tight">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
