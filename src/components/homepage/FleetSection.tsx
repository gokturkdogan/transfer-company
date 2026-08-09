import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { VehicleCard } from "@/components/marketing/marketing-cards";
import { PremiumCarousel } from "@/components/marketing/PremiumCarousel";
import type { FleetVehicleDto } from "@/features/marketing/types";
import { resolveVehicleCoverImage } from "@/features/vehicles/lib/resolve-vehicle-cover-image";
import { formatMoney } from "@/lib/money";

type FleetSectionProps = {
  fleet: FleetVehicleDto[];
  airportId: string;
};

export async function FleetSection({
  fleet,
  airportId,
}: FleetSectionProps) {
  const t = await getTranslations("home.fleet");
  const locale = await getLocale();

  return (
    <Section id="fleet" variant="muted">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <PremiumCarousel label={t("title")}>
          {fleet.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              compact
              priority={index < 3}
              name={vehicle.name}
              imageSrc={resolveVehicleCoverImage(vehicle.imageKey, vehicle.code)}
              passengersLabel={t("passengers", {
                count: vehicle.passengerCapacity,
              })}
              luggageLabel={t("luggage", {
                large: vehicle.largeLuggageCapacity,
              })}
              priceLabel={t("from", {
                price: formatMoney(
                  {
                    amountMinor: vehicle.startingFromMinor,
                    currency: vehicle.currency,
                  },
                  locale,
                ),
              })}
              bookLabel={t("book")}
              href={`/booking?airport=${airportId}`}
            />
          ))}
        </PremiumCarousel>
      </Container>
    </Section>
  );
}
