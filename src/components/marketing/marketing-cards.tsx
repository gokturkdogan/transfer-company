import Image from "next/image";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type DestinationCardProps = {
  name: string;
  imageSrc: string;
  priceLabel: string;
  bookLabel: string;
  href: string;
  className?: string;
};

export function DestinationCard({
  name,
  imageSrc,
  priceLabel,
  bookLabel,
  href,
  className,
}: DestinationCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <h3 className="absolute bottom-4 start-4 text-2xl font-semibold text-white">
          {name}
        </h3>
      </div>
      <div className="flex items-center justify-between gap-4 p-5">
        <p className="text-sm font-medium text-muted-foreground">{priceLabel}</p>
        <Button variant="gold" size="sm" asChild>
          <Link href={href}>{bookLabel}</Link>
        </Button>
      </div>
    </article>
  );
}

type VehicleCardProps = {
  name: string;
  imageSrc: string;
  passengersLabel: string;
  luggageLabel: string;
  featureLabels?: string[];
  priceLabel: string;
  bookLabel: string;
  href: string;
};

export function VehicleCard({
  name,
  imageSrc,
  passengersLabel,
  luggageLabel,
  featureLabels = [],
  priceLabel,
  bookLabel,
  href,
}: VehicleCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-6">
        <h3 className="text-xl font-semibold">{name}</h3>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">{passengersLabel}</span>
          <span className="rounded-full bg-muted px-3 py-1">{luggageLabel}</span>
          {featureLabels.map((feature) => (
            <span key={feature} className="rounded-full bg-muted px-3 py-1">
              {feature}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-sm font-semibold">{priceLabel}</p>
          <Button variant="gold" size="sm" asChild>
            <Link href={href}>{bookLabel}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

type ReviewCardProps = {
  quote: string;
  author: string;
  rating: number;
};

export function ReviewCard({ quote, author, rating }: ReviewCardProps) {
  return (
    <blockquote className="flex h-full flex-col rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-4 flex gap-0.5 text-accent" aria-hidden>
        {Array.from({ length: rating }).map((_, index) => (
          <span key={index}>★</span>
        ))}
      </div>
      <p className="flex-1 text-base leading-relaxed text-foreground/90">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-6 text-sm font-medium text-muted-foreground">
        — {author}
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
    <div className="relative flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
        {step}
      </div>
      <div className="mb-4 text-accent">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
