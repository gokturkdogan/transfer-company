"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { DEFAULT_CURRENCY } from "@/config/constants";
import { updateRoutePricesAction } from "@/features/admin/server/actions";
import type { AdminDistrictRoutePrice } from "@/features/admin/server/pricing-admin-repository";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminField } from "@/features/admin/components/shell/AdminField";
import { AdminSelect } from "@/features/admin/components/shell/AdminSelect";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type VehicleCategory = {
  id: string;
  defaultName: string;
};

type AirportOption = {
  id: string;
  label: string;
};

type PriceFields = {
  oneWay: string;
  roundTrip: string;
};

type PricingEditorProps = {
  airportId: string;
  airports: AirportOption[];
  vehicleCategories: VehicleCategory[];
  districtRoutes: AdminDistrictRoutePrice[];
};

function priceKey(districtId: string, vehicleCategoryId: string): string {
  return `${districtId}:${vehicleCategoryId}`;
}

function buildInitialPrices(
  districtRoutes: AdminDistrictRoutePrice[],
  vehicleCategories: VehicleCategory[],
): Record<string, PriceFields> {
  const map: Record<string, PriceFields> = {};

  for (const district of districtRoutes) {
    for (const vehicle of vehicleCategories) {
      const key = priceKey(district.districtId, vehicle.id);
      const cell = district.prices.find(
        (item) =>
          item.vehicleCategoryId === vehicle.id &&
          item.currency === DEFAULT_CURRENCY,
      );

      map[key] = {
        oneWay:
          cell?.oneWayPriceMinor != null
            ? (cell.oneWayPriceMinor / 100).toFixed(2)
            : "",
        roundTrip:
          cell?.roundTripPriceMinor != null
            ? (cell.roundTripPriceMinor / 100).toFixed(2)
            : "",
      };
    }
  }

  return map;
}

function countFilledPricesForVehicle(
  districtRoutes: AdminDistrictRoutePrice[],
  prices: Record<string, PriceFields>,
  vehicleId: string,
): number {
  let filled = 0;

  for (const district of districtRoutes) {
    const key = priceKey(district.districtId, vehicleId);
    if (prices[key]?.oneWay.trim()) {
      filled += 1;
    }
  }

  return filled;
}

type DistrictPriceInputsProps = {
  districtId: string;
  districtName: string;
  vehicleId: string;
  field: keyof PriceFields;
  fieldLabel: string;
  prices: Record<string, PriceFields>;
  onUpdate: (
    districtId: string,
    field: keyof PriceFields,
    value: string,
  ) => void;
};

function DistrictPriceInput({
  districtId,
  districtName,
  vehicleId,
  field,
  fieldLabel,
  prices,
  onUpdate,
}: DistrictPriceInputsProps) {
  const key = priceKey(districtId, vehicleId);
  const entry = prices[key] ?? { oneWay: "", roundTrip: "" };

  return (
    <Input
      type="number"
      min={0}
      step="0.01"
      inputMode="decimal"
      value={entry[field]}
      onChange={(event) => onUpdate(districtId, field, event.target.value)}
      className="h-8 text-xs"
      aria-label={`${districtName} ${fieldLabel} ${DEFAULT_CURRENCY}`}
    />
  );
}

