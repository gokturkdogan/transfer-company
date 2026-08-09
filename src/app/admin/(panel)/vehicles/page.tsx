import Link from "next/link";
import Image from "next/image";
import { Car } from "lucide-react";

import { DEFAULT_LOCALE } from "@/config/constants";
import { db } from "@/db/client";
import { VehicleAdminRepository } from "@/features/admin/server/vehicle-admin-repository";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminCopy } from "@/features/admin/copy";

const vehicleAdminRepository = new VehicleAdminRepository(db);

export default async function AdminVehiclesPage() {
  const vehicles = await vehicleAdminRepository.list(true);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.vehicles.title}
        subtitle={adminCopy.vehicles.subtitle}
        icon={Car}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/vehicles/new">{adminCopy.vehicles.addNew}</Link>
          </Button>
        }
      />

      <AdminContentCard title={adminCopy.vehicles.title} flush>
        <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.vehicles.table.vehicle}</TableHead>
                <TableHead>{adminCopy.vehicles.table.code}</TableHead>
                <TableHead>{adminCopy.vehicles.table.capacity}</TableHead>
                <TableHead>{adminCopy.vehicles.table.features}</TableHead>
                <TableHead>{adminCopy.vehicles.table.status}</TableHead>
                <TableHead className="text-right">
                  {adminCopy.vehicles.table.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {vehicle.coverImageKey ? (
                        <div className="relative aspect-video w-14 shrink-0 overflow-hidden rounded">
                          <Image
                            src={vehicle.coverImageKey}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video w-14 shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.code}</TableCell>
                  <TableCell>
                    {adminCopy.vehicles.table.passengers(
                      vehicle.passengerCapacity,
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.map((feature, index) => {
                        const label =
                          feature.labels[DEFAULT_LOCALE] ??
                          Object.values(feature.labels).find(Boolean);

                        if (!label) {
                          return null;
                        }

                        return (
                          <Badge key={`${vehicle.id}-${index}`} variant="secondary">
                            {label}
                          </Badge>
                        );
                      })}
                      {vehicle.features.length === 0 ? "—" : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={vehicle.isActive ? "success" : "destructive"}
                    >
                      {vehicle.isActive
                        ? adminCopy.locations.status.active
                        : adminCopy.locations.status.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
                        {adminCopy.vehicles.table.edit}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
      </AdminContentCard>
    </div>
  );
}
