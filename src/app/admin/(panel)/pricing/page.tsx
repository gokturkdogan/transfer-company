import Link from "next/link";
import { TableProperties } from "lucide-react";

import { db } from "@/db/client";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { PricingAdminRepository } from "@/features/admin/server/pricing-admin-repository";
import { PricingEditor } from "@/features/admin/components/PricingEditor";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";
import { CurrencyRepository } from "@/features/currencies/server/repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const locationAdminRepository = new LocationAdminRepository(db);
const pricingAdminRepository = new PricingAdminRepository(db);
const currencyRepository = new CurrencyRepository(db);

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ airport?: string }>;
}) {
  const params = await searchParams;
  const [airports, districts, vehicleCategories, enabledCurrencies] =
    await Promise.all([
      locationAdminRepository.findByType("AIRPORT", {
        includeInactive: true,
      }),
      locationAdminRepository.findByType("DISTRICT", {
        includeInactive: true,
      }),
      pricingAdminRepository.listVehicleCategories(),
      currencyRepository.listEnabled(),
    ]);

  const enabledCurrencyCodes = enabledCurrencies.map(
    (currency) => currency.code,
  );
  const selectedAirportId = params.airport ?? airports[0]?.id ?? null;

  const districtRoutes =
    selectedAirportId && enabledCurrencyCodes.length > 0
      ? await pricingAdminRepository.listDistrictRoutePrices(
          selectedAirportId,
          districts.map((district) => ({
            id: district.id,
            defaultName: district.defaultName,
            code: district.code,
          })),
          vehicleCategories.map((vehicle) => vehicle.id),
          enabledCurrencyCodes,
        )
      : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.pricing.title}
        subtitle={adminCopy.pricing.subtitle}
        icon={TableProperties}
      />

      {enabledCurrencyCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {adminCopy.pricing.emptyCurrencies}
            </p>
            <Button asChild>
              <Link href="/admin/currencies">{adminCopy.currencies.open}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {selectedAirportId && enabledCurrencyCodes.length > 0 ? (
        <PricingEditor
          // Remount on data-shape changes so the editor re-derives its drafts.
          key={`${selectedAirportId}:${enabledCurrencyCodes.join(",")}:${vehicleCategories.length}`}
          airportId={selectedAirportId}
          airports={airports.map((airport) => ({
            id: airport.id,
            label: airport.defaultName,
          }))}
          vehicleCategories={vehicleCategories.map((vehicle) => ({
            id: vehicle.id,
            defaultName: vehicle.defaultName,
          }))}
          districtRoutes={districtRoutes}
          enabledCurrencies={enabledCurrencyCodes}
        />
      ) : selectedAirportId ? null : (
        <p className="text-sm text-muted-foreground">
          {adminCopy.pricing.emptyAirport}
        </p>
      )}
    </div>
  );
}
