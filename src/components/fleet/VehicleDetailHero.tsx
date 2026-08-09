import { ArrowLeft, Briefcase, Luggage, Users } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { FleetVehicleGallery } from "@/components/fleet/FleetVehicleGallery";
import type { FleetVehicleDetailDto } from "@/features/marketing/types";
import {
  resolveFleetDetailImages,
  resolveVehicleCoverImage,
} from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/money";

type VehicleDetailHeroProps = {
  vehicle: FleetVehicleDetailDto;
};

export async function VehicleDetailHero({ vehicle }: VehicleDetailHeroProps) {
  const t = await getTranslations("fleet.vehicleDetail");
  const locale = await getLocale();
  const heroImage = resolveVehicleCoverImage(vehicle.imageKey, vehicle.code);
  const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");

  return (
    <section className="relative isolate min-h-[46vh] overflow-hidden bg-ink lg:min-h-[50vh]">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/75 to-ink/95"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-ink/75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_52%_at_50%_0%,rgb(200_164_93/0.24),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 futuristic-grid opacity-35 [mask-image:radial-gradient(62%_58%_at_50%_42%,#000,transparent)]"
      />

      <Container className="relative flex min-h-[46vh] flex-col justify-end pb-12 pt-24 lg:min-h-[50vh] lg:pb-16 lg:pt-28">
        <div className="max-w-3xl animate-fade-up space-y-5">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-gold-light"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t("backToFleet")}
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="ring-gold-hairline rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md">
              {vehicle.code}
            </span>
            {brandModel ? (
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75 backdrop-blur-md">
                {brandModel}
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {vehicle.name}
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {vehicle.shortDescription ?? t("fallbackShortDescription", { name: vehicle.name })}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
              <Users className="h-3.5 w-3.5 text-gold" aria-hidden />
              {t("passengers", { count: vehicle.passengerCapacity })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
              <Luggage className="h-3.5 w-3.5 text-gold" aria-hidden />
              {t("largeLuggage", { count: vehicle.largeLuggageCapacity })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
              <Briefcase className="h-3.5 w-3.5 text-gold" aria-hidden />
              {t("cabinLuggage", { count: vehicle.cabinLuggageCapacity })}
            </span>
          </div>

          <p className="text-lg font-bold text-gold-light">
            {t("from", {
              price: formatMoney(
                {
                  amountMinor: vehicle.startingFromMinor,
                  currency: vehicle.currency,
                },
                locale,
              ),
            })}
          </p>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
    </section>
  );
}
