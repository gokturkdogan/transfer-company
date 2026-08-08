import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { VehicleCard } from "@/components/marketing/marketing-cards";
import { Reveal } from "@/components/motion/Reveal";
import { getFleetImage } from "@/config/homepage-images";
import type { FleetVehicleDto } from "@/features/marketing/types";
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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {fleet.map((vehicle, index) => (
            <Reveal key={vehicle.id} delay={index * 80} className="h-full">
              <VehicleCard
                name={vehicle.name}
                imageSrc={getFleetImage(vehicle.code)}
                passengersLabel={t("passengers", {
                  count: vehicle.passengerCapacity,
                })}
                luggageLabel={t("luggage", {
                  large: vehicle.largeLuggageCapacity,
                  cabin: vehicle.cabinLuggageCapacity,
                })}
                featureLabels={vehicle.features}
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
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
