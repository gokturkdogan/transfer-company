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

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type: typeSlug, id } = await params;
  const type = getLocationType(typeSlug);
  const location = await locationAdminRepository.findById(id);

  if (!location || location.type !== type) {
    notFound();
  }

  const { parentOptions, cityOptions, initialCityId } =
    await loadParentOptions(type);

  let hotelCityId = initialCityId;

  if (type === "HOTEL" && location.parentId) {
    const district = await locationAdminRepository.findById(location.parentId);
    hotelCityId = district?.parentId ?? initialCityId;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit {location.defaultName}</h1>
        <p className="text-sm text-muted-foreground">
          Update location details and hierarchy.
        </p>
      </div>

      <LocationForm
        mode="edit"
        type={type}
        location={location}
        parentOptions={parentOptions}
        cityOptions={cityOptions}
        initialCityId={hotelCityId}
      />
    </div>
  );
}
