import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { DestinationCard } from "@/components/marketing/marketing-cards";
import { PremiumCarousel } from "@/components/marketing/PremiumCarousel";
import { getDestinationImage } from "@/config/homepage-images";
import type { DistrictStartingPriceDto } from "@/features/marketing/types";
import { formatMoney } from "@/lib/money";

type PopularDestinationsProps = {
  destinations: DistrictStartingPriceDto[];
  airportId: string;
};

const LARA_DESTINATION = {
  code: "LARA",
  name: "Lara",
  startingFromMinor: 4000,
  currency: "EUR",
} as const;

export async function PopularDestinations({
  destinations,
  airportId,
}: PopularDestinationsProps) {
  const t = await getTranslations("home.destinations");
  const locale = await getLocale();

  const allDestinations = [
    ...destinations,
    ...(destinations.some((d) => d.code === "LARA")
      ? []
      : [
          {
            id: "lara-static",
            code: LARA_DESTINATION.code,
            name: LARA_DESTINATION.name,
            startingFromMinor: LARA_DESTINATION.startingFromMinor,
            currency: LARA_DESTINATION.currency,
          },
        ]),
  ];

  return (
    <Section id="destinations">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <PremiumCarousel label={t("title")}>
          {allDestinations.map((destination) => {
            const bookingHref =
              destination.id === "lara-static"
                ? `/booking?airport=${airportId}`
                : `/booking?airport=${airportId}&district=${destination.id}`;

            return (
              <DestinationCard
                key={destination.id}
                compact
                name={destination.name}
                imageSrc={getDestinationImage(destination.code)}
                priceLabel={t("from", {
                  price: formatMoney(
                    {
                      amountMinor: destination.startingFromMinor,
                      currency: destination.currency,
                    },
                    locale,
                  ),
                })}
                bookLabel={t("book")}
                href={bookingHref}
              />
            );
          })}
        </PremiumCarousel>
      </Container>
    </Section>
  );
}
