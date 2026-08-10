"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteVehicleAction } from "@/features/admin/server/actions";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { Button } from "@/components/ui/button";

type VehicleDeleteButtonProps = {
  vehicleId: string;
  vehicleName: string;
  redirectToList?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function VehicleDeleteButton({
  vehicleId,
  vehicleName,
  redirectToList = false,
  size = "sm",
  className,
}: VehicleDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(adminCopy.vehicles.delete.confirm(vehicleName))) {
      return;
    }

    startTransition(async () => {
      setError(null);

      const result = await deleteVehicleAction({ id: vehicleId });

      if (!result.success) {
        setError(translateAdminError(result.error.message));
        return;
      }

      if (redirectToList) {
        router.push("/admin/vehicles");
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className={className}>
      {error ? (
        <p className="mb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="destructive"
        size={size}
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending
          ? adminCopy.vehicles.delete.deleting
          : adminCopy.vehicles.delete.button}
      </Button>
    </div>
  );
}

type VehicleTableActionsProps = {
  vehicleId: string;
  vehicleName: string;
};

export function VehicleTableActions({
  vehicleId,
  vehicleName,
}: VehicleTableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/vehicles/${vehicleId}/edit`}>
          {adminCopy.vehicles.table.edit}
        </Link>
      </Button>
      <VehicleDeleteButton vehicleId={vehicleId} vehicleName={vehicleName} />
    </div>
  );
}
