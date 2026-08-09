import { ArrowRight, Luggage, Users } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import type { FleetVehicleDto } from "@/features/marketing/types";
import { toFleetVehiclePath } from "@/features/marketing/lib/fleet-vehicle-slug";
import { resolveVehicleCoverImage } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type FleetShowcaseProps = {
  fleet: FleetVehicleDto[];
};

export async function FleetShowcase({ fleet }: FleetShowcaseProps) {
  const t = await getTranslations("fleet.showcase");
  const cardT = await getTranslations("home.fleet");
  const locale = await getLocale();

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {fleet.map((vehicle, index) => {
            const isFeatured = index === 0 && fleet.length > 1;

            return (
              <Reveal
                key={vehicle.id}
                delay={index * 70}
                className={cn(isFeatured && "md:col-span-2 xl:col-span-1")}
              >
                <article
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-float transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-premium",
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:linear-gradient(135deg,rgb(200_164_93/0.08),transparent_55%)]"
                  />

                  <div
                    className={cn(
                      "relative overflow-hidden bg-muted",
                      isFeatured
                        ? "aspect-[16/9] md:aspect-[21/9] xl:aspect-video"
                        : "aspect-video",
                    )}
                  >
                    <Image
                      src={resolveVehicleCoverImage(vehicle.imageKey, vehicle.code)}
                      alt={vehicle.name}
                      fill
                      priority={index < 3}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 futuristic-grid opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_40%,transparent)]"
                    />
                    <span className="absolute start-4 top-4 rounded-full border border-white/20 bg-ink/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md">
                      {vehicle.code}
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
                    />
                  </div>

                  <div className="relative flex flex-1 flex-col gap-4 p-5 sm:p-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t("vehicleHint", { code: vehicle.code })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                        <Users className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
                        {cardT("passengers", { count: vehicle.passengerCapacity })}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                        <Luggage className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
                        {cardT("luggage", { large: vehicle.largeLuggageCapacity })}
                      </span>
                    </div>

                    <div className="mt-auto flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-lg font-bold tracking-tight">
                        {cardT("from", {
                          price: formatMoney(
                            {
                              amountMinor: vehicle.startingFromMinor,
                              currency: vehicle.currency,
                            },
                            locale,
                          ),
                        })}
                      </p>
                      <Link
                        href={toFleetVehiclePath(vehicle.code)}
                        className="group/btn inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 text-sm font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110"
                      >
                        {cardT("details")}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 rtl:rotate-180"
                          aria-hidden
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
