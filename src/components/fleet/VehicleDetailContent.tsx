import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { FleetVehicleGallery } from "@/components/fleet/FleetVehicleGallery";
import { Reveal } from "@/components/motion/Reveal";
import type { FleetVehicleDetailDto } from "@/features/marketing/types";
import { resolveFleetDetailImages } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { Link } from "@/i18n/navigation";

type VehicleDetailContentProps = {
  vehicle: FleetVehicleDetailDto;
  bookingHref: string;
};

export async function VehicleDetailContent({
  vehicle,
  bookingHref,
}: VehicleDetailContentProps) {
  const t = await getTranslations("fleet.vehicleDetail");
  const images = resolveFleetDetailImages(
    vehicle.imageKey,
    vehicle.galleryImageKeys,
    vehicle.code,
  );
  const description =
    vehicle.description ??
    vehicle.shortDescription ??
    t("fallbackDescription", { name: vehicle.name });

  return (
    <>
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
            <Reveal>
              <FleetVehicleGallery images={images} alt={vehicle.name} />
            </Reveal>

            <Reveal delay={100} className="min-w-0 space-y-8">
              <div className="space-y-4">
                <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                  {t("overviewTitle")}
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>

              {vehicle.features.length > 0 ? (
                <div className="space-y-4">
                  <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                    {t("featuresTitle")}
                  </p>
                  <ul className="space-y-3">
                    {vehicle.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground shadow-float"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold-deep">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="min-w-0 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Link
                href={bookingHref}
                className="group inline-flex h-12 w-fit max-w-full shrink-0 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold-gradient px-7 text-sm font-bold text-ink shadow-gold transition-all duration-300 hover:brightness-110"
              >
                {t("book")}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                  aria-hidden
                />
              </Link>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
