"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateRoutePricesAction } from "@/features/admin/server/actions";
import type { AdminDistrictRoutePrice } from "@/features/admin/server/pricing-admin-repository";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type VehicleCategory = {
  id: string;
  defaultName: string;
};

type PricingMatrixProps = {
  airportId: string;
  vehicleCategories: VehicleCategory[];
  districtRoutes: AdminDistrictRoutePrice[];
};

export function PricingMatrix({
  airportId,
  vehicleCategories,
  districtRoutes,
}: PricingMatrixProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const prices: Array<{
          districtId: string;
          vehicleCategoryId: string;
          oneWayPriceMajor: number;
          roundTripPriceMajor: number | null;
        }> = [];

        for (const district of districtRoutes) {
          for (const vehicle of vehicleCategories) {
            const oneWay = formData.get(
              `one-way-${district.districtId}-${vehicle.id}`,
            );
            const roundTrip = formData.get(
              `round-trip-${district.districtId}-${vehicle.id}`,
            );

            if (oneWay === null || oneWay === "") {
              continue;
            }

            prices.push({
              districtId: district.districtId,
              vehicleCategoryId: vehicle.id,
              oneWayPriceMajor: Number(oneWay),
              roundTripPriceMajor:
                roundTrip === null || roundTrip === ""
                  ? null
                  : Number(roundTrip),
            });
          }
        }

        startTransition(async () => {
          setError(null);
          setSuccess(null);

          const result = await updateRoutePricesAction({
            airportId,
            prices,
          });

          if (!result.success) {
            setError(result.error.message);
            return;
          }

          setSuccess("Prices saved.");
          router.refresh();
        });
      }}
    >
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {success ? <Alert>{success}</Alert> : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>District</TableHead>
            {vehicleCategories.map((vehicle) => (
              <TableHead key={vehicle.id} colSpan={2}>
                {vehicle.defaultName}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead />
            {vehicleCategories.map((vehicle) => (
              <Fragment key={vehicle.id}>
                <TableHead>One-way (EUR)</TableHead>
                <TableHead>Round-trip (EUR)</TableHead>
              </Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {districtRoutes.map((district) => (
            <TableRow key={district.districtId}>
              <TableCell className="font-medium">
                {district.districtName}
              </TableCell>
              {vehicleCategories.map((vehicle) => {
                const price = district.prices.find(
                  (item) => item.vehicleCategoryId === vehicle.id,
                );

                return (
                  <Fragment key={`${district.districtId}-${vehicle.id}`}>
                    <TableCell>
                      <Input
                        name={`one-way-${district.districtId}-${vehicle.id}`}
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={
                          price?.oneWayPriceMinor != null
                            ? (price.oneWayPriceMinor / 100).toFixed(2)
                            : ""
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        name={`round-trip-${district.districtId}-${vehicle.id}`}
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={
                          price?.roundTripPriceMinor != null
                            ? (price.roundTripPriceMinor / 100).toFixed(2)
                            : ""
                        }
                      />
                    </TableCell>
                  </Fragment>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save prices"}
      </Button>
    </form>
  );
}
