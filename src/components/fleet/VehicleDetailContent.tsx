import { ArrowRight, Check, Sparkles } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { FleetVehicleGallery } from "@/components/fleet/FleetVehicleGallery";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import type { FleetVehicleDetailDto } from "@/features/marketing/types";
import { formatFleetDisplayLabel } from "@/features/marketing/lib/fleet-vehicle-slug";
import { resolveFleetDetailImages } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/money";

type VehicleDetailContentProps = {
  vehicle: FleetVehicleDetailDto;
  bookingHref: string;
};

export async function VehicleDetailContent({
  vehicle,
  bookingHref,
}: VehicleDetailContentProps) {
  const t = await getTranslations("fleet.vehicleDetail");
  const locale = await getLocale();
  const images = resolveFleetDetailImages(
    vehicle.imageKey,
    vehicle.galleryImageKeys,
    vehicle.code,
  );
  const description =
    vehicle.description ??
    vehicle.shortDescription ??
    t("fallbackDescription", { name: vehicle.name });
  const priceLabel = formatMoney(
    {
      amountMinor: vehicle.startingFromMinor,
      currency: vehicle.currency,
    },
    locale,
  );
  const codeLabel = formatFleetDisplayLabel(vehicle.code);

  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:items-start lg:gap-12 xl:gap-16">
          <Reveal className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgb(200_164_93/0.16),transparent_70%)] blur-2xl"
            />
            <FleetVehicleGallery images={images} alt={vehicle.name} />
          </Reveal>

          <Reveal delay={100} className="min-w-0 space-y-8">
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                {t("overviewTitle")}
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground/90 sm:text-base">
                {t("experienceParagraph", {
                  name: vehicle.name,
                  code: codeLabel,
                })}
              </p>
            </div>

            {vehicle.features.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                  {t("featuresTitle")}
                </p>
                <ul className="grid gap-3">
                  {vehicle.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground shadow-float"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold-deep">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 leading-snug">
                        {formatFleetDisplayLabel(feature)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-gold/25 surface-ink p-6 shadow-premium">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 futuristic-grid opacity-30 [mask-image:radial-gradient(70%_70%_at_50%_40%,#000,transparent)]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -top-20 -end-16 h-52 w-52 animate-aurora rounded-full bg-gold/16 blur-[90px]"
              />

              <div className="relative space-y-3">
                <p className="ring-gold-hairline inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  {t("priceBadge")}
                </p>
                <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {t("from", { price: priceLabel })}
                </p>
                <p className="text-sm leading-relaxed text-white/65">
                  {t("bookNote")}
                </p>
                <Link
                  href={bookingHref}
                  className="group mt-2 inline-flex h-12 w-fit max-w-full shrink-0 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold-gradient px-7 text-sm font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110"
                >
                  {t("book")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
