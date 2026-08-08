import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { LocationForm } from "@/features/admin/components/LocationForm";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import {
  isAdminLocationType,
  type AdminLocationType,
} from "@/features/admin/types/location";

const locationAdminRepository = new LocationAdminRepository(db);

const TYPE_BY_SLUG: Record<string, AdminLocationType> = {
  airports: "AIRPORT",
  cities: "CITY",
  districts: "DISTRICT",
  hotels: "HOTEL",
};

function getLocationType(typeSlug: string): AdminLocationType {
  const type = TYPE_BY_SLUG[typeSlug];

  if (!type || !isAdminLocationType(type)) {
    notFound();
  }

  return type;
}

async function loadParentOptions(type: AdminLocationType) {
  const cities = await locationAdminRepository.findCities();

  if (type === "CITY") {
    return { parentOptions: [], cityOptions: [], initialCityId: null };
  }

  if (type === "AIRPORT" || type === "DISTRICT") {
    return {
      parentOptions: cities.map((city) => ({
        id: city.id,
        label: city.defaultName,
      })),
      cityOptions: [],
      initialCityId: null,
    };
  }

  const districts = await locationAdminRepository.findByType("DISTRICT", {
    includeInactive: true,
  });

  return {
    parentOptions: districts.map((district) => ({
      id: district.id,
      label: district.defaultName,
      cityId: district.parentId ?? undefined,
    })),
    cityOptions: cities.map((city) => ({
      id: city.id,
      label: city.defaultName,
    })),
    initialCityId: cities[0]?.id ?? null,
  };
}

export default async function NewLocationPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: typeSlug } = await params;
  const type = getLocationType(typeSlug);
  const { parentOptions, cityOptions, initialCityId } =
    await loadParentOptions(type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New {type.toLowerCase()}</h1>
        <p className="text-sm text-muted-foreground">
          Create a new location record.
        </p>
      </div>

      <LocationForm
        mode="create"
        type={type}
        parentOptions={parentOptions}
        cityOptions={cityOptions}
        initialCityId={initialCityId}
      />
    </div>
  );
}
