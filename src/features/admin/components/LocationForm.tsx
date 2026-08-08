"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createLocationAction,
  updateLocationAction,
} from "@/features/admin/server/actions";
import type { AdminLocationRecord } from "@/features/admin/server/location-admin-repository";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SelectOption = {
  id: string;
  label: string;
  cityId?: string;
};

type LocationFormProps = {
  mode: "create" | "edit";
  type: "AIRPORT" | "CITY" | "DISTRICT" | "HOTEL";
  location?: AdminLocationRecord;
  parentOptions: SelectOption[];
  cityOptions?: SelectOption[];
  initialCityId?: string | null;
};

export function LocationForm({
  mode,
  type,
  location,
  parentOptions,
  cityOptions = [],
  initialCityId = null,
}: LocationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedCityId, setSelectedCityId] = useState(
    initialCityId ?? cityOptions[0]?.id ?? "",
  );

  const districtOptions = useMemo(() => {
    if (type !== "HOTEL" || !selectedCityId) {
      return parentOptions;
    }

    return parentOptions.filter(
      (option) => option.cityId === selectedCityId,
    );
  }, [parentOptions, selectedCityId, type]);

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const payload = {
          type,
          code: formData.get("code"),
          defaultName: formData.get("defaultName"),
          parentId:
            type === "CITY" ? null : formData.get("parentId") || null,
          address: formData.get("address") || null,
          sortOrder: formData.get("sortOrder"),
          isActive: formData.get("isActive") === "on",
        };

        startTransition(async () => {
          setError(null);

          const result =
            mode === "create"
              ? await createLocationAction(payload)
              : await updateLocationAction({
                  id: location?.id,
                  ...payload,
                });

          if (!result.success) {
            setError(result.error.message);
            return;
          }

          router.push("/admin/locations");
          router.refresh();
        });
      }}
    >
      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          name="code"
          defaultValue={location?.code}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultName">Name</Label>
        <Input
          id="defaultName"
          name="defaultName"
          defaultValue={location?.defaultName}
          required
        />
      </div>

      {type === "HOTEL" && cityOptions.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="cityId">City</Label>
          <select
            id="cityId"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={selectedCityId}
            onChange={(event) => setSelectedCityId(event.target.value)}
          >
            {cityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {type !== "CITY" ? (
        <div className="space-y-2">
          <Label htmlFor="parentId">
            {type === "AIRPORT"
              ? "City (optional)"
              : type === "DISTRICT"
                ? "City"
                : "District"}
          </Label>
          <select
            id="parentId"
            name="parentId"
            key={`${type}-${selectedCityId}`}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            defaultValue={location?.parentId ?? districtOptions[0]?.id ?? ""}
            required={type === "DISTRICT" || type === "HOTEL"}
          >
            {type === "AIRPORT" ? <option value="">No city</option> : null}
            {(type === "HOTEL" ? districtOptions : parentOptions).map(
              (option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>
      ) : null}

      {type === "HOTEL" ? (
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={location?.address ?? ""}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={location?.sortOrder ?? 0}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={location?.isActive ?? true}
        />
        Active
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/locations")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