export function PricingEditor({
  airportId,
  airports,
  vehicleCategories,
  districtRoutes,
}: PricingEditorProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [districtQuery, setDistrictQuery] = useState("");

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    vehicleCategories[0]?.id ?? "",
  );

  const [prices, setPrices] = useState(() =>
    buildInitialPrices(districtRoutes, vehicleCategories),
  );

  const filteredDistricts = useMemo(() => {
    const query = districtQuery.trim().toLowerCase();
    if (!query) {
      return districtRoutes;
    }

    return districtRoutes.filter(
      (district) =>
        district.districtName.toLowerCase().includes(query) ||
        district.districtCode.toLowerCase().includes(query),
    );
  }, [districtQuery, districtRoutes]);

  const selectedVehicle = vehicleCategories.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  const totalSlots = districtRoutes.length;

  const filledForVehicle = useMemo(
    () =>
      countFilledPricesForVehicle(districtRoutes, prices, selectedVehicleId),
    [districtRoutes, prices, selectedVehicleId],
  );

  function updatePrice(
    districtId: string,
    field: keyof PriceFields,
    value: string,
  ) {
    const key = priceKey(districtId, selectedVehicleId);
    setPrices((current) => ({
      ...current,
      [key]: {
        oneWay: current[key]?.oneWay ?? "",
        roundTrip: current[key]?.roundTrip ?? "",
        [field]: value,
      },
    }));
  }

  function handleSave() {
    const payload: Array<{
      districtId: string;
      vehicleCategoryId: string;
      currency: string;
      oneWayPriceMajor: number;
      roundTripPriceMajor: number | null;
    }> = [];

    for (const district of districtRoutes) {
      for (const vehicle of vehicleCategories) {
        const key = priceKey(district.districtId, vehicle.id);
        const entry = prices[key];
        const oneWay = entry?.oneWay.trim();

        if (!oneWay) {
          continue;
        }

        const roundTrip = entry?.roundTrip.trim();

        payload.push({
          districtId: district.districtId,
          vehicleCategoryId: vehicle.id,
          currency: DEFAULT_CURRENCY,
          oneWayPriceMajor: Number(oneWay),
          roundTripPriceMajor: roundTrip ? Number(roundTrip) : null,
        });
      }
    }

    startTransition(async () => {
      setError(null);
      setSuccess(null);

      const result = await updateRoutePricesAction({
        airportId,
        prices: payload,
      });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      setSuccess(adminCopy.pricing.saved);
      router.refresh();
    });
  }

  if (vehicleCategories.length === 0) {
    return (
      <Alert>
        <p>{adminCopy.pricing.emptyVehicles}</p>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {success ? <Alert>{success}</Alert> : null}

      <AdminContentCard flush>
        <div className="space-y-4 border-b border-slate-100 bg-slate-50/80 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
            <AdminField
              label={adminCopy.pricing.selectAirport}
              htmlFor="pricing-airport"
            >
              <AdminSelect
                id="pricing-airport"
                value={airportId}
                onChange={(event) => {
                  const nextAirport = event.target.value;
                  router.push(
                    nextAirport
                      ? `/admin/pricing?airport=${nextAirport}`
                      : "/admin/pricing",
                  );
                }}
              >
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.id}>
                    {airport.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField
              label={adminCopy.pricing.filterDistrict}
              htmlFor="pricing-district-search"
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="pricing-district-search"
                  value={districtQuery}
                  onChange={(event) => setDistrictQuery(event.target.value)}
                  placeholder={adminCopy.pricing.filterDistrictPlaceholder}
                  className="pl-9"
                />
              </div>
            </AdminField>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {adminCopy.pricing.selectVehicle}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {vehicleCategories.map((vehicle) => {
                const filled = countFilledPricesForVehicle(
                  districtRoutes,
                  prices,
                  vehicle.id,
                );
                const isActive = vehicle.id === selectedVehicleId;
                const isComplete = totalSlots > 0 && filled === totalSlots;

                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={cn(
                      "cursor-pointer shrink-0 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "border-blue-600 bg-blue-50 text-blue-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {vehicle.defaultName}
                      {isComplete ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {filled}/{totalSlots} {adminCopy.pricing.pricesFilled}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-slate-600">
            {adminCopy.pricing.editingContext(selectedVehicle?.defaultName ?? "—")}{" "}
            · {filledForVehicle}/{totalSlots} {adminCopy.pricing.pricesFilled}
          </p>
        </div>

        <div className="max-h-[min(58vh,560px)] overflow-auto">
          <table className="admin-table w-full min-w-[720px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
              <tr>
                <th className="w-[min(160px,18%)] px-3 py-2.5 text-left font-semibold text-slate-600">
                  {adminCopy.pricing.district}
                </th>
                <th className="min-w-[240px] px-3 py-2.5 text-left font-semibold text-slate-600">
                  {adminCopy.pricing.oneWay}
                </th>
                <th className="min-w-[240px] px-3 py-2.5 text-left font-semibold text-slate-600">
                  {adminCopy.pricing.roundTrip}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {adminCopy.pricing.noDistrictMatch}
                  </td>
                </tr>
              ) : (
                filteredDistricts.map((district) => (
                  <tr
                    key={district.districtId}
                    className="border-t border-slate-100 align-top"
                  >
                    <td className="px-3 py-2 font-medium text-slate-900">
                      <div className="text-sm">{district.districtName}</div>
                      <div className="text-[11px] text-slate-400">
                        {district.districtCode}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <DistrictPriceInput
                        districtId={district.districtId}
                        districtName={district.districtName}
                        vehicleId={selectedVehicleId}
                        field="oneWay"
                        fieldLabel={adminCopy.pricing.oneWay}
                        prices={prices}
                        onUpdate={updatePrice}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <DistrictPriceInput
                        districtId={district.districtId}
                        districtName={district.districtName}
                        vehicleId={selectedVehicleId}
                        field="roundTrip"
                        fieldLabel={adminCopy.pricing.roundTrip}
                        prices={prices}
                        onUpdate={updatePrice}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white p-4">
          <p className="text-xs text-slate-500">{adminCopy.pricing.saveHint}</p>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? adminCopy.pricing.saving : adminCopy.pricing.savePrices}
          </Button>
        </div>
      </AdminContentCard>
    </div>
  );
}
