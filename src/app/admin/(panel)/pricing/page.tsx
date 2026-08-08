import { db } from "@/db/client";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { PricingAdminRepository } from "@/features/admin/server/pricing-admin-repository";
import { PricingMatrix } from "@/features/admin/components/PricingMatrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const locationAdminRepository = new LocationAdminRepository(db);
const pricingAdminRepository = new PricingAdminRepository(db);

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ airport?: string }>;
}) {
  const params = await searchParams;
  const airports = await locationAdminRepository.findByType("AIRPORT", {
    includeInactive: true,
  });
  const districts = await locationAdminRepository.findByType("DISTRICT", {
    includeInactive: true,
  });
  const vehicleCategories =
    await pricingAdminRepository.listVehicleCategories();

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
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Airport to district route prices by vehicle category.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Airport</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex max-w-md items-end gap-3">
            <div className="flex-1 space-y-2">
              <label htmlFor="airport" className="text-sm font-medium">
                Select airport
              </label>
              <select
                id="airport"
                name="airport"
                defaultValue={selectedAirportId ?? ""}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.id}>
                    {airport.defaultName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Load
            </button>
          </form>
        </CardContent>
      </Card>

      {selectedAirportId ? (
        <PricingMatrix
          airportId={selectedAirportId}
          vehicleCategories={vehicleCategories}
          districtRoutes={districtRoutes}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Add an airport location before configuring prices.
        </p>
      )}
    </div>
  );
}
