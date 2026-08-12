import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { DestinationCard } from "@/components/marketing/marketing-cards";
import { PremiumCarousel } from "@/components/marketing/PremiumCarousel";
import type { DistrictStartingPriceDto } from "@/features/marketing/types";
import { resolveDestinationImage } from "@/features/marketing/lib/resolve-destination-image";
import { formatMoney } from "@/lib/money";

type PopularDestinationsProps = {
  destinations: DistrictStartingPriceDto[];
};

export async function PopularDestinations({
  destinations,
}: PopularDestinationsProps) {
  const t = await getTranslations("home.destinations");
  const locale = await getLocale();

  if (destinations.length === 0) {
    return null;
  }

  return (
    <Section id="destinations">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <PremiumCarousel label={t("title")}>
          {destinations.map((destination, index) => {
            return (
              <DestinationCard
                key={destination.id}
                compact
                priority={index < 3}
                name={destination.name}
                imageSrc={resolveDestinationImage(
                  destination.imageKey,
                  destination.code,
                )}
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
                href={{
                  pathname: "/booking",
                  query: { district: destination.id },
                }}
              />
            );
          })}
        </PremiumCarousel>
      </Container>
    </Section>
  );
}
