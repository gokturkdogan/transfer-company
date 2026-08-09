import { TableProperties } from "lucide-react";

import { DEFAULT_CURRENCY } from "@/config/constants";
import { db } from "@/db/client";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { PricingAdminRepository } from "@/features/admin/server/pricing-admin-repository";
import { PricingEditor } from "@/features/admin/components/PricingEditor";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { adminCopy } from "@/features/admin/copy";

const locationAdminRepository = new LocationAdminRepository(db);
const pricingAdminRepository = new PricingAdminRepository(db);

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ airport?: string }>;
}) {
  const params = await searchParams;
  const [airports, districts, vehicleCategories] = await Promise.all([
    locationAdminRepository.findByType("AIRPORT", {
      includeInactive: true,
    }),
    locationAdminRepository.findByType("DISTRICT", {
      includeInactive: true,
    }),
    pricingAdminRepository.listVehicleCategories(),
  ]);

  const selectedAirportId = params.airport ?? airports[0]?.id ?? null;

  const districtRoutes = selectedAirportId
    ? await pricingAdminRepository.listDistrictRoutePrices(
        selectedAirportId,
        districts.map((district) => ({
          id: district.id,
          defaultName: district.defaultName,
          code: district.code,
        })),
        vehicleCategories.map((vehicle) => vehicle.id),
        [DEFAULT_CURRENCY],
      )
    : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.pricing.title}
        subtitle={adminCopy.pricing.subtitle}
        icon={TableProperties}
      />

      {selectedAirportId ? (
        <PricingEditor
          key={`${selectedAirportId}:${vehicleCategories.length}`}
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
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {adminCopy.pricing.emptyAirport}
        </p>
      )}
    </div>
  );
}
