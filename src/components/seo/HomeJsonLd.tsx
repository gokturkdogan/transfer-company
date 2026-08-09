import { getTranslations } from "next-intl/server";

import { clientEnv } from "@/config/env";
import { LOCALES } from "@/config/constants";
import { pickPrimaryChannel } from "@/features/contact/domain/contact-links";
import { getPublicContactChannels } from "@/features/contact/server/public-contact";

const FAQ_INDEXES = [0, 1, 2, 3, 4, 5] as const;

type HomeJsonLdProps = {
  locale: string;
};

/**
 * Structured data for the homepage: organisation identity, the searchable
 * service surface and the FAQ block rendered further down the page.
 */
export async function HomeJsonLd({ locale }: HomeJsonLdProps) {
  const [common, meta, faq, contactChannels] = await Promise.all([
    getTranslations("common"),
    getTranslations("home.meta"),
    getTranslations("home.faq"),
    getPublicContactChannels(),
  ]);

  const primaryPhone = pickPrimaryChannel(contactChannels.phones, "");
  const primaryEmail = pickPrimaryChannel(contactChannels.emails, "");

  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const pageUrl = `${baseUrl}/${locale}`;

  const graph = [
    {
      "@type": "TravelAgency",
      "@id": `${baseUrl}/#organization`,
      name: common("appName"),
      description: meta("description"),
      url: pageUrl,
      image: `${baseUrl}/images/homepage/hero-airport-transfer.jpg`,
      telephone: primaryPhone,
      email: primaryEmail,
      priceRange: "€€",
      areaServed: [
        "Antalya",
        "Lara",
        "Kemer",
        "Belek",
        "Side",
        "Alanya",
      ].map((name) => ({ "@type": "Place", name })),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Antalya",
        addressCountry: "TR",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "2400",
        bestRating: "5",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: pageUrl,
      name: meta("title"),
      description: meta("description"),
      inLanguage: [...LOCALES],
      publisher: { "@id": `${baseUrl}/#organization` },
    },
    {
      "@type": "Service",
      name: meta("title"),
      serviceType: "Airport transfer",
      provider: { "@id": `${baseUrl}/#organization` },
      areaServed: { "@type": "Place", name: "Antalya, Türkiye" },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: `${pageUrl}/booking`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}/#faq`,
      mainEntity: FAQ_INDEXES.map((index) => ({
        "@type": "Question",
        name: faq(`items.${index}.question`),
        acceptedAnswer: {
          "@type": "Answer",
          text: faq(`items.${index}.answer`),
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Serialised server-side from translation files only — no user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
