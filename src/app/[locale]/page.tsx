import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/shared/ContactCta";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { TrustSignals } from "@/components/shared/TrustSignals";
import { TransferSearchLauncher } from "@/features/booking/components/TransferSearchLauncher";
import { BookingFlowProvider } from "@/features/booking/context/booking-flow-context";
import { db } from "@/db/client";
import { LocationRepository } from "@/features/locations/server/repository";
import { LocationService } from "@/features/locations/server/service";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const common = await getTranslations("common");
  const locationService = new LocationService(new LocationRepository(db));
  const airports = await locationService.getAirports(locale);
  const cities = await locationService.getCities(locale);
  const cityId = cities.length === 1 ? cities[0]?.id : "";
  const districts = (
    await Promise.all(
      cities.map((city) => locationService.getDistrictsForCity(city.id, locale)),
    )
  ).flat();

  return (
    <>
      <main className="flex flex-1 flex-col">
        <section className="border-b border-border bg-muted/30 px-6 py-16">
          <div className="mx-auto max-w-5xl space-y-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {common("tagline")}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("description")}
            </p>
            <Link
              href="/booking"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground"
            >
              {t("cta")}
            </Link>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-3xl">
            <BookingFlowProvider
              airports={airports}
              cities={cities}
              districts={districts}
              initialSearch={{ cityId: cityId ?? "" }}
            >
              <TransferSearchLauncher />
            </BookingFlowProvider>
          </div>
        </section>

        <section className="border-t border-border px-6 py-12">
          <div className="mx-auto max-w-5xl space-y-6">
            <TrustSignals />
            <ContactCta />
          </div>
        </section>
      </main>
      <MobileContactBar />
    </>
  );
}
